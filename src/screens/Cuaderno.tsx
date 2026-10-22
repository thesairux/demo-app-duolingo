// Resolver en el cuaderno: Numi da 4 ejercicios, el niño los resuelve con lápiz y le saca una foto.
// Claude lee lo que escribió y la app corrige. Si no hay quién lea la foto, se revisa sin foto.
import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react';
import { Boton } from '../components/Boton';
import { Confeti } from '../components/Confeti';
import { IconoCamara, IconoCerrar, IconoCheck, IconoGema, IconoLapiz, IconoRayo } from '../components/Iconos';
import { Numi } from '../components/Numi';
import { useJuego } from '../hooks/useJuego';
import { useSonido } from '../hooks/useSonido';
import {
  armarHoja,
  revisarHoja,
  textoSolucion,
  TEMAS_CUADERNO,
  XP_MANUAL,
  xpRevision,
  type HojaCuaderno,
  type RevisionEjercicio,
  type TemaCuaderno,
} from '../lib/cuaderno';
import { buscarCorrector, FalloCorrector, prepararFoto, type Corrector, type MotivoFallo } from '../lib/corrector';
import type { EfectosCuaderno } from '../lib/estado';

type Fase = 'temas' | 'hoja' | 'revisando' | 'resultado' | 'manual';

const AVISO_FALLO: Record<Exclude<MotivoFallo, 'cancelado'>, string> = {
  'sin-permiso': 'La revisión con foto no está disponible en esta visita. Puedes revisar tú mismo con las respuestas.',
  ocupado: 'Numi tiene muchas revisiones en este momento. Espera unos minutos y vuelve a intentarlo, o revisa tú mismo.',
  foto: 'Esa foto no sirvió. Prueba con otra, con buena luz y sin que se mueva.',
  fallo: 'No pude revisar esta vez. Intenta con otra foto o revisa tú mismo.',
};

const EJEMPLO: Record<TemaCuaderno, string> = {
  'sumas-restas': '345 + 278',
  multiplicar: '253 × 4',
  dividir: '59 : 6',
  fracciones: '3/8 + 2/8',
  mezcla: 'Suma, ×, : y fracción',
};

const colorUnidad = (n: number) => ({ '--unidad': `var(--u${n})`, '--unidad-oscuro': `color-mix(in srgb, var(--u${n}) 62%, #000)` }) as CSSProperties;

