// Pestaña Practicar: repaso inteligente (repetición espaciada) y modo examen.
import { useMemo, useState } from 'react';
import { BarraSuperior } from '../components/BarraSuperior';
import { Boton } from '../components/Boton';
import { IconoCorazon, IconoLapiz, IconoRayo, IconoReloj } from '../components/Iconos';
import { Numi } from '../components/Numi';
import { LECCIONES, UNIDADES } from '../content';
import { useJuego } from '../hooks/useJuego';
import { claveDia } from '../lib/fechas';
import { coronasDe } from '../lib/progreso';
import { armarPractica, pendientes, temasDebiles } from '../lib/repaso';
import { SEGUNDOS_POR_PREGUNTA_EXAMEN, type ModoSesion } from '../lib/sesion';

const CANTIDADES = [5, 10, 15];

export function Practicar({ onEmpezar, onCuaderno, onDesafio }: { onEmpezar: (modo: ModoSesion) => void; onCuaderno: () => void; onDesafio: () => void }) {
  const { estado } = useJuego();
  const hoy = claveDia();
  const vistos = Object.keys(estado.ejercicios).length;
  const porRepasar = useMemo(() => pendientes(estado.ejercicios, hoy).length, [estado.ejercicios, hoy]);
  const debiles = useMemo(() => temasDebiles(estado.ejercicios, 3), [estado.ejercicios]);

  const unidadesConAvance = UNIDADES.filter((u) => LECCIONES.some((l) => l.unidad.unidad === u.unidad && coronasDe(estado.lecciones, l.leccion.id) > 0)).map(
    (u) => u.unidad,
  );
  const [unidades, setUnidades] = useState<number[]>(() => (unidadesConAvance.length ? unidadesConAvance : [1]));
  const [cantidad, setCantidad] = useState(5);
  const ultimos = estado.examenes.slice(-3).reverse();

  function practicar() {
    const ids = armarPractica(estado.ejercicios, hoy).map((e) => e.id);
    onEmpezar({ tipo: 'practica', ids });
  }

  return (
    <div className="min-h-full">
      <BarraSuperior />
      <main className="mx-auto grid max-w-xl gap-6 px-4 pb-28 pt-5">
        <h1 className="text-3xl font-bold">Practicar</h1>

        <section className="grid gap-4 rounded-[22px] border-2 border-line bg-surface p-5" aria-labelledby="t-desafio">
          <div className="grid gap-1">
            <h2 id="t-desafio" className="flex items-center gap-2 text-2xl font-bold">
              <IconoRayo className="h-7 w-7" />
              Desafío relámpago
            </h2>
            <p className="text-muted">60 segundos de cálculo mental: tablas, dobles, mitades y decenas. Mientras más aciertas, más difícil se pone.</p>
          </div>
          {estado.mejorDesafio > 0 && (
            <p className="rounded-2xl bg-surface-2 px-3 py-2 text-sm font-bold">
              Tu récord: <span className="font-black tabular-nums">{estado.mejorDesafio}</span> cálculos correctos
            </p>
          )}
          <Boton ancho onClick={onDesafio}>
            Jugar desafío
          </Boton>
        </section>

        <section className="grid gap-4 rounded-[22px] border-2 border-line bg-surface p-5" aria-labelledby="t-cuaderno">
          <div className="grid gap-1">
            <h2 id="t-cuaderno" className="flex items-center gap-2 text-2xl font-bold">
              <IconoLapiz className="h-7 w-7" />
              Resuelve en tu cuaderno
            </h2>
            <p className="text-muted">Numi te da 4 ejercicios para hacer con lápiz. Cuando termines, escribes tus resultados y Numi te dice cuáles están bien.</p>
          </div>
          <Boton ancho variante="suave" onClick={onCuaderno}>
            Elegir ejercicios
          </Boton>
        </section>

        <section className="grid gap-4 rounded-[22px] border-2 border-line bg-surface p-5" aria-labelledby="t-repaso">
          <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-3">
            <Numi expresion={vistos ? 'pensando' : 'dormida'} className="h-auto w-20" />
            <div className="grid gap-1">
              <h2 id="t-repaso" className="text-2xl font-bold">
                Repaso inteligente
              </h2>
              <p className="text-muted">
                {vistos === 0
                  ? 'Todavía no hay nada que repasar. Completa tu primera lección y aquí aparecerá lo que conviene reforzar.'
                  : porRepasar > 0
                    ? `Tienes ${porRepasar} ${porRepasar === 1 ? 'ejercicio' : 'ejercicios'} para repasar hoy, empezando por los que más te costaron.`
                    : 'Hoy no hay nada pendiente. Igual puedes reforzar lo que menos dominas.'}
              </p>
            </div>
          </div>
          <p className="flex items-center gap-2 rounded-2xl bg-surface-2 px-3 py-2 text-sm font-bold">
            <IconoCorazon className="h-5 w-5" />
            Los errores aquí no restan vidas, y al terminar recuperas una.
          </p>
          <Boton ancho disabled={vistos === 0} onClick={practicar}>
            Practicar ahora
          </Boton>
          {debiles.length > 0 && (
            <div className="grid gap-2 border-t-2 border-line pt-4">
              <h3 className="text-lg font-semibold">Temas que te cuestan</h3>
              <ul className="grid gap-2">
                {debiles.map((t) => (
                  <li key={t.leccionId} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-xs font-black uppercase tracking-[.08em]" style={{ color: `var(--u${t.unidad})` }}>
                        Unidad {t.unidad}
                      </span>
                      <span className="font-bold">{t.leccionTitulo}</span>
                    </span>
                    <span className="font-black tabular-nums text-bad-text">{t.precision}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="grid gap-4 rounded-[22px] border-2 border-line bg-surface p-5" aria-labelledby="t-examen">
          <div className="grid gap-1">
            <h2 id="t-examen" className="flex items-center gap-2 text-2xl font-bold">
              <IconoReloj className="h-7 w-7" />
              Modo examen
            </h2>
            <p className="text-muted">
              Preguntas al azar de las unidades que elijas, con tiempo: {SEGUNDOS_POR_PREGUNTA_EXAMEN / 60} minuto por pregunta. Verás las respuestas al final,
              como en una prueba. No gasta vidas.
            </p>
          </div>

          <fieldset className="grid gap-2">
            <legend className="mb-2 font-extrabold">Unidades</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {UNIDADES.map((u) => {
                const activa = unidades.includes(u.unidad);
                return (
                  <button
                    key={u.unidad}
                    type="button"
                    aria-pressed={activa}
                    title={u.titulo}
                    onClick={() =>
                      setUnidades((lista) => (activa ? (lista.length > 1 ? lista.filter((x) => x !== u.unidad) : lista) : [...lista, u.unidad].sort()))
                    }
                    className="rounded-2xl border-2 px-2 py-2.5 text-center font-display text-lg font-semibold"
                    style={{
                      borderColor: activa ? `var(--u${u.unidad})` : 'var(--line)',
                      background: activa ? `color-mix(in srgb, var(--u${u.unidad}) 16%, var(--surface))` : 'var(--surface)',
                      color: activa ? 'var(--ink)' : 'var(--muted)',
                    }}
                  >
                    U{u.unidad}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="grid gap-2">
            <legend className="mb-2 font-extrabold">Preguntas</legend>
            <div className="grid grid-cols-3 gap-2">
              {CANTIDADES.map((c) => (
                <button key={c} type="button" aria-pressed={cantidad === c} onClick={() => setCantidad(c)} className="opcion rounded-2xl px-3 py-2.5 text-center font-bold">
                  {c} <span className="text-sm text-muted">· {(c * SEGUNDOS_POR_PREGUNTA_EXAMEN) / 60} min</span>
                </button>
              ))}
            </div>
          </fieldset>

          <Boton ancho onClick={() => onEmpezar({ tipo: 'examen', unidades, cantidad })}>
            Empezar examen
          </Boton>

          {ultimos.length > 0 && (
            <div className="grid gap-2 border-t-2 border-line pt-4">
              <h3 className="text-lg font-semibold">Tus últimos exámenes</h3>
              <ul className="grid gap-1.5 text-[15px]">
                {ultimos.map((e, i) => (
                  <li key={`${e.fecha}-${i}`} className="flex justify-between gap-3">
                    <span>
                      {e.fecha} · Unidades {e.unidades.join(', ')}
                    </span>
                    <span className={`font-extrabold tabular-nums ${e.aprobado ? 'text-ok-text' : 'text-bad-text'}`}>
                      {e.aciertos}/{e.total}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
