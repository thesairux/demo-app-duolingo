// Resolver en el cuaderno: Numi da 4 ejercicios, el niño los resuelve con lápiz y escribe aquí sus resultados.
// La app los revisa al tiro y muestra cómo se hace el que quedó mal.
import { useState, type CSSProperties, type ReactNode } from 'react';
import { Boton } from '../components/Boton';
import { Confeti } from '../components/Confeti';
import { IconoCerrar, IconoCheck, IconoGema, IconoRayo } from '../components/Iconos';
import { Numi } from '../components/Numi';
import { useJuego } from '../hooks/useJuego';
import { useSonido } from '../hooks/useSonido';
import {
  armarHoja,
  revisarHoja,
  textoSolucion,
  TEMAS_CUADERNO,
  xpRevision,
  type EjercicioCuaderno,
  type HojaCuaderno,
  type RevisionEjercicio,
  type TemaCuaderno,
} from '../lib/cuaderno';
import type { EfectosActividad } from '../lib/estado';

type Fase = 'temas' | 'hoja' | 'resultado';

const EJEMPLO: Record<TemaCuaderno, string> = {
  'sumas-restas': '345 + 278',
  multiplicar: '253 × 4',
  dividir: '59 : 6',
  fracciones: '3/8 + 2/8',
  mezcla: 'Suma, ×, : y fracción',
};

const colorUnidad = (n: number) => ({ '--unidad': `var(--u${n})`, '--unidad-oscuro': `color-mix(in srgb, var(--u${n}) 62%, #000)` }) as CSSProperties;
/** Casillas vacías para cada ejercicio: dos para divisiones (cociente y resto) y fracciones (numerador y denominador). */
const casillasVacias = (hoja: HojaCuaderno) => hoja.ejercicios.map((e) => (e.solucion.tipo === 'entero' ? [''] : ['', '']));

export function Cuaderno({ onSalir }: { onSalir: () => void }) {
  const { terminarCuaderno } = useJuego();
  const sonar = useSonido();
  const [fase, setFase] = useState<Fase>('temas');
  const [hoja, setHoja] = useState<HojaCuaderno | null>(null);
  const [casillas, setCasillas] = useState<string[][]>([]);
  const [revisiones, setRevisiones] = useState<RevisionEjercicio[] | null>(null);
  const [efectos, setEfectos] = useState<EfectosActividad | null>(null);
  /** XP ya entregada por esta hoja y si ya contó: corregir y revisar de nuevo solo suma lo que mejoró. */
  const [premio, setPremio] = useState({ xp: 0, contada: false });

  function nuevaHoja(tema: TemaCuaderno) {
    const h = armarHoja(tema);
    setHoja(h);
    setCasillas(casillasVacias(h));
    setPremio({ xp: 0, contada: false });
    setRevisiones(null);
    setEfectos(null);
    setFase('hoja');
    window.scrollTo({ top: 0 });
  }

  function revisar() {
    if (!hoja) return;
    const revs = revisarHoja(hoja, casillas);
    const xp = xpRevision(revs);
    const extra = Math.max(0, xp - premio.xp);
    setEfectos(extra > 0 || !premio.contada ? terminarCuaderno(extra, !premio.contada) : null);
    setPremio({ xp: Math.max(xp, premio.xp), contada: true });
    setRevisiones(revs);
    sonar(revs.every((r) => r.estado === 'bien') ? 'fin' : 'acierto');
    setFase('resultado');
    window.scrollTo({ top: 0 });
  }

  const tema = hoja ? TEMAS_CUADERNO[hoja.tema] : null;
  const completa = hoja?.ejercicios.every((e, i) => casillas[i]?.[0]?.trim() && (e.solucion.tipo !== 'fraccion' || casillas[i]?.[1]?.trim()));

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col" style={tema ? colorUnidad(tema.unidad) : undefined}>
      <header className="flex items-center gap-3 px-4 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <button
          type="button"
          aria-label={fase === 'temas' ? 'Volver a Practicar' : 'Volver a los temas'}
          className="rounded-xl p-1 text-muted"
          onClick={() => (fase === 'temas' ? onSalir() : setFase('temas'))}
        >
          <IconoCerrar className="h-7 w-7" />
        </button>
        <p className="text-xs font-extrabold uppercase tracking-[.1em] text-muted">Resuelve en tu cuaderno{tema ? ` · ${tema.nombre}` : ''}</p>
      </header>

      <main className="grid flex-1 content-start gap-5 px-4 pb-10 pt-3">
        {fase === 'temas' && <Temas onElegir={nuevaHoja} />}

        {fase === 'hoja' && hoja && (
          <>
            <div className="grid gap-1">
              <h1 className="text-[28px] font-bold leading-tight">Resuelve en tu cuaderno</h1>
              <p className="text-muted">Copia cada ejercicio, resuélvelo con lápiz y escribe aquí tu resultado.</p>
            </div>
            <ol className="grid gap-3" aria-label="Ejercicios">
              {hoja.ejercicios.map((e, i) => (
                <FilaEjercicio
                  key={e.numero}
                  ejercicio={e}
                  valores={casillas[i] ?? []}
                  onCambiar={(k, valor) => setCasillas((c) => c.map((fila, j) => (j === i ? fila.map((x, m) => (m === k ? valor : x)) : fila)))}
                />
              ))}
            </ol>
            {hoja.ejercicios.some((e) => e.solucion.tipo === 'division') && (
              <p className="rounded-2xl bg-surface-2 px-4 py-3 text-[15px] font-semibold">En las divisiones, si sobra algo, escribe el resto en la casilla chica. Si no sobra nada, déjala en blanco.</p>
            )}
            <div className="grid gap-3">
              <Boton ancho disabled={!completa} onClick={revisar}>
                Revisar
              </Boton>
              <button type="button" className="mx-auto rounded-xl px-3 py-2 text-sm font-extrabold text-muted underline underline-offset-4" onClick={() => nuevaHoja(hoja.tema)}>
                Dame otros ejercicios
              </button>
            </div>
          </>
        )}

        {fase === 'resultado' && hoja && revisiones && (
          <Resultado
            revisiones={revisiones}
            efectos={efectos}
            acciones={
              <>
                {revisiones.some((r) => r.estado !== 'bien') && (
                  <Boton ancho onClick={() => setFase('hoja')}>
                    Corregir mis resultados
                  </Boton>
                )}
                <Boton ancho variante={revisiones.every((r) => r.estado === 'bien') ? 'principal' : 'suave'} onClick={() => nuevaHoja(hoja.tema)}>
                  Otros ejercicios
                </Boton>
                <Boton ancho variante="suave" onClick={onSalir}>
                  Volver a Practicar
                </Boton>
              </>
            }
          />
        )}
      </main>
    </div>
  );
}

