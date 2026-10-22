// Pantalla final de una sesión: XP, precisión, tiempo y lo que se ganó (coronas, vidas, gemas, logros).
import { animate, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { Boton } from '../components/Boton';
import { Confeti } from '../components/Confeti';
import { IconoCorazon, IconoCorona, IconoFuego, IconoGema, IconoRayo } from '../components/Iconos';
import { Numi, type Expresion } from '../components/Numi';
import { IconoLogro } from '../components/IconoLogro';
import { buscarLeccion } from '../content';
import type { Ejercicio } from '../content/types';
import { useJuego } from '../hooks/useJuego';
import { useMovimiento } from '../hooks/useMovimiento';
import { useSonido } from '../hooks/useSonido';
import { precision, precisionPrimerIntento } from '../lib/estado';
import { evaluar } from '../lib/evaluar';
import { formatoMinutos } from '../lib/fechas';
import { frase } from '../lib/frases';
import { APROBAR_CHECKPOINT, APROBAR_EXAMEN, CORONAS_MAX, ERRORES_LEGENDARIO, REGLAS } from '../lib/sesion';
import type { DatosResultado } from './Sesion';

function encabezado(datos: DatosResultado, perfecta: boolean): { titulo: string; detalle: string; expresion: Expresion } {
  const { modo, resultado, efectos } = datos;
  const pct = Math.round(precisionPrimerIntento(resultado) * 100);
  switch (modo.tipo) {
    case 'checkpoint':
      return efectos.aprobado
        ? { titulo: '¡Checkpoint aprobado!', detalle: `Lograste ${pct}%. Desbloqueaste toda la Unidad ${modo.unidad} y la siguiente.`, expresion: 'celebrando' }
        : { titulo: 'Te faltó poco', detalle: `Lograste ${pct}% y necesitas ${APROBAR_CHECKPOINT * 100}%. Puedes seguir por las lecciones o intentarlo otra vez.`, expresion: 'triste' };
    case 'legendario':
      return efectos.aprobado
        ? { titulo: '¡Lección legendaria!', detalle: 'Tu nodo en el camino ahora es dorado.', expresion: 'celebrando' }
        : {
            titulo: 'Casi legendario',
            detalle: `Tuviste ${resultado.errores} errores y el máximo es ${ERRORES_LEGENDARIO}. Repasa la guía y vuelve a intentarlo.`,
            expresion: 'triste',
          };
    case 'examen':
      return efectos.aprobado
        ? { titulo: `¡Examen aprobado con ${pct}%!`, detalle: 'Revisa abajo las preguntas que fallaste.', expresion: 'celebrando' }
        : { titulo: `Obtuviste ${pct}%`, detalle: `Para aprobar necesitas ${APROBAR_EXAMEN * 100}%. Revisa abajo lo que fallaste y practica esos temas.`, expresion: 'pensando' };
    case 'repaso-leccion':
    case 'practica':
      return {
        titulo: '¡Repaso listo!',
        detalle: efectos.vidaGanada ? 'Recuperaste una vida.' : 'Tus vidas ya estaban llenas, pero lo repasado queda guardado.',
        expresion: 'celebrando',
      };
    default:
      return { titulo: frase(perfecta ? 'perfecta' : 'fin'), detalle: '', expresion: 'celebrando' };
  }
}

export function Resultado({ datos, onContinuar }: { datos: DatosResultado; onContinuar: () => void }) {
  const { estado } = useJuego();
  const movimiento = useMovimiento();
  const { modo, resultado, efectos } = datos;
  const perfecta = resultado.errores === 0;
  const [cabeza] = useState(() => encabezado(datos, perfecta));
  const meta = estado.perfil?.metaDiaria ?? 20;
  const ganoCorona = efectos.coronasDespues > efectos.coronasAntes;
  const leccion = 'leccionId' in modo ? buscarLeccion(modo.leccionId)?.leccion : undefined;
  const pctMostrado = REGLAS[modo.tipo].repiteErrores ? precision(resultado) : Math.round(precisionPrimerIntento(resultado) * 100);
  const exito = efectos.aprobado !== false;
  const sonar = useSonido();

  // Fanfarria al llegar y, si hay logros nuevos, un destello después. Los temporizadores evitan que suene doble en desarrollo.
  useEffect(() => {
    const timers = [window.setTimeout(() => sonar(exito ? 'fin' : 'fallo'), 120)];
    if (efectos.logrosNuevos.length) timers.push(window.setTimeout(() => sonar('logro'), 1100));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [sonar, exito, efectos.logrosNuevos.length]);

  const desglose = (
    [
      ['Ejercicios correctos', resultado.xp.ejercicios],
      ['Bonus por combo', resultado.xp.combo],
      ['Sesión completada', resultado.xp.leccion],
      ['Bonus por perfección', resultado.xp.perfecta],
      ['Bonus por velocidad', resultado.xp.rapida],
      ['Doble XP de la tienda', efectos.xpDoble],
    ] as [string, number][]
  ).filter(([, v]) => v > 0);

  const aparecer = (retraso: number) =>
    movimiento ? { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: retraso, duration: 0.3 } } : {};

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col items-center gap-5 px-5 py-8 text-center" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 32px)' }}>
      <Confeti disparo={exito} cantidad={perfecta || modo.tipo === 'legendario' ? 64 : 42} />
      <Numi expresion={cabeza.expresion} className="h-auto w-40" />
      <motion.div className="grid gap-1" {...aparecer(0.05)}>
        {leccion && <p className="text-sm font-extrabold uppercase tracking-[.1em] text-muted">{leccion.titulo}</p>}
        <h1 className="text-[30px] font-bold leading-tight">{cabeza.titulo}</h1>
        {cabeza.detalle && <p className="text-muted">{cabeza.detalle}</p>}
      </motion.div>

      <motion.dl className="grid w-full grid-cols-3 gap-2.5" {...aparecer(0.15)}>
        {(
          [
            ['XP', <Contador valor={resultado.xp.total + efectos.xpDoble} prefijo="+" />],
            ['Precisión', `${pctMostrado}%`],
            ['Tiempo', formatoMinutos(resultado.segundos)],
          ] as [string, ReactNode][]
        ).map(([k, v]) => (
          <div key={k} className="grid gap-0.5 rounded-2xl border-2 border-line bg-surface px-2 py-3">
            <dt className="text-[11.5px] font-extrabold uppercase tracking-[.08em] text-muted">{k}</dt>
            <dd className="font-display text-2xl font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </motion.dl>

      {desglose.length > 0 && (
        <motion.ul className="grid w-full gap-1.5 rounded-2xl bg-surface-2 px-4 py-3 text-left text-[15px]" {...aparecer(0.22)}>
          {desglose.map(([k, v]) => (
            <li key={k} className="flex justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <IconoRayo className="h-4 w-4" />
                {k}
              </span>
              <span className="font-extrabold tabular-nums">+{v} XP</span>
            </li>
          ))}
          {efectos.gemas.map((g) => (
            <li key={g.motivo} className="flex justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <IconoGema className="h-4 w-4" />
                {g.motivo}
              </span>
              <span className="font-extrabold tabular-nums">+{g.gemas}</span>
            </li>
          ))}
        </motion.ul>
      )}

      <motion.div className="grid w-full gap-2.5" {...aparecer(0.3)}>
        {ganoCorona && (
          <Insignia>
            <span className="flex gap-0.5" aria-hidden="true">
              {Array.from({ length: CORONAS_MAX }, (_, i) => (
                <IconoCorona key={i} className="h-5 w-5" style={{ color: i < efectos.coronasDespues ? 'var(--amber)' : 'var(--line-deep)' }} />
              ))}
            </span>
            {efectos.coronasDespues >= CORONAS_MAX ? '¡Lección dominada! Ya puedes intentar el desafío legendario.' : `¡Nivel ${efectos.coronasDespues} de 3 superado!`}
          </Insignia>
        )}
        {efectos.vidaGanada && (
          <Insignia>
            <IconoCorazon className="h-6 w-6" />
            ¡Recuperaste una vida!
          </Insignia>
        )}
        {efectos.rachaExtendida && (
          <Insignia>
            <IconoFuego className="h-6 w-6" />
            ¡Racha de {estado.racha.actual} {estado.racha.actual === 1 ? 'día' : 'días'}!
            {efectos.protectoresUsados > 0 ? ' Un protector salvó tu racha.' : ''}
          </Insignia>
        )}
        {efectos.metaCumplidaHoy && <p className="rounded-2xl bg-ok-soft px-4 py-3 font-extrabold text-ok-text">¡Cumpliste tu meta diaria de {meta} XP!</p>}
        {efectos.logrosNuevos.map((l) => (
          <div key={l.id} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border-2 border-amber bg-amber-soft px-3 py-2.5 text-left">
            <IconoLogro icono={l.icono} activo />
            <span>
              <span className="block text-xs font-black uppercase tracking-[.1em] text-amber-text">¡Nuevo logro!</span>
              <span className="font-display text-lg font-semibold">{l.titulo}</span>
            </span>
            <span className="inline-flex items-center gap-1 font-black" style={{ color: 'var(--u1)' }}>
              <IconoGema className="h-5 w-5" />+{l.gemas}
            </span>
          </div>
        ))}
      </motion.div>

      {datos.revision && <RevisionExamen revision={datos.revision} />}

      <Boton ancho className="mt-auto" onClick={onContinuar}>
        Continuar
      </Boton>
    </main>
  );
}

/** Número que sube desde 0 hasta su valor (o aparece de inmediato sin animaciones). */
function Contador({ valor, prefijo = '' }: { valor: number; prefijo?: string }) {
  const movimiento = useMovimiento();
  const [mostrado, setMostrado] = useState(movimiento ? 0 : valor);
  useEffect(() => {
    if (!movimiento) {
      setMostrado(valor);
      return;
    }
    const control = animate(0, valor, { duration: 0.9, delay: 0.3, ease: 'easeOut', onUpdate: (v) => setMostrado(Math.round(v)) });
    return () => control.stop();
  }, [valor, movimiento]);
  return (
    <>
      {prefijo}
      {mostrado}
    </>
  );
}

function Insignia({ children }: { children: ReactNode }) {
  return <p className="flex items-center justify-center gap-2 rounded-2xl border-2 border-line bg-surface px-4 py-3 font-extrabold">{children}</p>;
}

function RevisionExamen({ revision }: { revision: NonNullable<DatosResultado['revision']> }) {
  return (
    <section className="grid w-full gap-2 text-left" aria-labelledby="revision-examen">
      <h2 id="revision-examen" className="text-xl font-bold">
        Revisión de tus respuestas
      </h2>
      {revision.map(({ ej, correccion }, i) => {
        const ok = correccion?.correcta ?? false;
        return (
          <details key={`${ej.id}-${i}`} className={`rounded-2xl border-2 px-4 py-3 ${ok ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft'}`}>
            <summary className="cursor-pointer font-bold">
              <span className={ok ? 'text-ok-text' : 'text-bad-text'}>{ok ? '✓' : correccion ? '✗' : '—'}</span> {i + 1}.{' '}
              {ej.tipo === 'caso_practico' ? `${ej.caso.slice(0, 70)}…` : ej.enunciado.replace('___', '____')}
            </summary>
            <div className="mt-2 grid gap-1.5 text-[14.5px] text-ink">
              {!correccion && <p className="font-bold">No alcanzaste a responderla.</p>}
              <p className="whitespace-pre-line font-extrabold">{evaluarSolucion(ej)}</p>
              <p>{ej.explicacion}</p>
            </div>
          </details>
        );
      })}
    </section>
  );
}


/** Texto de la respuesta correcta, sin depender de lo que respondió la persona. */
function evaluarSolucion(ej: Ejercicio): string {
  return evaluar(ej, { tipo: 'opcion', indice: -1 }).solucion;
}
