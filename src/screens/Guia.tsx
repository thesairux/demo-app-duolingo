// Guía de la lección: tarjetas cortas que explican el tema antes de practicar.
import { AnimatePresence, motion } from 'framer-motion';
import { useState, type CSSProperties } from 'react';
import { Boton } from '../components/Boton';
import { IconoCerrar } from '../components/Iconos';
import { Numi } from '../components/Numi';
import { TextoGlosario } from '../components/TextoGlosario';
import { buscarLeccion } from '../content';
import { useMovimiento } from '../hooks/useMovimiento';

interface Props {
  leccionId: string;
  /** true si al terminar la guía se empieza la lección. */
  luegoPracticar: boolean;
  onTerminar: () => void;
  onSalir: () => void;
}

export function Guia({ leccionId, luegoPracticar, onTerminar, onSalir }: Props) {
  const ubicada = buscarLeccion(leccionId)!;
  const { leccion, unidad } = ubicada;
  const tarjetas = leccion.guia;
  const [i, setI] = useState(0);
  const movimiento = useMovimiento();
  const t = tarjetas[i];
  const ultima = i === tarjetas.length - 1;
  const estiloUnidad = { '--unidad': `var(--u${unidad.unidad})`, '--unidad-oscuro': `color-mix(in srgb, var(--u${unidad.unidad}) 62%, #000)` } as CSSProperties;

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col" style={estiloUnidad}>
      <header className="flex items-center gap-3 px-4 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <button type="button" aria-label="Cerrar la guía" className="rounded-xl p-1 text-muted" onClick={onSalir}>
          <IconoCerrar className="h-7 w-7" />
        </button>
        <ol className="flex flex-1 gap-1.5" aria-label={`Tarjeta ${i + 1} de ${tarjetas.length}`}>
          {tarjetas.map((_, k) => (
            <li key={k} className="h-2.5 flex-1 rounded-full" style={{ background: k <= i ? 'var(--unidad)' : 'var(--line)' }} />
          ))}
        </ol>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-3">
        <p className="text-xs font-extrabold uppercase tracking-[.1em]" style={{ color: 'var(--unidad)' }}>
          Guía · {leccion.titulo}
        </p>
        {i === 0 && (
          <div className="mt-3 grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3">
            <Numi expresion="feliz" className="h-auto w-16" />
            <p className="rounded-2xl border-2 border-line bg-surface px-3 py-2 font-bold leading-snug">
              Antes de practicar, repasemos lo clave. Son {tarjetas.length} tarjetas cortas.
            </p>
          </div>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={i}
            initial={movimiento ? { x: 40, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            exit={movimiento ? { x: -40, opacity: 0 } : undefined}
            transition={{ duration: 0.2 }}
            className="mt-4 grid gap-4 rounded-[24px] border-2 border-line bg-surface p-5"
          >
            <h1 className="text-[26px] font-bold leading-tight">{t.titulo}</h1>
            <p className="text-[18px] leading-relaxed">
              <TextoGlosario texto={t.texto} />
            </p>
            {t.ejemplo && (
              <p className="rounded-2xl bg-surface-2 px-4 py-3 text-[16px]">
                <span className="mb-1 block text-xs font-black uppercase tracking-[.1em] text-muted">Ejemplo</span>
                <TextoGlosario texto={t.ejemplo} />
              </p>
            )}
          </motion.article>
        </AnimatePresence>
      </main>

      <footer className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-t-2 border-line px-4 pt-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
        <Boton variante="suave" disabled={i === 0} onClick={() => setI(i - 1)} aria-label="Tarjeta anterior">
          ←
        </Boton>
        {ultima ? (
          <Boton variante="unidad" onClick={onTerminar}>
            {luegoPracticar ? '¡A practicar!' : 'Listo'}
          </Boton>
        ) : (
          <Boton onClick={() => setI(i + 1)}>Siguiente</Boton>
        )}
      </footer>
    </div>
  );
}
