// Pintar una fracción: se tocan las partes de una pizza o de una barra. Tocar de nuevo despinta.
import { useState, type KeyboardEvent } from 'react';
import type { FraccionVisual as F } from '../../content/types';
import { TextoGlosario } from '../TextoGlosario';
import { CLASE_PREGUNTA, type PropsEjercicio } from './comun';

const C = 110;
const RADIO = 96;

/** Punto del borde del círculo a `grados` desde las 12, en el sentido del reloj. */
function punto(grados: number, r = RADIO): [number, number] {
  const a = (grados * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)];
}

function rebanada(i: number, n: number): string {
  const [x1, y1] = punto((i * 360) / n);
  const [x2, y2] = punto(((i + 1) * 360) / n);
  return `M${C} ${C} L${x1.toFixed(2)} ${y1.toFixed(2)} A${RADIO} ${RADIO} 0 ${n === 1 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

export function FraccionVisual({ ej, bloqueado, veredicto, onRespuesta }: PropsEjercicio<F>) {
  const [pintadas, setPintadas] = useState<boolean[]>(() => Array.from({ length: ej.partes }, () => false));

  function tocar(i: number) {
    if (bloqueado) return;
    const nuevas = pintadas.map((p, k) => (k === i ? !p : p));
    setPintadas(nuevas);
    const cantidad = nuevas.filter(Boolean).length;
    onRespuesta(cantidad > 0 ? { tipo: 'partes', cantidad } : null);
  }

  const relleno = veredicto === 'correcta' ? 'var(--ok)' : veredicto === 'incorrecta' ? 'var(--bad)' : 'var(--unidad)';
  const props = (i: number) => ({
    role: 'checkbox',
    'aria-checked': pintadas[i],
    'aria-label': `Parte ${i + 1}`,
    tabIndex: bloqueado ? -1 : 0,
    fill: pintadas[i] ? relleno : 'var(--surface-2)',
    stroke: 'var(--line-deep)',
    strokeWidth: 3,
    strokeLinejoin: 'round' as const,
    className: bloqueado ? '' : 'cursor-pointer outline-none focus-visible:opacity-70',
    onClick: () => tocar(i),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tocar(i);
      }
    },
  });

  return (
    <div className="grid gap-4">
      <p className={CLASE_PREGUNTA}>
        <TextoGlosario texto={ej.enunciado} />
      </p>
      {ej.figura === 'circulo' ? (
        <svg viewBox="0 0 220 220" className="mx-auto w-full max-w-[260px] select-none" role="group" aria-label={`Pizza dividida en ${ej.partes} partes iguales`}>
          <circle cx={C} cy={C} r={RADIO + 8} fill="#d9a066" stroke="#b07a43" strokeWidth="3" />
          {pintadas.map((_, i) => (
            <path key={i} d={rebanada(i, ej.partes)} {...props(i)} />
          ))}
        </svg>
      ) : (
        <svg viewBox="0 0 330 90" className="w-full select-none" role="group" aria-label={`Barra dividida en ${ej.partes} partes iguales`}>
          {pintadas.map((_, i) => {
            const ancho = 310 / ej.partes;
            return <rect key={i} x={10 + i * ancho} y={15} width={ancho} height={60} rx={i === 0 || i === ej.partes - 1 ? 8 : 2} {...props(i)} />;
          })}
        </svg>
      )}
      <p className="text-center text-sm font-bold text-muted">Toca las partes para pintarlas. Si te equivocas, tócalas de nuevo.</p>
    </div>
  );
}
