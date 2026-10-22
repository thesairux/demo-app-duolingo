// Banda verde (correcto) o roja (incorrecto) que sube desde abajo después de comprobar.
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { Ejercicio } from '../content/types';
import { useMovimiento } from '../hooks/useMovimiento';
import type { Correccion } from '../lib/evaluar';
import { Boton } from './Boton';
import { Numi } from './Numi';

interface Props {
  ej: Ejercicio;
  correccion: Correccion;
  xp: number;
  frase: string;
  seRepite: boolean;
  onContinuar: () => void;
}

export function Retroalimentacion({ ej, correccion, xp, frase, seRepite, onContinuar }: Props) {
  const boton = useRef<HTMLButtonElement>(null);
  useEffect(() => boton.current?.focus({ preventScroll: true }), []);
  const ok = correccion.correcta;
  const movimiento = useMovimiento();

  return (
    <motion.section
      initial={movimiento ? { y: '100%' } : false}
      animate={{ y: 0 }}
      exit={movimiento ? { y: '100%' } : undefined}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      aria-live="polite"
      className={`absolute inset-x-0 bottom-0 z-30 max-h-[80%] overflow-y-auto border-t-2 ${ok ? 'border-ok bg-ok-soft text-ok-text' : 'border-bad bg-bad-soft text-bad-text'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto grid max-w-xl gap-3 px-4 py-4">
        <div className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3">
          <Numi expresion={ok ? 'celebrando' : 'triste'} className="h-auto w-14" />
          <div>
            <h2 className="text-[22px] font-bold">{ok ? `¡Correcto! +${xp} XP` : 'Respuesta correcta:'}</h2>
            <p className="text-sm font-bold">Numi: {frase}</p>
          </div>
        </div>
        {!ok && <p className="whitespace-pre-line rounded-xl bg-surface px-3 py-2 text-[15px] font-extrabold text-ink">{correccion.solucion}</p>}
        {correccion.nota && <p className="text-[15px] text-ink">{correccion.nota}</p>}
        <p className="text-[15px] text-ink">{ej.explicacion}</p>
        {seRepite && <p className="text-[12.5px] font-bold opacity-85">Esta pregunta se repetirá al final de la lección.</p>}
        <Boton ref={boton} variante={ok ? 'exito' : 'error'} ancho onClick={onContinuar}>
          Continuar
        </Boton>
      </div>
    </motion.section>
  );
}
