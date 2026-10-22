// Camino de aprendizaje: unidades con color propio, nodos en zigzag, cofres y checkpoints.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { BarraSuperior } from '../components/BarraSuperior';
import { Boton } from '../components/Boton';
import { CofreAnimado, type FaseCofre } from '../components/CofreAnimado';
import { Confeti } from '../components/Confeti';
import { Hoja } from '../components/Hoja';
import { IconoCorona, IconoGema, IconoLapiz, IconoRayo } from '../components/Iconos';
import { Numi, type Expresion } from '../components/Numi';
import { NodoEspecial, NodoLeccion, type EstadoEspecial } from '../components/NodoCamino';
import { LECCIONES, leccionesDeUnidad, UNIDADES, type LeccionUbicada } from '../content';
import type { Unidad } from '../content/types';
import { useAviso } from '../hooks/useAviso';
import { useJuego } from '../hooks/useJuego';
import { useMovimiento } from '../hooks/useMovimiento';
import { useReloj } from '../hooks/useReloj';
import { useSonido } from '../hooks/useSonido';
import { cofreDisponible } from '../lib/estado';
import { claveDia, formatoMinutos } from '../lib/fechas';
import { frase } from '../lib/frases';
import { coronasDe, estaDesbloqueada, estadoNodo, leccionActual } from '../lib/progreso';
import { estadoRacha } from '../lib/racha';
import { APROBAR_CHECKPOINT, CORONAS_MAX, EJERCICIOS_CHECKPOINT, EJERCICIOS_POR_SESION, EJERCICIOS_REPASO, ERRORES_LEGENDARIO } from '../lib/sesion';
import { msParaProximaVida, recargar } from '../lib/vidas';

/** Zigzag del camino, en píxeles. */
const ZIGZAG = [0, -48, -72, -48, 0, 48, 72, 48];

export const NIVELES = ['Lo básico', 'Un poco más', 'Problemas de la vida real'];

export type AccionCamino =
  | { tipo: 'leccion' | 'guia' | 'repaso' | 'legendario'; leccionId: string }
  | { tipo: 'checkpoint'; unidad: number }
  | { tipo: 'practicar' }
  | { tipo: 'cuaderno' }
  | { tipo: 'desafio' };

function colorUnidad(n: number): CSSProperties {
  return { '--unidad': `var(--u${n})`, '--unidad-oscuro': `color-mix(in srgb, var(--u${n}) 62%, #000)` } as CSSProperties;
}

