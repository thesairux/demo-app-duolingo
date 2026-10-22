// Una sesión de ejercicios. Sirve para lecciones, repasos, práctica, checkpoint, desafío legendario y examen.
import { AnimatePresence, motion, useAnimate } from 'framer-motion';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BarraProgreso } from '../components/Barras';
import { Boton } from '../components/Boton';
import { VistaEjercicio } from '../components/ejercicios/VistaEjercicio';
import { Hoja } from '../components/Hoja';
import { IconoCerrar, IconoCorazon, IconoReloj } from '../components/Iconos';
import { Numi } from '../components/Numi';
import { Retroalimentacion } from '../components/Retroalimentacion';
import { GlosarioActivo } from '../components/glosarioActivo';
import { buscarLeccion, EJERCICIOS } from '../content';
import type { Ejercicio } from '../content/types';
import { useJuego } from '../hooks/useJuego';
import { useMovimiento } from '../hooks/useMovimiento';
import { useReloj } from '../hooks/useReloj';
import { useSonido } from '../hooks/useSonido';
import type { EfectosSesion, ResultadoSesion } from '../lib/estado';
import { evaluar, type Correccion, type Respuesta } from '../lib/evaluar';
import { formatoMinutos } from '../lib/fechas';
import { frase } from '../lib/frases';
import { coronasDe } from '../lib/progreso';
import {
  APROBAR_CHECKPOINT,
  armarCheckpoint,
  armarExamen,
  armarLegendario,
  armarRepasoLeccion,
  armarSesion,
  ERRORES_LEGENDARIO,
  REGLAS,
  SEGUNDOS_POR_PREGUNTA_EXAMEN,
  type ModoSesion,
} from '../lib/sesion';
import { opcionesAEsconder } from '../lib/tienda';
import { msParaProximaVida, recargar } from '../lib/vidas';
import { bonusLeccion, resumirXP, xpAcierto } from '../lib/xp';

export interface RevisionExamen {
  ej: Ejercicio;
  correccion: Correccion | null;
}

export interface DatosResultado {
  modo: ModoSesion;
  resultado: ResultadoSesion;
  efectos: EfectosSesion;
  /** Solo en el examen: cada pregunta con su corrección (null si no alcanzó a responderse). */
  revision?: RevisionExamen[];
}

interface Turno {
  ej: Ejercicio;
  repetida: boolean;
}

interface Revision {
  correccion: Correccion;
  xp: number;
  frase: string;
}

function armar(modo: ModoSesion, coronas: number): Ejercicio[] {
  switch (modo.tipo) {
    case 'leccion':
      return armarSesion(buscarLeccion(modo.leccionId)!.leccion, coronas);
    case 'repaso-leccion':
      return armarRepasoLeccion(buscarLeccion(modo.leccionId)!.leccion, coronas);
    case 'legendario':
      return armarLegendario(buscarLeccion(modo.leccionId)!.leccion);
    case 'practica':
      return modo.ids.map((id) => EJERCICIOS.get(id)?.ej).filter((e): e is Ejercicio => !!e);
    case 'checkpoint':
      return armarCheckpoint(modo.unidad);
    case 'examen':
      return armarExamen(modo.unidades, modo.cantidad);
  }
}

function colorDe(modo: ModoSesion, primero: Ejercicio | undefined): string {
  if (modo.tipo === 'checkpoint') return `var(--u${modo.unidad})`;
  if ('leccionId' in modo) return `var(--u${buscarLeccion(modo.leccionId)!.unidad.unidad})`;
  if (modo.tipo === 'examen') return 'var(--select)';
  return primero ? `var(--u${primero.unidad})` : 'var(--select)';
}

function aviso(modo: ModoSesion, total: number): string | null {
  switch (modo.tipo) {
    case 'repaso-leccion':
    case 'practica':
      return 'Repaso: los errores no restan vidas y al terminar recuperas una.';
    case 'legendario':
      return `Desafío legendario: puedes equivocarte ${ERRORES_LEGENDARIO === 1 ? 'una vez' : `${ERRORES_LEGENDARIO} veces`} como máximo.`;
    case 'checkpoint':
      return `Checkpoint: necesitas ${Math.ceil(total * APROBAR_CHECKPOINT)} de ${total} correctas para aprobar.`;
    case 'examen':
      return 'Examen: verás las respuestas correctas al final.';
    default:
      return null;
  }
}

