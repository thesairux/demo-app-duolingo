// Lluvia de confeti para celebrar. Es solo CSS; no se muestra si las animaciones están apagadas.
import { useEffect, useState, type CSSProperties } from 'react';
import { useMovimiento } from '../hooks/useMovimiento';

const COLORES = ['var(--amber)', 'var(--u1)', 'var(--u2)', 'var(--u3)', 'var(--u4)', 'var(--u5)', 'var(--ok)'];
const DURACION_MS = 3400;

interface Pieza {
  estilo: CSSProperties;
  redonda: boolean;
}

function piezas(cantidad: number): Pieza[] {
  return Array.from({ length: cantidad }, (_, i) => {
    const ancho = 7 + Math.random() * 6;
    return {
      redonda: i % 5 === 0,
      estilo: {
        left: `${Math.random() * 100}%`,
        width: ancho,
        height: i % 5 === 0 ? ancho : ancho * 1.6,
        background: COLORES[i % COLORES.length],
        '--dx': `${(Math.random() - 0.5) * 160}px`,
        '--giro': `${(Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540)}deg`,
        '--dur': `${1.9 + Math.random() * 1.3}s`,
        '--retraso': `${Math.random() * 0.45}s`,
      } as CSSProperties,
    };
  });
}

/** Cada vez que cambia `disparo` (y no es 0 ni false) cae una nueva tanda. */
export function Confeti({ disparo, cantidad = 42 }: { disparo: number | boolean; cantidad?: number }) {
  const movimiento = useMovimiento();
  const [tanda, setTanda] = useState<{ id: number; piezas: Pieza[] } | null>(null);

  useEffect(() => {
    if (!disparo || !movimiento) return;
    setTanda({ id: Date.now(), piezas: piezas(cantidad) });
    const t = window.setTimeout(() => setTanda(null), DURACION_MS);
    return () => window.clearTimeout(t);
  }, [disparo, movimiento, cantidad]);

  if (!tanda) return null;
  return (
    <div key={tanda.id} className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {tanda.piezas.map((p, i) => (
        <span key={i} className={`confeti ${p.redonda ? 'rounded-full' : 'rounded-[2px]'}`} style={p.estilo} />
      ))}
    </div>
  );
}