export function Camino({ onAccion }: { onAccion: (accion: AccionCamino) => void }) {
  const { estado, abrirCofre } = useJuego();
  const { avisar, elemento: aviso } = useAviso();
  const [leccionAbierta, setLeccionAbierta] = useState<LeccionUbicada | null>(null);
  const [checkpointAbierto, setCheckpointAbierto] = useState<Unidad | null>(null);
  const [cofre, setCofre] = useState<{ gemas: number; logros: string[]; fase: FaseCofre } | null>(null);
  const sonar = useSonido();
  const movimiento = useMovimiento();
  const actual = useMemo(() => leccionActual(LECCIONES, estado.lecciones), [estado.lecciones]);
  const refActual = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Solo al entrar al camino: lleva la vista a la lección que toca.
    if (actual && actual.orden > 0) refActual.current?.scrollIntoView({ block: 'center' });
  }, []);

  const hoy = claveDia();
  const racha = estadoRacha(estado.racha, hoy);
  const expresion: Expresion = racha.estado === 'en-peligro' ? 'preocupada' : racha.estado === 'perdida' ? 'triste' : 'feliz';
  const saludo = useMemo(
    () =>
      racha.estado === 'en-peligro'
        ? frase('rachaEnPeligro')
        : racha.estado === 'perdida'
          ? frase('rachaPerdida')
          : racha.estado === 'sin-empezar'
            ? frase('bienvenida')
            : frase('camino'),
    [racha.estado],
  );
  const apodo = estado.perfil?.apodo;

  function tocarCofre(unidad: Unidad) {
    if (estado.cofres[`u${unidad.unidad}`]) return avisar('Ya abriste este cofre.');
    if (!cofreDisponible(estado, unidad.unidad)) return avisar(`Completa la lección ${unidad.cofreDespuesDe} para abrir este cofre.`);
    const r = abrirCofre(unidad.unidad);
    setCofre({ gemas: r.gemas, logros: r.logrosNuevos.map((l) => `${l.titulo} (+${l.gemas})`), fase: 'cerrado' });
  }

  /** Las gemas ya se sumaron al tocar el nodo; esto es la animación de abrirlo. */
  function destaparCofre() {
    if (!cofre || cofre.fase !== 'cerrado') return;
    sonar('moneda');
    setCofre({ ...cofre, fase: 'abriendo' });
    window.setTimeout(
      () => {
        setCofre((c) => c && { ...c, fase: 'abierto' });
        if (cofre.logros.length) sonar('logro');
      },
      movimiento ? 750 : 0,
    );
  }

  return (
    <div className="min-h-full">
      <BarraSuperior onPracticar={() => onAccion({ tipo: 'practicar' })} />
      {aviso}
      <main className="mx-auto grid max-w-xl gap-8 px-4 pb-28 pt-5">
        <section className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-3 rounded-[22px] border-2 border-line bg-surface p-3.5">
          <Numi expresion={expresion} className="h-auto w-[76px]" />
          <div className="grid gap-2">
            <p className="font-extrabold leading-snug">
              {apodo && racha.estado !== 'sin-empezar' && <span className="block text-sm font-black text-muted">¡Hola, {apodo}!</span>}
              {saludo}
            </p>
            {actual && (
              <Boton className="w-fit px-4! py-2.5! text-[13px]!" onClick={() => setLeccionAbierta(actual)}>
                Continuar
              </Boton>
            )}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => onAccion({ tipo: 'desafio' })} className="opcion grid content-start gap-1.5 rounded-[22px] p-3.5 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-soft">
              <IconoRayo className="h-6 w-6" />
            </span>
            <span className="font-display text-lg font-semibold leading-tight">Desafío relámpago</span>
            <span className="text-[13px] font-semibold leading-snug text-muted">Cálculo mental en 60 segundos.{estado.mejorDesafio > 0 ? ` Récord: ${estado.mejorDesafio}.` : ''}</span>
          </button>
          <button type="button" onClick={() => onAccion({ tipo: 'cuaderno' })} className="opcion grid content-start gap-1.5 rounded-[22px] p-3.5 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-select-soft">
              <IconoLapiz className="h-6 w-6" />
            </span>
            <span className="font-display text-lg font-semibold leading-tight">Resuelve en tu cuaderno</span>
            <span className="text-[13px] font-semibold leading-snug text-muted">Ejercicios con lápiz que Numi revisa.</span>
          </button>
        </div>

        {UNIDADES.map((unidad) => {
          const deUnidad = leccionesDeUnidad(unidad.unidad);
          const hechas = deUnidad.filter((l) => coronasDe(estado.lecciones, l.leccion.id) > 0).length;
          const cp = estado.checkpoints[`u${unidad.unidad}`];
          const estadoCofre: EstadoEspecial = estado.cofres[`u${unidad.unidad}`] ? 'hecho' : cofreDisponible(estado, unidad.unidad) ? 'disponible' : 'bloqueado';
          const estadoCheckpoint: EstadoEspecial = cp?.aprobado ? 'hecho' : estaDesbloqueada(LECCIONES, estado.lecciones, deUnidad[0].orden) ? 'disponible' : 'bloqueado';
          let paso = 0;
          return (
            <section key={unidad.unidad} className="grid gap-2" style={colorUnidad(unidad.unidad)} aria-labelledby={`unidad-${unidad.unidad}`}>
              <header className="grid gap-1 rounded-[20px] px-4 py-3.5 text-white" style={{ background: 'var(--unidad)', boxShadow: '0 5px 0 var(--unidad-oscuro)' }}>
                <p className="text-xs font-extrabold uppercase tracking-[.1em] opacity-90">
                  Unidad {unidad.unidad} · {hechas}/{deUnidad.length} lecciones
                </p>
                <h2 id={`unidad-${unidad.unidad}`} className="text-[22px] font-semibold leading-tight">
                  {unidad.titulo}
                </h2>
                <p className="text-sm font-semibold opacity-95">{unidad.descripcion.split('. ')[0].replace(/\.$/, '')}.</p>
              </header>

              <div className="grid justify-items-center gap-7 pb-2 pt-12">
                {deUnidad.map((l, i) => {
                  const est = estadoNodo(LECCIONES, estado.lecciones, l.orden);
                  const coronas = coronasDe(estado.lecciones, l.leccion.id);
                  const esActual = actual?.leccion.id === l.leccion.id;
                  const x = ZIGZAG[paso++ % ZIGZAG.length];
                  const nodos = [
                    <div key={l.leccion.id} ref={esActual ? refActual : undefined} className="relative grid w-full justify-items-center">
                      <NodoLeccion
                        estado={est}
                        coronas={coronas}
                        esCaso={l.leccion.tipoNodo === 'caso_practico'}
                        esActual={esActual}
                        desplazamiento={x}
                        etiqueta={`${l.leccion.titulo}. ${est === 'bloqueado' ? 'Bloqueada' : est === 'legendario' ? 'Legendaria' : `${coronas} de ${CORONAS_MAX} coronas`}`}
                        onClick={() => (est === 'bloqueado' ? avisar('Completa la lección anterior o aprueba el checkpoint de la unidad.') : setLeccionAbierta(l))}
                      />
                      {esActual && <Numi expresion={expresion} className={`absolute top-1/2 h-auto w-20 -translate-y-1/2 ${x <= 0 ? 'right-2' : 'left-2'}`} />}
                    </div>,
                  ];
                  if (i + 1 === unidad.cofreDespuesDe) {
                    nodos.push(
                      <NodoEspecial
                        key={`cofre-${unidad.unidad}`}
                        tipo="cofre"
                        estado={estadoCofre}
                        desplazamiento={ZIGZAG[paso++ % ZIGZAG.length]}
                        etiqueta={estadoCofre === 'hecho' ? 'Cofre abierto' : estadoCofre === 'disponible' ? 'Abrir cofre con gemas' : 'Cofre bloqueado'}
                        onClick={() => tocarCofre(unidad)}
                      />,
                    );
                  }
                  return nodos;
                })}
                <NodoEspecial
                  tipo="checkpoint"
                  estado={estadoCheckpoint}
                  desplazamiento={ZIGZAG[paso++ % ZIGZAG.length]}
                  etiqueta={`Checkpoint de la unidad ${unidad.unidad}${cp?.aprobado ? ': aprobado' : ''}`}
                  onClick={() => (estadoCheckpoint === 'bloqueado' ? avisar('Llega a esta unidad para intentar su checkpoint.') : setCheckpointAbierto(unidad))}
                />
              </div>
            </section>
          );
        })}

        <footer className="grid gap-1 text-center text-sm text-muted">
          <p>Contenido de ejemplo basado en las Bases Curriculares de Matemática de 4° básico (Mineduc).</p>
          <p>
            <span className="font-extrabold text-ink">Versión demo</span> · El mismo juego se adapta a cualquier asignatura y curso.
          </p>
        </footer>
      </main>

      <HojaLeccion l={leccionAbierta} onCerrar={() => setLeccionAbierta(null)} onAccion={onAccion} />
      <HojaCheckpoint unidad={checkpointAbierto} onCerrar={() => setCheckpointAbierto(null)} onAccion={onAccion} />
      <Confeti disparo={cofre?.fase === 'abierto' ? cofre.gemas : 0} />
      <Hoja abierta={!!cofre} onCerrar={() => setCofre(null)} titulo="Cofre">
        <div className="grid justify-items-center gap-3 text-center">
          <h2 className="text-2xl font-bold">{cofre?.fase === 'abierto' ? '¡Abriste un cofre!' : '¡Encontraste un cofre!'}</h2>
          <button
            type="button"
            onClick={destaparCofre}
            disabled={cofre?.fase !== 'cerrado'}
            aria-label="Abrir el cofre"
            className="grid place-items-center rounded-3xl p-2 disabled:cursor-default"
          >
            <CofreAnimado fase={cofre?.fase ?? 'cerrado'} />
          </button>
          {cofre?.fase === 'abierto' ? (
            <div className="aparece-pop grid w-full justify-items-center gap-3" role="status">
              <p className="inline-flex items-center gap-2 font-display text-4xl font-semibold" style={{ color: 'var(--u1)' }}>
                <IconoGema className="h-9 w-9" />+{cofre.gemas}
              </p>
              {cofre.logros.map((l) => (
                <p key={l} className="rounded-xl bg-amber-soft px-3 py-1.5 text-sm font-extrabold text-amber-text">
                  ¡Nuevo logro! {l}
                </p>
              ))}
              <p className="text-muted">Úsalas en la tienda para vestir a Numi o comprar ayudas.</p>
              <Boton ancho onClick={() => setCofre(null)}>
                ¡Genial!
              </Boton>
            </div>
          ) : (
            <p className="aviso-toca font-extrabold text-muted">{cofre?.fase === 'abriendo' ? '¡Abriendo!' : 'Toca el cofre para abrirlo'}</p>
          )}
        </div>
      </Hoja>
    </div>
  );
}

