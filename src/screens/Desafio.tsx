// Desafío relámpago: 60 segundos para resolver todos los cálculos mentales que se pueda, con un teclado grande en pantalla.
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BarraProgreso } from '../components/Barras';
import { Boton } from '../components/Boton';
import { Confeti } from '../components/Confeti';
import { IconoCerrar, IconoFuego, IconoGema, IconoRayo } from '../components/Iconos';
import { Numi } from '../components/Numi';
import { useJuego } from '../hooks/useJuego';
import { useMovimiento } from '../hooks/useMovimiento';
import { useSonido } from '../hooks/useSonido';
import { nivelDesafio, nuevoCalculo, SEGUNDOS_DESAFIO, XP_MAX_DESAFIO, type Calculo } from '../lib/desafio';
import type { EfectosActividad } from '../lib/estado';
import { formatoNumero } from '../lib/numeros';

type Fase = 'inicio' | 'jugando' | 'fin';

interface Fallo {
  calculo: Calculo;
  dado: string;
}

/** Lo que se muestra un instante después de responder. */
type Destello = { ok: true } | { ok: false; respuesta: number } | null;

const MS_DESTELLO_BIEN = 250;
const MS_DESTELLO_MAL = 1100;
const MAX_CIFRAS = 5;

export function Desafio({ onSalir }: { onSalir: () => void }) {
  const { estado, terminarDesafio } = useJuego();
  const sonar = useSonido();
  const movimiento = useMovimiento();
  const [fase, setFase] = useState<Fase>('inicio');
  const [calculo, setCalculo] = useState<Calculo | null>(null);
  const [valor, setValor] = useState('');
  const [aciertos, setAciertos] = useState(0);
  const [seguidos, setSeguidos] = useState(0);
  const [fallos, setFallos] = useState<Fallo[]>([]);
  const [destello, setDestello] = useState<Destello>(null);
  const [restante, setRestante] = useState(SEGUNDOS_DESAFIO * 1000);
  const [efectos, setEfectos] = useState<EfectosActividad | null>(null);
  const [recordAnterior, setRecordAnterior] = useState(estado.mejorDesafio);
  const fin = useRef(0);
  const ref = useRef({ aciertos: 0, terminado: false });

  const terminar = useCallback(() => {
    if (ref.current.terminado) return;
    ref.current.terminado = true;
    setRecordAnterior(estado.mejorDesafio);
    setEfectos(terminarDesafio(ref.current.aciertos));
    sonar('fin');
    setFase('fin');
  }, [estado.mejorDesafio, terminarDesafio, sonar]);

  // El reloj del desafío: se revisa varias veces por segundo y termina al llegar a cero.
  useEffect(() => {
    if (fase !== 'jugando') return;
    const id = window.setInterval(() => {
      const quedan = Math.max(0, fin.current - Date.now());
      setRestante(quedan);
      if (quedan === 0) terminar();
    }, 100);
    return () => window.clearInterval(id);
  }, [fase, terminar]);

  function empezar() {
    ref.current = { aciertos: 0, terminado: false };
    fin.current = Date.now() + SEGUNDOS_DESAFIO * 1000;
    setRestante(SEGUNDOS_DESAFIO * 1000);
    setAciertos(0);
    setSeguidos(0);
    setFallos([]);
    setValor('');
    setDestello(null);
    setEfectos(null);
    setCalculo(nuevoCalculo(0));
    setFase('jugando');
  }

  const responder = useCallback(() => {
    if (!calculo || !valor || destello) return;
    const ok = Number(valor) === calculo.respuesta;
    const siguientesAciertos = ref.current.aciertos + (ok ? 1 : 0);
    ref.current.aciertos = siguientesAciertos;
    if (ok) {
      sonar('acierto');
      setAciertos(siguientesAciertos);
      setSeguidos((s) => s + 1);
      setDestello({ ok: true });
    } else {
      sonar('error');
      setSeguidos(0);
      setFallos((f) => [...f, { calculo, dado: valor }]);
      setDestello({ ok: false, respuesta: calculo.respuesta });
    }
    window.setTimeout(
      () => {
        if (ref.current.terminado) return;
        setCalculo((c) => nuevoCalculo(nivelDesafio(siguientesAciertos), c));
        setValor('');
        setDestello(null);
      },
      ok ? MS_DESTELLO_BIEN : MS_DESTELLO_MAL,
    );
  }, [calculo, valor, destello, sonar]);

  const tecla = useCallback(
    (t: string) => {
      if (destello) return;
      if (t === 'borrar') setValor((v) => v.slice(0, -1));
      else if (t === 'ok') responder();
      else setValor((v) => (v.length < MAX_CIFRAS ? (v === '0' ? t : v + t) : v));
    },
    [destello, responder],
  );

  // También se puede jugar con el teclado del computador.
  useEffect(() => {
    if (fase !== 'jugando') return;
    const alTeclear = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) tecla(e.key);
      else if (e.key === 'Backspace') tecla('borrar');
      else if (e.key === 'Enter') tecla('ok');
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [fase, tecla]);

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col">
      <header className="grid gap-2 px-4 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Salir del desafío" className="rounded-xl p-1 text-muted" onClick={onSalir}>
            <IconoCerrar className="h-7 w-7" />
          </button>
          {fase === 'jugando' ? (
            <>
              <BarraProgreso valor={restante / (SEGUNDOS_DESAFIO * 1000)} etiqueta="Tiempo que queda" />
              <span className={`w-10 text-right text-lg font-black tabular-nums ${restante < 10_000 ? 'text-bad' : 'text-ink'}`} aria-label={`Quedan ${Math.ceil(restante / 1000)} segundos`}>
                {Math.ceil(restante / 1000)}
              </span>
            </>
          ) : (
            <p className="text-xs font-extrabold uppercase tracking-[.1em] text-muted">Desafío relámpago</p>
          )}
        </div>
      </header>

      {fase === 'inicio' && (
        <main className="grid flex-1 content-start gap-5 px-4 pb-10 pt-3">
          <section className="grid justify-items-center gap-3 pt-4 text-center">
            <Numi expresion="feliz" className="h-auto w-36" />
            <h1 className="text-[32px] font-bold leading-tight">Desafío relámpago</h1>
            <p className="max-w-sm text-muted">
              Tienes {SEGUNDOS_DESAFIO} segundos para resolver todos los cálculos que puedas, de cabeza. Mientras más aciertas, más difíciles se ponen.
            </p>
          </section>
          <ul className="grid gap-2 rounded-2xl bg-surface-2 px-4 py-3.5 font-semibold">
            <li className="flex items-center gap-2">
              <IconoRayo className="h-5 w-5" /> 1 XP por cada acierto (hasta {XP_MAX_DESAFIO}).
            </li>
            <li className="flex items-center gap-2">
              <IconoFuego className="h-5 w-5" /> Tablas, dobles, mitades, decenas y por 10 o 100.
            </li>
            <li className="flex items-center gap-2">
              <IconoGema className="h-5 w-5" /> Tu récord: <span className="font-black tabular-nums">{estado.mejorDesafio}</span>
            </li>
          </ul>
          <Boton ancho onClick={empezar}>
            ¡Empezar!
          </Boton>
        </main>
      )}

      {fase === 'jugando' && calculo && (
        <main className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4">
          <div className="flex items-center justify-between text-sm font-extrabold text-muted">
            <span className="inline-flex items-center gap-1.5">
              <IconoRayo className="h-5 w-5" />
              <span className="tabular-nums text-ink">{aciertos}</span> correctas
            </span>
            {seguidos >= 3 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-soft px-2.5 py-1 text-amber-text">
                <IconoFuego className="h-4 w-4" />
                {seguidos} seguidas
              </span>
            )}
          </div>
          <div className="grid flex-1 content-center justify-items-center gap-4 text-center">
            <motion.p
              key={calculo.texto + aciertos}
              initial={movimiento ? { scale: 0.85 } : false}
              animate={{ scale: 1 }}
              className="font-display text-[44px] font-semibold tabular-nums leading-tight"
            >
              {calculo.texto} =
            </motion.p>
            <p
              className="min-h-[72px] min-w-[160px] rounded-2xl border-[3px] px-5 py-2 font-display text-[44px] font-semibold tabular-nums leading-tight"
              style={{
                borderColor: destello ? (destello.ok ? 'var(--ok)' : 'var(--bad)') : 'var(--line-deep)',
                background: destello ? (destello.ok ? 'var(--ok-soft)' : 'var(--bad-soft)') : 'var(--surface)',
              }}
              aria-live="polite"
            >
              {valor || <span className="text-line-deep">?</span>}
            </p>
            <p className="min-h-[24px] font-extrabold" role="status" style={{ color: destello?.ok === false ? 'var(--bad-text)' : 'var(--ok-text)' }}>
              {destello ? (destello.ok ? '¡Bien!' : `Era ${formatoNumero(destello.respuesta)}`) : ''}
            </p>
          </div>
          <Teclado onTecla={tecla} puedeResponder={!!valor && !destello} />
        </main>
      )}

      {fase === 'fin' && (
        <main className="grid flex-1 content-start gap-5 px-4 pb-10 pt-3">
          <Confeti disparo={!!efectos?.record} cantidad={60} />
          <section className="grid justify-items-center gap-2 pt-2 text-center">
            <Numi expresion={aciertos > 0 ? 'celebrando' : 'pensando'} className="h-auto w-32" />
            <h1 className="text-[32px] font-bold leading-tight">
              {aciertos} {aciertos === 1 ? 'cálculo correcto' : 'cálculos correctos'}
            </h1>
            <p className="font-bold text-muted">
              {efectos?.record
                ? recordAnterior > 0
                  ? `¡Nuevo récord! Superaste tus ${recordAnterior}.`
                  : '¡Tu primer récord!'
                : `Tu récord sigue siendo ${Math.max(estado.mejorDesafio, aciertos)}.`}
            </p>
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
          {fallos.length > 0 && (
            <section className="grid gap-2" aria-labelledby="t-repasa">
              <h2 id="t-repasa" className="text-lg font-semibold">
                Para repasar
              </h2>
              <ul className="grid gap-1.5">
                {fallos.slice(-5).map((f, i) => (
                  <li key={`${f.calculo.texto}-${i}`} className="flex justify-between gap-3 rounded-xl bg-surface-2 px-3 py-2 font-bold tabular-nums">
                    <span>
                      {f.calculo.texto} = {formatoNumero(f.calculo.respuesta)}
                    </span>
                    <span className="text-bad-text">pusiste {f.dado}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <div className="grid gap-3">
            <Boton ancho onClick={empezar}>
              Otra vez
            </Boton>
            <Boton ancho variante="suave" onClick={onSalir}>
              Volver
            </Boton>
          </div>
        </main>
      )}
    </div>
  );
}

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'borrar', '0', 'ok'];

function Teclado({ onTecla, puedeResponder }: { onTecla: (t: string) => void; puedeResponder: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2.5" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {TECLAS.map((t) =>
        t === 'ok' ? (
          <Boton key={t} variante="exito" className="h-14 text-xl!" disabled={!puedeResponder} onClick={() => onTecla(t)} aria-label="Responder">
            OK
          </Boton>
        ) : (
          <Boton key={t} variante="suave" className="h-14 font-display text-[26px]! normal-case!" onClick={() => onTecla(t)} aria-label={t === 'borrar' ? 'Borrar' : undefined}>
            {t === 'borrar' ? '⌫' : t}
          </Boton>
        ),
      )}
    </div>
  );
}
