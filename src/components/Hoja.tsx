// Hoja que sube desde abajo, con fondo oscurecido. Se cierra con Escape o tocando afuera.
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { useMovimiento } from '../hooks/useMovimiento';

interface Props {
  abierta: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
}

export function Hoja({ abierta, onCerrar, titulo, children }: Props) {
  const movimiento = useMovimiento();
  useEffect(() => {
    if (!abierta) return;
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [abierta, onCerrar]);

  return (
    <AnimatePresence>
      {abierta && (
        <div className="fixed inset-0 z-40 grid items-end" role="dialog" aria-modal="true" aria-label={titulo}>
          <motion.button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/40"
            initial={movimiento ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={movimiento ? { opacity: 0 } : undefined}
            onClick={onCerrar}
          />
          <motion.div
            className="relative mx-auto w-full max-w-xl rounded-t-[28px] border-t-2 border-line bg-surface px-5 pt-5"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
            initial={movimiento ? { y: '100%' } : false}
            animate={{ y: 0 }}
            exit={movimiento ? { y: '100%' } : undefined}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