function AvisoSinVidas({ proxima, puedeRepasar, onPracticar }: { proxima: number | null; puedeRepasar: boolean; onPracticar: () => void }) {
  return (
    <div className="grid gap-2 rounded-2xl bg-bad-soft px-4 py-3 text-bad-text">
      <p className="text-sm font-extrabold">
        Te quedaste sin vidas.{' '}
        {puedeRepasar ? 'Repasa esta lección o haz una práctica para recuperar una.' : 'Haz una práctica para recuperar una.'}
        {proxima !== null && ` O espera ${formatoMinutos(proxima / 1000)}.`}
      </p>
      {!puedeRepasar && (
        <Boton variante="suave" onClick={onPracticar}>
          Ir a practicar
        </Boton>
      )}
    </div>
  );
}

function HojaLeccion({ l, onCerrar, onAccion }: { l: LeccionUbicada | null; onCerrar: () => void; onAccion: (a: AccionCamino) => void }) {
  const { estado } = useJuego();
  const ahora = useReloj(1000);
  const vidas = recargar(estado.vidas, ahora).actuales;
  const proxima = msParaProximaVida(estado.vidas, ahora);
  // Se conserva la última lección para que la hoja no quede vacía mientras se cierra.
  const ultima = useRef(l);
  if (l) ultima.current = l;
  const m = ultima.current;
  if (!m) return null;

  const progreso = estado.lecciones[m.leccion.id];
  const coronas = progreso?.coronas ?? 0;
  const completa = coronas >= CORONAS_MAX;
  const sinVidas = vidas <= 0;
  const ir = (a: AccionCamino) => {
    onCerrar();
    onAccion(a);
  };

  return (
    <Hoja abierta={!!l} onCerrar={onCerrar} titulo={m.leccion.titulo}>
      <div className="grid gap-4" style={colorUnidad(m.unidad.unidad)}>
        <div className="grid gap-1">
          <p className="text-xs font-extrabold uppercase tracking-[.1em]" style={{ color: 'var(--unidad)' }}>
            Unidad {m.unidad.unidad} · Lección {m.leccion.numero}
            {m.leccion.tipoNodo === 'caso_practico' ? ' · Problemas' : ''}
          </p>
          <h2 className="text-2xl font-bold leading-tight">{m.leccion.titulo}</h2>
          <p className="text-muted">{m.leccion.objetivo}</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3.5 py-3">
          <span className="flex gap-1" aria-hidden="true">
            {Array.from({ length: CORONAS_MAX }, (_, i) => (
              <IconoCorona key={i} className="h-6 w-6" style={{ color: i < coronas ? 'var(--amber)' : 'var(--line-deep)' }} />
            ))}
          </span>
          <p className="text-sm font-bold">
            {progreso?.legendaria
              ? '¡Lección legendaria!'
              : completa
                ? `Lección dominada. Desafío legendario: ${EJERCICIOS_POR_SESION} preguntas difíciles, máximo ${ERRORES_LEGENDARIO} error.`
                : `Nivel ${coronas + 1} de 3: ${NIVELES[coronas]}`}
          </p>
        </div>

        {sinVidas && <AvisoSinVidas proxima={proxima} puedeRepasar={coronas > 0} onPracticar={() => ir({ tipo: 'practicar' })} />}

        <div className="grid gap-2.5">
          {!completa && (
            <Boton ancho variante="unidad" disabled={sinVidas} onClick={() => ir({ tipo: coronas === 0 ? 'guia' : 'leccion', leccionId: m.leccion.id })}>
              {coronas > 0 ? `Empezar nivel ${coronas + 1}` : 'Empezar'}
            </Boton>
          )}
          {completa && !progreso?.legendaria && (
            <Boton ancho disabled={sinVidas} onClick={() => ir({ tipo: 'legendario', leccionId: m.leccion.id })}>
              Desafío legendario
            </Boton>
          )}
          {coronas > 0 && (
            <Boton ancho variante={completa && progreso?.legendaria ? 'unidad' : 'suave'} onClick={() => ir({ tipo: 'repaso', leccionId: m.leccion.id })}>
              Repasar ({EJERCICIOS_REPASO} ejercicios, +1 vida)
            </Boton>
          )}
          {coronas > 0 && (
            <Boton ancho variante="suave" onClick={() => ir({ tipo: 'guia', leccionId: m.leccion.id })}>
              Ver la guía
            </Boton>
          )}
        </div>
        <p className="text-center text-xs font-semibold text-muted">
          {coronas === 0 ? `Primero verás un resumen rápido y después ${EJERCICIOS_POR_SESION} preguntas.` : `${EJERCICIOS_POR_SESION} preguntas por nivel.`}
        </p>
      </div>
    </Hoja>
  );
}

