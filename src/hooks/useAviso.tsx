// Aviso corto que aparece arriba y se va solo.
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMovimiento } from './useMovimiento';

export function useAviso(duracionMs = 2200) {
  const [texto, setTexto] = useState<string | null>(null);
  const temporizador = useRef<number | undefined>(undefined);
  const movimiento = useMovimiento();

  const avisar = useCallback(
    (mensaje: string) => {
      setTexto(mensaje);
      window.clearTimeout(temporizador.current);
      temporizador.current = window.setTimeout(() => setTexto(null), duracionMs);
    },
    [duracionMs],
  );

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const elemento = (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 grid justify-items-center px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {texto && (
          <motion.p
            initial={movimiento ? { opacity: 0, y: -10 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={movimiento ? { opacity: 0, y: -10 } : undefined}
            className="max-w-sm rounded-2xl bg-ink px-4 py-2.5 text-center text-sm font-extrabold text-surface shadow-lg"
          >
            {texto}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  return { avisar, elemento };
}
