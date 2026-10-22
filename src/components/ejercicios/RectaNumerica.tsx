// Recta numérica: se arrastra el punto (o se toca la recta) hasta el número pedido. Las flechas lo mueven de a una rayita.
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { RectaNumerica as R } from '../../content/types';
import { decimales, formatoValor } from '../../lib/numeros';
import { Boton } from '../Boton';
import { TextoGlosario } from '../TextoGlosario';
import { CLASE_PREGUNTA, type PropsEjercicio } from './comun';

const ANCHO = 340;
const X0 = 32;
const X1 = ANCHO - 32;
const Y = 70;

export function RectaNumerica({ ej, bloqueado, veredicto, onRespuesta }: PropsEjercicio<R>) {
  const rayitas = Math.round((ej.max - ej.min) / ej.paso);
  const [indice, setIndice] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const arrastrando = useRef(false);
  const xDe = (i: number) => X0 + (i / rayitas) * (X1 - X0);
  const valorDe = (i: number) => Number((ej.min + i * ej.paso).toFixed(decimales(ej.paso)));
  const actual = indice ?? 0;

  function mover(i: number) {
    if (bloqueado) return;
    const nuevo = Math.min(rayitas, Math.max(0, i));
    setIndice(nuevo);
    onRespuesta({ tipo: 'valor', valor: valorDe(nuevo) });
  }

  function desdePuntero(e: PointerEvent<SVGSVGElement>) {
    const caja = svg.current!.getBoundingClientRect();
    const x = ((e.clientX - caja.left) / caja.width) * ANCHO;
    mover(Math.round(((x - X0) / (X1 - X0)) * rayitas));
  }

  function teclado(e: KeyboardEvent<SVGSVGElement>) {
    const pasos: Record<string, number> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 };
    if (e.key in pasos) mover(actual + pasos[e.key]);
    else if (e.key === 'Home') mover(0);
    else if (e.key === 'End') mover(rayitas);
    else return;
    e.preventDefault();
  }

  const color = veredicto === 'correcta' ? 'var(--ok)' : veredicto === 'incorrecta' ? 'var(--bad)' : 'var(--unidad)';
  const correcta = Math.round((ej.respuesta - ej.min) / ej.paso);

  return (
    <div className="grid gap-4">
      <p className={CLASE_PREGUNTA}>
        <TextoGlosario texto={ej.enunciado} />
      </p>
      <svg
        ref={svg}
        viewBox={`0 0 ${ANCHO} 110`}
        className="w-full touch-none select-none rounded-2xl border-2 border-line bg-surface outline-none focus-visible:border-select"
        role="slider"
        tabIndex={bloqueado ? -1 : 0}
        aria-label="Punto en la recta numérica"
        aria-valuemin={ej.min}
        aria-valuemax={ej.max}
        aria-valuenow={valorDe(actual)}
        aria-valuetext={formatoValor(valorDe(actual), ej.paso)}
        aria-disabled={bloqueado}
        onKeyDown={teclado}
        onPointerDown={(e) => {
          if (bloqueado) return;
          arrastrando.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          desdePuntero(e);
        }}
        onPointerMove={(e) => arrastrando.current && desdePuntero(e)}
        onPointerUp={() => (arrastrando.current = false)}
        onPointerCancel={() => (arrastrando.current = false)}
      >
        <line x1={X0 - 10} y1={Y} x2={X1 + 10} y2={Y} stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        {Array.from({ length: rayitas + 1 }, (_, i) => {
          const conNumero = i % ej.etiquetaCada === 0 || i === rayitas;
          return (
            <g key={i}>
              <line x1={xDe(i)} y1={Y - (conNumero ? 11 : 7)} x2={xDe(i)} y2={Y + (conNumero ? 11 : 7)} stroke="var(--ink)" strokeWidth={conNumero ? 2.6 : 1.8} />
              {conNumero && (
                <text x={xDe(i)} y={Y + 32} textAnchor="middle" style={{ font: '700 13px Nunito, sans-serif', fill: 'var(--muted)' }}>
                  {formatoValor(valorDe(i), ej.paso)}
                </text>
              )}
            </g>
          );
        })}
        {veredicto === 'incorrecta' && <Marcador x={xDe(correcta)} color="var(--ok)" tenue />}
        <Marcador x={xDe(actual)} color={color} tenue={indice === null} />
      </svg>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <Boton variante="suave" disabled={bloqueado || actual === 0} onClick={() => mover(actual - 1)} aria-label="Mover a la izquierda">
          ◀
        </Boton>
        <p className="text-center text-sm font-bold text-muted">{indice === null ? 'Arrastra el punto o toca la recta.' : 'Cada rayita vale ' + formatoValor(ej.paso, ej.paso) + '.'}</p>
        <Boton variante="suave" disabled={bloqueado || actual === rayitas} onClick={() => mover(actual + 1)} aria-label="Mover a la derecha">
          ▶
        </Boton>
      </div>
    </div>
  );
}

/** El punto que se arrastra: una gota sobre la recta. */
function Marcador({ x, color, tenue = false }: { x: number; color: string; tenue?: boolean }) {
  return (
    <g transform={`translate(${x} ${Y})`} opacity={tenue ? 0.55 : 1} style={{ transition: 'transform 90ms ease-out' }}>
      <path d="M0 -4 C-11 -16 -12 -26 -12 -32 A12 12 0 0 1 12 -32 C12 -26 11 -16 0 -4 Z" fill={color} stroke="var(--surface)" strokeWidth="2.5" />
      <circle cx="0" cy="-32" r="4.5" fill="var(--surface)" />
      <circle cx="0" cy="0" r="5" fill={color} stroke="var(--surface)" strokeWidth="2" />
    </g>
  );
}