function HojaCheckpoint({ unidad, onCerrar, onAccion }: { unidad: Unidad | null; onCerrar: () => void; onAccion: (a: AccionCamino) => void }) {
  const { estado } = useJuego();
  const ahora = useReloj(1000);
  const ultima = useRef(unidad);
  if (unidad) ultima.current = unidad;
  const u = ultima.current;
  if (!u) return null;
  const vidas = recargar(estado.vidas, ahora).actuales;
  const proxima = msParaProximaVida(estado.vidas, ahora);
  const cp = estado.checkpoints[`u${u.unidad}`];

  return (
    <Hoja abierta={!!unidad} onCerrar={onCerrar} titulo={`Checkpoint de la unidad ${u.unidad}`}>
      <div className="grid gap-4" style={colorUnidad(u.unidad)}>
        <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3">
          <Numi expresion="pensando" className="h-auto w-[72px]" />
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.1em]" style={{ color: 'var(--unidad)' }}>
              Checkpoint · Unidad {u.unidad}
            </p>
            <h2 className="text-2xl font-bold leading-tight">{u.titulo}</h2>
          </div>
        </div>
        <p className="text-muted">
          {EJERCICIOS_CHECKPOINT} preguntas de todas las lecciones de la unidad. Si aciertas al menos el {APROBAR_CHECKPOINT * 100}%, se desbloquean todas sus
          lecciones y pasas a la unidad siguiente. Cada error resta una vida.
        </p>
        {cp && (
          <p className={`rounded-2xl px-4 py-3 font-extrabold ${cp.aprobado ? 'bg-ok-soft text-ok-text' : 'bg-surface-2'}`}>
            {cp.aprobado ? `Aprobado. Tu mejor resultado: ${cp.mejor}%.` : `Tu mejor resultado hasta ahora: ${cp.mejor}%.`}
          </p>
        )}
        {vidas <= 0 && (
          <AvisoSinVidas
            proxima={proxima}
            puedeRepasar={false}
            onPracticar={() => {
              onCerrar();
              onAccion({ tipo: 'practicar' });
            }}
          />
        )}
        <Boton
          ancho
          variante="unidad"
          disabled={vidas <= 0}
          onClick={() => {
            onCerrar();
            onAccion({ tipo: 'checkpoint', unidad: u.unidad });
          }}
        >
          {cp ? 'Intentar de nuevo' : 'Empezar checkpoint'}
        </Boton>
      </div>
    </Hoja>
  );
}