function Temas({ onElegir }: { onElegir: (t: TemaCuaderno) => void }) {
  return (
    <>
      <section className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
        <Numi expresion="feliz" className="h-auto w-[88px]" />
        <div className="grid gap-1">
          <h1 className="text-[28px] font-bold leading-tight">Resuelve en tu cuaderno</h1>
          <p className="text-muted">Elige un tema. Te doy 4 ejercicios, los resuelves con lápiz y escribes aquí tus resultados. ¡Yo reviso si están bien!</p>
        </div>
      </section>
      <ul className="grid gap-3">
        {(Object.keys(TEMAS_CUADERNO) as TemaCuaderno[]).map((t) => {
          const d = TEMAS_CUADERNO[t];
          return (
            <li key={t}>
              <button
                type="button"
                onClick={() => onElegir(t)}
                className="opcion grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
                style={{ borderColor: `color-mix(in srgb, var(--u${d.unidad}) 55%, var(--line))` }}
              >
                <span className="grid gap-0.5">
                  <span className="font-display text-xl font-semibold">{d.nombre}</span>
                  <span className="text-sm font-semibold text-muted">{d.detalle}</span>
                </span>
                <span className="rounded-xl px-2.5 py-1 font-display text-[15px] font-semibold tabular-nums" style={{ background: `color-mix(in srgb, var(--u${d.unidad}) 18%, var(--surface))` }}>
                  {EJEMPLO[t]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Casilla({ valor, etiqueta, chica = false, onCambiar }: { valor: string; etiqueta: string; chica?: boolean; onCambiar: (v: string) => void }) {
  return (
    <input
      value={valor}
      inputMode="numeric"
      autoComplete="off"
      maxLength={6}
      aria-label={etiqueta}
      onChange={(e) => onCambiar(e.target.value.replace(/[^\d.]/g, ''))}
      className={`rounded-xl border-2 border-line-deep bg-surface-2 px-2 py-1.5 text-center font-display text-[24px] font-semibold tabular-nums outline-none focus:border-[var(--unidad)] ${
        chica ? 'w-14' : 'w-24'
      }`}
    />
  );
}

function FilaEjercicio({ ejercicio: e, valores, onCambiar }: { ejercicio: EjercicioCuaderno; valores: string[]; onCambiar: (casilla: number, valor: string) => void }) {
  return (
    <li className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-2xl border-2 border-line bg-surface p-3">
      <span className="grid h-10 w-10 place-items-center rounded-full font-display text-lg font-semibold text-white" style={{ background: 'var(--unidad)' }}>
        {e.numero}
      </span>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <span className="font-display text-[26px] font-semibold tabular-nums leading-tight">{e.enunciado}</span>
        {e.solucion.tipo === 'entero' && <Casilla valor={valores[0] ?? ''} etiqueta={`Resultado del ejercicio ${e.numero}`} onCambiar={(v) => onCambiar(0, v)} />}
        {e.solucion.tipo === 'division' && (
          <span className="inline-flex items-center gap-2">
            <Casilla valor={valores[0] ?? ''} etiqueta={`Resultado del ejercicio ${e.numero}`} onCambiar={(v) => onCambiar(0, v)} />
            <span className="text-sm font-extrabold text-muted">resto</span>
            <Casilla chica valor={valores[1] ?? ''} etiqueta={`Resto del ejercicio ${e.numero}`} onCambiar={(v) => onCambiar(1, v)} />
          </span>
        )}
        {e.solucion.tipo === 'fraccion' && (
          <span className="inline-flex items-center gap-1.5">
            <Casilla chica valor={valores[0] ?? ''} etiqueta={`Numerador del ejercicio ${e.numero}`} onCambiar={(v) => onCambiar(0, v)} />
            <span className="font-display text-[26px] font-semibold">/</span>
            <Casilla chica valor={valores[1] ?? ''} etiqueta={`Denominador del ejercicio ${e.numero}`} onCambiar={(v) => onCambiar(1, v)} />
          </span>
        )}
      </div>
    </li>
  );
}

function Resultado({ revisiones, efectos, acciones }: { revisiones: RevisionEjercicio[]; efectos: EfectosActividad | null; acciones: ReactNode }) {
  const bien = revisiones.filter((r) => r.estado === 'bien').length;
  const perfecta = bien === revisiones.length;
  return (
    <>
      <Confeti disparo={perfecta} cantidad={56} />
      <section className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
        <Numi expresion={perfecta ? 'celebrando' : bien > 0 ? 'feliz' : 'pensando'} className="h-auto w-24" />
        <div className="grid gap-1">
          <h1 className="text-[28px] font-bold leading-tight">{perfecta ? '¡Todo bien!' : bien === 0 ? 'Vamos a revisarlos juntos' : `${bien} de ${revisiones.length} bien`}</h1>
          <p className="text-muted">{perfecta ? `Los ${revisiones.length} ejercicios están correctos.` : 'Mira cómo se hacen los que no salieron, corrígelos en tu cuaderno y vuelve a revisar.'}</p>
        </div>
      </section>

      {efectos && (efectos.xpGanada > 0 || efectos.gemas.length > 0) && (
        <ul className="grid gap-1.5 rounded-2xl bg-surface-2 px-4 py-3 text-[15px]">
          {efectos.xpGanada > 0 && (
            <li className="flex justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <IconoRayo className="h-5 w-5" /> XP ganada
              </span>
              <span className="font-extrabold tabular-nums">+{efectos.xpGanada} XP</span>
            </li>
          )}
          {efectos.gemas.map((g) => (
            <li key={g.motivo} className="flex justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <IconoGema className="h-5 w-5" /> {g.motivo}
              </span>
              <span className="font-extrabold tabular-nums">+{g.gemas}</span>
            </li>
          ))}
        </ul>
      )}

      <ol className="grid gap-3">
        {revisiones.map((r) => (
          <TarjetaRevision key={r.ejercicio.numero} r={r} />
        ))}
      </ol>

      <div className="grid gap-3">{acciones}</div>
    </>
  );
}

const MARCA = {
  bien: { fondo: 'var(--ok-soft)', borde: 'var(--ok)', texto: 'var(--ok-text)' },
  mal: { fondo: 'var(--bad-soft)', borde: 'var(--bad)', texto: 'var(--bad-text)' },
  'en-blanco': { fondo: 'var(--surface)', borde: 'var(--line-deep)', texto: 'var(--muted)' },
};

function TarjetaRevision({ r }: { r: RevisionEjercicio }) {
  const m = MARCA[r.estado];
  const correcta = textoSolucion(r.ejercicio.solucion);
  return (
    <li className="grid gap-2 rounded-2xl border-2 p-4" style={{ background: m.fondo, borderColor: m.borde }}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <p className="font-display text-[22px] font-semibold tabular-nums leading-snug">
          <span className="text-muted">{r.ejercicio.numero})</span> {r.ejercicio.enunciado} {r.estado === 'bien' ? correcta : ''}
        </p>
        <span className="grid h-9 w-9 place-items-center rounded-full font-black text-white" style={{ background: m.borde }} aria-hidden="true">
          {r.estado === 'bien' ? <IconoCheck className="h-5 w-5" /> : r.estado === 'mal' ? '✗' : '?'}
        </span>
      </div>
      <p className="font-bold" style={{ color: m.texto }}>
        {r.estado === 'bien' ? `Escribiste ${r.leido}. ¡Correcto!` : r.estado === 'mal' ? `Escribiste ${r.leido}. La respuesta es ${correcta}.` : `Te faltó escribir este resultado. La respuesta es ${correcta}.`}
      </p>
      {r.nota && <p className="text-[15px] font-semibold">{r.nota}</p>}
      {r.estado !== 'bien' && <p className="rounded-xl bg-surface px-3 py-2 text-[15px]">{r.ejercicio.desarrollo}</p>}
    </li>
  );
}
