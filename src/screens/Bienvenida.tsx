// Primera vez: Numi se presenta y se elige la meta diaria.
import { useState } from 'react';
import { Boton } from '../components/Boton';
import { Numi } from '../components/Numi';
import { useJuego } from '../hooks/useJuego';
import { METAS, type MetaDiaria } from '../lib/estado';

const DETALLE_META: Record<MetaDiaria, { nombre: string; detalle: string }> = {
  10: { nombre: 'Tranqui', detalle: 'Media lección o una corta al día' },
  20: { nombre: 'Normal', detalle: 'Una lección al día' },
  30: { nombre: 'Seria', detalle: 'Unas dos lecciones al día' },
  50: { nombre: 'Intensa', detalle: 'Unas tres lecciones al día' },
};

export function Bienvenida() {
  const { crearPerfil } = useJuego();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [apodo, setApodo] = useState('');
  const [meta, setMeta] = useState<MetaDiaria>(20);

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-5 py-8" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 32px)' }}>
      {paso === 1 ? (
        <>
          <div className="relative grid justify-items-center pt-16">
            <p className="absolute left-0 top-0 max-w-[260px] rounded-2xl border-2 border-line bg-surface px-4 py-3 font-extrabold leading-snug">
              ¡Hola! Soy Numi. Te voy a acompañar a practicar matemática jugando.
            </p>
            <Numi expresion="feliz" className="h-auto w-52" etiqueta="Numi, un búho con birrete y un libro de números" />
          </div>
          <div className="grid gap-2">
            <p className="w-fit rounded-full bg-select-soft px-3 py-1 text-xs font-black uppercase tracking-[.1em] text-select">Demo · Matemática 4° básico</p>
            <h1 className="text-4xl font-bold">Numi Mates</h1>
            <p className="text-lg text-muted">
              Practica en pocos minutos los números grandes, la multiplicación, las fracciones y la geometría de 4° básico.
            </p>
          </div>
          <label className="grid gap-2" htmlFor="apodo">
            <span className="font-extrabold">¿Cómo te llamo? (opcional)</span>
            <input
              id="apodo"
              value={apodo}
              maxLength={20}
              onChange={(e) => setApodo(e.target.value)}
              placeholder="Tu apodo"
              autoComplete="nickname"
              className="rounded-2xl border-2 border-line bg-surface px-4 py-3 text-lg font-bold outline-none focus:border-select"
            />
            <span className="text-sm text-muted">Usa un apodo, no tu nombre completo. Todo queda guardado solo en este dispositivo.</span>
          </label>
          <Boton ancho className="mt-auto" onClick={() => setPaso(2)}>
            Siguiente
          </Boton>
        </>
      ) : (
        <>
          <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-4">
            <Numi expresion="pensando" className="h-auto w-24" />
            <h1 className="text-[28px] font-bold leading-tight">¿Cuánto quieres practicar cada día?</h1>
          </div>
          <div className="grid gap-3" role="radiogroup" aria-label="Meta diaria">
            {METAS.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={meta === m}
                aria-pressed={meta === m}
                onClick={() => setMeta(m)}
                className="opcion grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
              >
                <span>
                  <span className="block font-display text-xl font-semibold">{DETALLE_META[m].nombre}</span>
                  <span className="text-sm font-semibold text-muted">{DETALLE_META[m].detalle}</span>
                </span>
                <span className="font-black tabular-nums">{m} XP</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">Puedes cambiarla cuando quieras desde los ajustes.</p>
          <div className="mt-auto grid gap-3">
            <Boton ancho onClick={() => crearPerfil(apodo, meta)}>
              Empezar a aprender
            </Boton>
            <Boton ancho variante="suave" onClick={() => setPaso(1)}>
              Volver
            </Boton>
          </div>
        </>
      )}
    </main>
  );
}