interface Props {
  modo: ModoSesion;
  onSalir: () => void;
  onTerminar: (datos: DatosResultado) => void;
}

export function Sesion({ modo, onSalir, onTerminar }: Props) {
  const { estado, perderVida, terminarSesion, usarComodin } = useJuego();
  const reglas = REGLAS[modo.tipo];
  const esExamen = modo.tipo === 'examen';
  const ahora = useReloj(1000);
  const reducir = !useMovimiento();
  const [escena, animar] = useAnimate();
  const sonar = useSonido();

  const [cola, setCola] = useState<Turno[]>(() => {
    const coronas = 'leccionId' in modo ? coronasDe(estado.lecciones, modo.leccionId) : 0;
    return armar(modo, coronas).map((ej) => ({ ej, repetida: false }));
  });
  const [total] = useState(cola.length);
  const [pos, setPos] = useState(0);
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [revision, setRevision] = useState<Revision | null>(null);
  const [avance, setAvance] = useState(0);
  const [sinVidas, setSinVidas] = useState(false);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  /** Alternativas escondidas por el comodín 50/50 en la pregunta `pos`. */
  const [comodin, setComodin] = useState<{ pos: number; ocultas: number[] } | null>(null);
  const terminada = useRef(false);

  const datos = useRef({
    inicio: Date.now(),
    combo: 0,
    xpEjercicios: 0,
    xpCombo: 0,
    aciertos: 0,
    aciertosPrimerIntento: 0,
    respuestas: 0,
    errores: 0,
    casosCorrectos: 0,
    porEjercicio: {} as ResultadoSesion['porEjercicio'],
    revisionExamen: new Map<string, Correccion>(),
    quedanVidas: true,
    cortarAntes: false,
  });

  const turno = cola[pos];
  const vidas = recargar(estado.vidas, ahora).actuales;
  const limiteExamen = total * SEGUNDOS_POR_PREGUNTA_EXAMEN * 1000;
  const restante = esExamen ? Math.max(0, limiteExamen - (ahora - datos.current.inicio)) : 0;

  // En el examen, al acabarse el tiempo se entrega lo respondido.
  useEffect(() => {
    if (esExamen && restante <= 0 && !terminada.current) finalizar(true);
  });

  function registrar(correccion: Correccion) {
    const d = datos.current;
    const { ej } = turno;
    const previo = d.porEjercicio[ej.id] ?? { aciertos: 0, fallos: 0 };
    const primeraVez = !turno.repetida;
    d.respuestas += 1;
    if (correccion.correcta) {
      d.combo += 1;
      const g = xpAcierto(d.combo);
      d.xpEjercicios += g.base;
      d.xpCombo += g.combo;
      d.aciertos += 1;
      if (primeraVez) d.aciertosPrimerIntento += 1;
      if (ej.tipo === 'caso_practico') d.casosCorrectos += 1;
      d.porEjercicio[ej.id] = { ...previo, aciertos: previo.aciertos + 1 };
      return g;
    }
    d.combo = 0;
    d.errores += 1;
    d.porEjercicio[ej.id] = { ...previo, fallos: previo.fallos + 1 };
    return null;
  }

  function comprobar() {
    if (!respuesta || revision) return;
    const d = datos.current;
    const correccion = evaluar(turno.ej, respuesta);
    const g = registrar(correccion);

    if (esExamen) {
      d.revisionExamen.set(turno.ej.id, correccion);
      setRespuesta(null);
      setAvance((a) => a + 1);
      if (pos + 1 >= cola.length) finalizar(true);
      else setPos(pos + 1);
      return;
    }

    if (g) {
      sonar('acierto');
      setAvance((a) => a + 1);
      setRevision({ correccion, xp: g.base + g.combo, frase: frase(g.combo ? 'combo' : 'acierto') });
      return;
    }

    sonar('error');
    if (reglas.cuestaVidas) d.quedanVidas = perderVida() > 0;
    if (reglas.repiteErrores) setCola((c) => [...c, { ej: turno.ej, repetida: true }]);
    else setAvance((a) => a + 1);
    if (modo.tipo === 'legendario' && d.errores > ERRORES_LEGENDARIO) d.cortarAntes = true;
    if (modo.tipo === 'checkpoint' && d.errores > total - Math.ceil(total * APROBAR_CHECKPOINT)) d.cortarAntes = true;
    setRevision({ correccion, xp: 0, frase: frase('error') });
    if (!reducir && escena.current) animar(escena.current, { x: [0, -10, 10, -6, 6, 0] }, { duration: 0.4 });
  }

  function continuar() {
    setRevision(null);
    setRespuesta(null);
    const d = datos.current;
    if (!d.quedanVidas) return setSinVidas(true);
    if (d.cortarAntes) return finalizar(true);
    if (pos + 1 >= cola.length) finalizar(true);
    else setPos(pos + 1);
  }

  function finalizar(completada: boolean) {
    if (terminada.current) return;
    terminada.current = true;
    const d = datos.current;
    const segundos = (Date.now() - d.inicio) / 1000;
    const bonus = bonusLeccion({ completada, errores: d.errores, segundos, cantidadEjercicios: total });
    const resultado: ResultadoSesion = {
      modo,
      completada,
      xp: resumirXP({ ejercicios: d.xpEjercicios, combo: d.xpCombo, ...bonus }),
      total,
      aciertosPrimerIntento: d.aciertosPrimerIntento,
      aciertos: d.aciertos,
      respuestas: d.respuestas,
      errores: d.errores,
      segundos,
      porEjercicio: d.porEjercicio,
      casosCorrectos: d.casosCorrectos,
    };
    const efectos = terminarSesion(resultado);
    if (!completada) return onSalir();
    onTerminar({
      modo,
      resultado,
      efectos,
      revision: esExamen ? cola.map(({ ej }) => ({ ej, correccion: d.revisionExamen.get(ej.id) ?? null })) : undefined,
    });
  }

  const ocultas = comodin?.pos === pos ? comodin.ocultas : undefined;
  const conAlternativas = turno && (turno.ej.tipo === 'seleccion_multiple' || turno.ej.tipo === 'caso_practico');
  const puedeComodin = reglas.ayudas && conAlternativas && !revision && !ocultas;

  function usar5050() {
    if (!turno || (turno.ej.tipo !== 'seleccion_multiple' && turno.ej.tipo !== 'caso_practico') || !usarComodin()) return;
    const esconder = opcionesAEsconder(turno.ej.opciones.length, turno.ej.respuesta);
    setComodin({ pos, ocultas: esconder });
    if (respuesta?.tipo === 'opcion' && esconder.includes(respuesta.indice)) setRespuesta(null);
  }

  const estilo = { '--unidad': colorDe(modo, cola[0]?.ej) } as CSSProperties;
  const textoAviso = aviso(modo, total);

  if (!turno) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div className="grid justify-items-center gap-4">
          <Numi expresion="pensando" className="h-auto w-32" />
          <p className="font-bold">No hay ejercicios para esta sesión todavía.</p>
          <Boton onClick={onSalir}>Volver</Boton>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-full max-w-xl flex-col overflow-hidden" style={estilo}>
      <header className="grid gap-2 px-4 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Salir" className="rounded-xl p-1 text-muted" onClick={() => setConfirmarSalida(true)}>
            <IconoCerrar className="h-7 w-7" />
          </button>
          <BarraProgreso valor={avance / total} etiqueta="Progreso de la sesión" />
          {esExamen ? (
            <span className={`inline-flex items-center gap-1 text-lg font-black tabular-nums ${restante < 60_000 ? 'text-bad' : 'text-ink'}`} aria-label={`Quedan ${formatoMinutos(restante / 1000)}`}>
              <IconoReloj className="h-6 w-6" />
              {formatoMinutos(restante / 1000)}
            </span>
          ) : reglas.cuestaVidas ? (
            <motion.span
              key={vidas}
              initial={reducir ? false : { scale: 1.45 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="inline-flex items-center gap-1 text-lg font-black tabular-nums text-bad"
              aria-label={`${vidas} vidas`}
            >
              <IconoCorazon className="h-6 w-6" />
              {vidas}
            </motion.span>
          ) : null}
        </div>
        {textoAviso && <p className="rounded-xl bg-surface-2 px-3 py-1.5 text-center text-[12.5px] font-extrabold text-muted">{textoAviso}</p>}
      </header>

      <div ref={escena} className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pos}
            initial={reducir ? false : { x: 48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reducir ? undefined : { x: -48, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="grid gap-3"
          >
            {esExamen && <p className="text-sm font-extrabold text-muted">Pregunta {pos + 1} de {total}</p>}
            {turno.repetida && (
              <p className="w-fit rounded-full bg-select-soft px-3 py-1 text-[12.5px] font-extrabold text-select">Repaso de un error</p>
            )}
            <GlosarioActivo value={reglas.ayudas}>
              <VistaEjercicio
                ej={turno.ej}
                bloqueado={!!revision}
                veredicto={revision ? (revision.correccion.correcta ? 'correcta' : 'incorrecta') : null}
                onRespuesta={setRespuesta}
                ocultas={ocultas}
              />
            </GlosarioActivo>
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="border-t-2 border-line px-4 pt-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
        <div className="flex gap-3">
          {puedeComodin && (
            <Boton
              variante="suave"
              className="flex-none px-4!"
              disabled={estado.tienda.comodines <= 0}
              onClick={usar5050}
              aria-label={`Usar comodín 50/50: esconde dos alternativas incorrectas. Te quedan ${estado.tienda.comodines}.`}
              title={estado.tienda.comodines > 0 ? 'Esconde dos alternativas incorrectas' : 'Compra comodines en la Tienda'}
            >
              50/50
              <span className="rounded-full bg-surface-2 px-1.5 text-xs tabular-nums">{estado.tienda.comodines}</span>
            </Boton>
          )}
          <Boton className="flex-1" disabled={!respuesta || !!revision} onClick={comprobar}>
            {esExamen ? (pos + 1 >= total ? 'Entregar examen' : 'Siguiente') : 'Comprobar'}
          </Boton>
        </div>
      </footer>

      <AnimatePresence>
        {revision && (
          <Retroalimentacion
            key={`fb-${pos}`}
            ej={turno.ej}
            correccion={revision.correccion}
            xp={revision.xp}
            frase={revision.frase}
            seRepite={!revision.correccion.correcta && reglas.repiteErrores && datos.current.quedanVidas}
            onContinuar={continuar}
          />
        )}
      </AnimatePresence>

      <Hoja abierta={confirmarSalida} onCerrar={() => setConfirmarSalida(false)} titulo="Salir">
        <div className="grid gap-4">
          <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3">
            <Numi expresion="preocupada" className="h-auto w-[72px]" />
            <div>
              <h2 className="text-2xl font-bold">¿Salir ahora?</h2>
              <p className="text-muted">
                Perderás el avance de esta sesión.{reglas.cuestaVidas ? ' Las vidas que perdiste no se recuperan.' : ''}
              </p>
            </div>
          </div>
          <Boton ancho onClick={() => setConfirmarSalida(false)}>
            Seguir
          </Boton>
          <Boton ancho variante="suave" onClick={onSalir}>
            Salir
          </Boton>
        </div>
      </Hoja>

      <Hoja abierta={sinVidas} onCerrar={() => finalizar(false)} titulo="Sin vidas">
        <SinVidas onVolver={() => finalizar(false)} />
      </Hoja>
    </div>
  );
}

function SinVidas({ onVolver }: { onVolver: () => void }) {
  const { estado } = useJuego();
  const ahora = useReloj(1000);
  const proxima = msParaProximaVida(estado.vidas, ahora);
  const [mensaje] = useState(() => frase('sinVidas'));
  return (
    <div className="grid justify-items-center gap-4 text-center">
      <Numi expresion="triste" className="h-auto w-32" />
      <h2 className="text-2xl font-bold">Te quedaste sin vidas</h2>
      <p className="text-muted">
        {mensaje} La XP que ganaste se guardó. Para recuperar una vida ahora, repasa una lección que ya completaste.
        {proxima !== null && ` Si no, la próxima llega en ${formatoMinutos(proxima / 1000)}.`}
      </p>
      <Boton ancho onClick={onVolver}>
        Volver
      </Boton>
    </div>
  );
}