export function Cuaderno({ onSalir }: { onSalir: () => void }) {
  const { terminarCuaderno } = useJuego();
  const sonar = useSonido();
  const [fase, setFase] = useState<Fase>('temas');
  const [hoja, setHoja] = useState<HojaCuaderno | null>(null);
  /** undefined mientras se busca; null si no hay quién lea fotos en esta visita. */
  const [corrector, setCorrector] = useState<Corrector | null | undefined>(undefined);
  const [foto, setFoto] = useState<string | null>(null);
  const [revisiones, setRevisiones] = useState<RevisionEjercicio[] | null>(null);
  const [sinEjercicios, setSinEjercicios] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [efectos, setEfectos] = useState<EfectosCuaderno | null>(null);
  const [revisoSolo, setRevisoSolo] = useState(false);
  const control = useRef<AbortController | null>(null);
  /** XP ya entregada por esta hoja y si ya contó: volver a revisarla solo suma lo que mejoró. */
  const premio = useRef({ xp: 0, contada: false });

  useEffect(() => {
    let vivo = true;
    buscarCorrector().then((c) => vivo && setCorrector(c));
    return () => {
      vivo = false;
      control.current?.abort();
    };
  }, []);

  useEffect(() => () => void (foto && URL.revokeObjectURL(foto)), [foto]);

  function nuevaHoja(tema: TemaCuaderno) {
    setHoja(armarHoja(tema));
    premio.current = { xp: 0, contada: false };
    setRevisiones(null);
    setEfectos(null);
    setAviso(null);
    setFoto(null);
    setFase('hoja');
    window.scrollTo({ top: 0 });
  }

  function entregar(xp: number) {
    const extra = Math.max(0, xp - premio.current.xp);
    const nueva = !premio.current.contada;
    if (extra > 0 || nueva) setEfectos(terminarCuaderno(extra, nueva));
    else setEfectos(null);
    premio.current = { xp: Math.max(xp, premio.current.xp), contada: true };
  }

  async function revisarFoto(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo || !hoja || !corrector) return;
    setAviso(null);
    setFase('revisando');
    window.scrollTo({ top: 0 });
    const ctl = new AbortController();
    control.current = ctl;
    const imagen = await prepararFoto(archivo);
    setFoto(URL.createObjectURL(imagen));
    try {
      const lectura = await corrector.leer(imagen, hoja.ejercicios, ctl.signal);
      if (ctl.signal.aborted) return;
      const revs = revisarHoja(hoja, lectura);
      const legibles = revs.some((r) => r.estado !== 'sin-leer');
      setSinEjercicios(!lectura.hayEjercicios || !legibles);
      setRevisiones(revs);
      setRevisoSolo(false);
      if (lectura.hayEjercicios && legibles) {
        entregar(xpRevision(revs));
        sonar(revs.every((r) => r.estado === 'bien') ? 'fin' : 'acierto');
      } else {
        setEfectos(null);
      }
      setFase('resultado');
    } catch (err) {
      const motivo = err instanceof FalloCorrector ? err.motivo : 'fallo';
      if (motivo === 'sin-permiso') setCorrector(null);
      if (motivo !== 'cancelado') setAviso(AVISO_FALLO[motivo]);
      setFase('hoja');
    }
  }

  function cancelar() {
    control.current?.abort();
    setFase('hoja');
  }

  function terminarManual(marcas: boolean[]) {
    if (!hoja) return;
    const revs: RevisionEjercicio[] = hoja.ejercicios.map((ejercicio, i) => ({ ejercicio, estado: marcas[i] ? 'bien' : 'mal', leido: null }));
    setRevisiones(revs);
    setSinEjercicios(false);
    setRevisoSolo(true);
    setFoto(null);
    entregar(revs.filter((r) => r.estado === 'bien').length * XP_MANUAL);
    sonar(marcas.every(Boolean) ? 'fin' : 'acierto');
    setFase('resultado');
  }

  const conFoto = corrector !== null;
  const tema = hoja ? TEMAS_CUADERNO[hoja.tema] : null;

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col" style={tema ? colorUnidad(tema.unidad) : undefined}>
      <header className="flex items-center gap-3 px-4 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <button
          type="button"
          aria-label={fase === 'temas' ? 'Volver a Practicar' : 'Volver a los temas'}
          className="rounded-xl p-1 text-muted"
          onClick={() => (fase === 'temas' ? onSalir() : fase === 'revisando' ? cancelar() : setFase('temas'))}
        >
          <IconoCerrar className="h-7 w-7" />
        </button>
        <p className="text-xs font-extrabold uppercase tracking-[.1em] text-muted">Resuelve en tu cuaderno{tema ? ` · ${tema.nombre}` : ''}</p>
      </header>

      <main className="grid flex-1 content-start gap-5 px-4 pb-10 pt-3">
        {fase === 'temas' && <Temas conFoto={conFoto} onElegir={nuevaHoja} />}

        {fase === 'hoja' && hoja && (
          <>
            <div className="grid gap-1">
              <h1 className="text-[28px] font-bold leading-tight">Copia y resuelve en tu cuaderno</h1>
              <p className="text-muted">Usa lápiz y haz el desarrollo al lado si lo necesitas.</p>
            </div>
            <ListaEjercicios hoja={hoja} />
            <Instrucciones hoja={hoja} conFoto={conFoto} />
            {aviso && (
              <p role="alert" className="rounded-2xl bg-bad-soft px-4 py-3 font-bold text-bad-text">
                {aviso}
              </p>
            )}
            <div className="grid gap-3">
              {conFoto && (
                <>
                  <BotonFoto camara onChange={revisarFoto} cargando={corrector === undefined}>
                    <IconoCamara className="h-6 w-6" />
                    {corrector === undefined ? 'Preparando…' : 'Sacar foto al cuaderno'}
                  </BotonFoto>
                  <BotonFoto onChange={revisarFoto} cargando={corrector === undefined} suave>
                    Elegir una foto guardada
                  </BotonFoto>
                </>
              )}
              <Boton ancho variante={conFoto ? 'suave' : 'principal'} onClick={() => setFase('manual')}>
                <IconoLapiz className="h-5 w-5" />
                Revisar yo mismo
              </Boton>
              <button type="button" className="mx-auto rounded-xl px-3 py-2 text-sm font-extrabold text-muted underline underline-offset-4" onClick={() => nuevaHoja(hoja.tema)}>
                Dame otros ejercicios
              </button>
            </div>
            <p className="text-center text-xs font-semibold text-muted">
              {conFoto
                ? 'La foto se usa solo para leer tus respuestas. Fíjate que no salgan caras ni nombres.'
                : 'La revisión con foto no está disponible aquí, pero puedes revisar tú mismo con las respuestas.'}
            </p>
          </>
        )}

        {fase === 'revisando' && (
          <div className="grid justify-items-center gap-5 pt-4 text-center" role="status">
            {foto && <img src={foto} alt="Tu foto del cuaderno" className="max-h-[42vh] w-auto max-w-full rounded-2xl border-2 border-line object-contain" />}
            <Numi expresion="pensando" className="h-auto w-28" />
            <div className="grid gap-1">
              <p className="font-display text-2xl font-semibold">Numi está revisando tu cuaderno…</p>
              <p className="text-muted">Esto puede tardar unos segundos.</p>
            </div>
            <Boton variante="suave" onClick={cancelar}>
              Cancelar
            </Boton>
          </div>
        )}

        {fase === 'manual' && hoja && <RevisarSolo hoja={hoja} onListo={terminarManual} />}

        {fase === 'resultado' && hoja && revisiones && (
          <Resultado
            revisiones={revisiones}
            sinEjercicios={sinEjercicios}
            revisoSolo={revisoSolo}
            foto={foto}
            efectos={efectos}
            acciones={
              <>
                {conFoto && (sinEjercicios || revisiones.some((r) => r.estado !== 'bien')) && (
                  <BotonFoto camara onChange={revisarFoto}>
                    <IconoCamara className="h-6 w-6" />
                    {sinEjercicios ? 'Sacar otra foto' : 'Corregir y sacar otra foto'}
                  </BotonFoto>
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

function Temas({ conFoto, onElegir }: { conFoto: boolean; onElegir: (t: TemaCuaderno) => void }) {
  return (
    <>
      <section className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
        <Numi expresion="feliz" className="h-auto w-[88px]" />
        <div className="grid gap-1">
          <h1 className="text-[28px] font-bold leading-tight">Resuelve en tu cuaderno</h1>
          <p className="text-muted">
            {conFoto
              ? 'Elige un tema. Te doy 4 ejercicios, los resuelves con lápiz y le sacas una foto. ¡Yo reviso si están bien!'
              : 'Elige un tema. Te doy 4 ejercicios, los resuelves con lápiz y después comparas con las respuestas.'}
          </p>
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

function ListaEjercicios({ hoja }: { hoja: HojaCuaderno }) {
  return (
    <ol className="grid gap-2.5 rounded-[22px] border-2 border-line bg-surface p-4" aria-label="Ejercicios para copiar">
      {hoja.ejercicios.map((e) => (
        <li key={e.numero} className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full font-display text-lg font-semibold text-white" style={{ background: 'var(--unidad)' }}>
            {e.numero}
          </span>
          <span className="font-display text-[28px] font-semibold tabular-nums leading-tight">
            {e.enunciado} <span className="text-line-deep">____</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function Instrucciones({ hoja, conFoto }: { hoja: HojaCuaderno; conFoto: boolean }) {
  const hayDivision = hoja.ejercicios.some((e) => e.solucion.tipo === 'division');
  const pasos = [
    'Escribe el número de cada ejercicio y resuélvelo.',
    hayDivision ? 'Si en una división sobra algo, anota el resto. Ejemplo: 9 resto 5.' : null,
    conFoto ? 'Encierra cada resultado en un círculo.' : null,
    conFoto ? 'Saca una foto donde se vean los 4 ejercicios, con buena luz.' : 'Cuando termines, toca «Revisar yo mismo».',
  ].filter((p): p is string => !!p);
  return (
    <ol className="grid gap-2 rounded-2xl bg-surface-2 px-4 py-3.5">
      {pasos.map((p, i) => (
        <li key={p} className="grid grid-cols-[24px_minmax(0,1fr)] gap-2 font-semibold">
          <span className="font-black tabular-nums" style={{ color: 'var(--unidad)' }}>
            {i + 1}.
          </span>
          {p}
        </li>
      ))}
    </ol>
  );
}

/** Un botón que abre la cámara (o la galería). Es un <label> con el input de archivo adentro. */
function BotonFoto({ camara = false, suave = false, cargando = false, onChange, children }: { camara?: boolean; suave?: boolean; cargando?: boolean; onChange: (e: ChangeEvent<HTMLInputElement>) => void; children: ReactNode }) {
  const estilo = suave ? ({ '--btn-bg': 'var(--surface)', '--btn-fg': 'var(--ink)', '--btn-shadow': 'var(--line-deep)' } as CSSProperties) : undefined;
  return (
    <label
      aria-disabled={cargando}
      className={`btn-3d inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[15px] font-extrabold uppercase tracking-wider focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-select ${
        suave ? 'border-2 border-line' : ''
      } ${cargando ? 'pointer-events-none opacity-60' : ''}`}
      style={estilo}
    >
      {children}
      <input type="file" accept="image/*" capture={camara ? 'environment' : undefined} className="sr-only" disabled={cargando} onChange={onChange} />
    </label>
  );
}

function RevisarSolo({ hoja, onListo }: { hoja: HojaCuaderno; onListo: (marcas: boolean[]) => void }) {
  const [marcas, setMarcas] = useState<(boolean | null)[]>(() => hoja.ejercicios.map(() => null));
  const listo = marcas.every((m) => m !== null);
  return (
    <>
      <div className="grid gap-1">
        <h1 className="text-[28px] font-bold leading-tight">Revisa tú mismo</h1>
        <p className="text-muted">Compara cada respuesta con tu cuaderno y marca cómo te fue.</p>
      </div>
      <ol className="grid gap-3">
        {hoja.ejercicios.map((e, i) => (
          <li key={e.numero} className="grid gap-3 rounded-2xl border-2 border-line bg-surface p-4">
            <p className="font-display text-2xl font-semibold tabular-nums">
              <span className="text-muted">{e.numero})</span> {e.enunciado} <span style={{ color: 'var(--unidad)' }}>{textoSolucion(e.solucion)}</span>
            </p>
            <details className="text-[15px]">
              <summary className="cursor-pointer font-extrabold text-muted">Ver cómo se hace</summary>
              <p className="mt-1.5">{e.desarrollo}</p>
            </details>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label={`Ejercicio ${e.numero}`}>
              {[true, false].map((igual) => (
                <button
                  key={String(igual)}
                  type="button"
                  aria-pressed={marcas[i] === igual}
                  onClick={() => setMarcas((m) => m.map((x, k) => (k === i ? igual : x)))}
                  className={`opcion rounded-xl px-2 py-2.5 text-[14px] font-extrabold ${marcas[i] === igual ? (igual ? 'acierto' : 'error') : ''}`}
                >
                  {igual ? 'Me salió igual' : 'Me salió distinto'}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <Boton ancho disabled={!listo} onClick={() => onListo(marcas.map(Boolean))}>
        Listo
      </Boton>
    </>
  );
}

function Resultado({
  revisiones,
  sinEjercicios,
  revisoSolo,
  foto,
  efectos,
  acciones,
}: {
  revisiones: RevisionEjercicio[];
  sinEjercicios: boolean;
  revisoSolo: boolean;
  foto: string | null;
  efectos: EfectosCuaderno | null;
  acciones: ReactNode;
}) {
  const bien = revisiones.filter((r) => r.estado === 'bien').length;
  const perfecta = !sinEjercicios && bien === revisiones.length;

  if (sinEjercicios) {
    return (
      <div className="grid justify-items-center gap-4 pt-2 text-center">
        <Numi expresion="preocupada" className="h-auto w-32" />
        <h1 className="text-[28px] font-bold leading-tight">No pude leer tus ejercicios</h1>
        <ul className="grid gap-1.5 text-left text-[15px] font-semibold text-muted">
          <li>· Que se vean los 4 ejercicios con su número.</li>
          <li>· Con buena luz y sin sombras encima.</li>
          <li>· Con el celular quieto, para que no salga borrosa.</li>
        </ul>
        {foto && <img src={foto} alt="La foto que mandaste" className="max-h-[30vh] w-auto max-w-full rounded-2xl border-2 border-line object-contain" />}
        <div className="grid w-full gap-3">{acciones}</div>
      </div>
    );
  }

  return (
    <>
      <Confeti disparo={perfecta} cantidad={56} />
      <section className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
        <Numi expresion={perfecta ? 'celebrando' : bien > 0 ? 'feliz' : 'pensando'} className="h-auto w-24" />
        <div className="grid gap-1">
          <h1 className="text-[28px] font-bold leading-tight">{perfecta ? '¡Todo bien!' : bien === 0 ? 'Vamos a revisarlos juntos' : `${bien} de ${revisiones.length} bien`}</h1>
          <p className="text-muted">
            {revisoSolo
              ? perfecta
                ? 'Todos te salieron igual. ¡Muy bien!'
                : 'Mira cómo se hacen los que te salieron distinto.'
              : perfecta
                ? `Revisé los ${revisiones.length} ejercicios y están correctos.`
                : 'Mira cómo se hacen los que no salieron, corrígelos y saca otra foto.'}
          </p>
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
          <TarjetaRevision key={r.ejercicio.numero} r={r} revisoSolo={revisoSolo} />
        ))}
      </ol>

      {foto && (
        <details className="rounded-2xl border-2 border-line bg-surface px-4 py-3">
          <summary className="cursor-pointer font-extrabold text-muted">Ver la foto que revisé</summary>
          <img src={foto} alt="La foto que revisó Numi" className="mt-3 max-h-[50vh] w-auto max-w-full rounded-xl object-contain" />
        </details>
      )}

      <div className="grid gap-3">{acciones}</div>
    </>
  );
}

const MARCA = {
  bien: { fondo: 'var(--ok-soft)', borde: 'var(--ok)', texto: 'var(--ok-text)' },
  mal: { fondo: 'var(--bad-soft)', borde: 'var(--bad)', texto: 'var(--bad-text)' },
  'sin-leer': { fondo: 'var(--surface)', borde: 'var(--line-deep)', texto: 'var(--muted)' },
};

function TarjetaRevision({ r, revisoSolo }: { r: RevisionEjercicio; revisoSolo: boolean }) {
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
        {r.estado === 'bien'
          ? revisoSolo
            ? 'Te salió igual. ¡Correcto!'
            : `Escribiste ${r.leido}. ¡Correcto!`
          : r.estado === 'mal'
            ? `${revisoSolo || !r.leido ? '' : `Escribiste ${r.leido}. `}La respuesta es ${correcta}.`
            : 'No pude leer este ejercicio. Revisa que se vea en la foto con su número.'}
      </p>
      {r.nota && <p className="text-[15px] font-semibold">{r.nota}</p>}
      {r.estado === 'mal' && <p className="rounded-xl bg-surface px-3 py-2 text-[15px]">{r.ejercicio.desarrollo}</p>}
    </li>
  );
}
