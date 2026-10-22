// Reloj de punteros: se arrastran el puntero largo (minutos, de 5 en 5) y el corto (horas). También hay botones.
import { useRef, useState, type PointerEvent } from 'react';
import type { Reloj as R } from '../../content/types';
import { Boton } from '../Boton';
import { TextoGlosario } from '../TextoGlosario';
import { CLASE_PREGUNTA, type PropsEjercicio } from './comun';

const C = 110;
const RADIO = 100;
type Puntero = 'hora' | 'minutos';

/** Ángulo de cada puntero en grados, desde las 12 y en el sentido del reloj. */
const anguloMinutos = (m: number) => m * 6;
const anguloHora = (h: number, m: number) => (h % 12) * 30 + m * 0.5;
/** Diferencia entre dos ángulos, de 0 a 180. */
const distancia = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

export function Reloj({ ej, bloqueado, veredicto, onRespuesta }: PropsEjercicio<R>) {
  const [hora, setHora] = useState(12);
  const [minutos, setMinutos] = useState(0);
  const svg = useRef<SVGSVGElement>(null);
  const tomado = useRef<Puntero | null>(null);

  function fijar(h: number, m: number) {
    if (bloqueado) return;
    const hh = ((((h - 1) % 12) + 12) % 12) + 1;
    const mm = ((m % 60) + 60) % 60;
    setHora(hh);
    setMinutos(mm);
    onRespuesta({ tipo: 'hora', hora: hh, minutos: mm });
  }

  function lectura(e: PointerEvent<SVGSVGElement>) {
    const caja = svg.current!.getBoundingClientRect();
    const x = ((e.clientX - caja.left) / caja.width) * 220 - C;
    const y = ((e.clientY - caja.top) / caja.height) * 220 - C;
    return { angulo: ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360, radio: Math.hypot(x, y) };
  }

  function arrastrar(e: PointerEvent<SVGSVGElement>) {
    const { angulo } = lectura(e);
    if (tomado.current === 'minutos') fijar(hora, Math.round(angulo / 30) * 5);
    else fijar(Math.round((angulo - minutos * 0.5) / 30), minutos);
  }

  const color = veredicto === 'correcta' ? 'var(--ok)' : veredicto === 'incorrecta' ? 'var(--bad)' : 'var(--unidad)';

  return (
    <div className="grid gap-4">
      <p className={CLASE_PREGUNTA}>
        <TextoGlosario texto={ej.enunciado} />
      </p>
      <svg
        ref={svg}
        viewBox="0 0 220 220"
        className="mx-auto w-full max-w-[280px] touch-none select-none"
        role="img"
        aria-label="Reloj de punteros. Arrastra los punteros o usa los botones de abajo."
        onPointerDown={(e) => {
          if (bloqueado) return;
          const { angulo, radio } = lectura(e);
          const aMin = distancia(angulo, anguloMinutos(minutos));
          const aHora = distancia(angulo, anguloHora(hora, minutos));
          // Se toma el puntero más cercano al dedo; si están juntos, el corto queda más cerca del centro.
          tomado.current = Math.abs(aMin - aHora) < 20 ? (radio < 62 ? 'hora' : 'minutos') : aMin < aHora ? 'minutos' : 'hora';
          e.currentTarget.setPointerCapture(e.pointerId);
          arrastrar(e);
        }}
        onPointerMove={(e) => tomado.current && arrastrar(e)}
        onPointerUp={() => (tomado.current = null)}
        onPointerCancel={() => (tomado.current = null)}
      >
        <circle cx={C} cy={C} r={RADIO} fill="var(--surface)" stroke="var(--line-deep)" strokeWidth="5" />
        {Array.from({ length: 60 }, (_, i) => {
          const fuerte = i % 5 === 0;
          const a = (i * 6 * Math.PI) / 180;
          const [r1, r2] = fuerte ? [84, 94] : [89, 94];
          return (
            <line
              key={i}
              x1={C + r1 * Math.sin(a)}
              y1={C - r1 * Math.cos(a)}
              x2={C + r2 * Math.sin(a)}
              y2={C - r2 * Math.cos(a)}
              stroke={fuerte ? 'var(--ink)' : 'var(--line-deep)'}
              strokeWidth={fuerte ? 2.6 : 1.4}
              strokeLinecap="round"
            />
          );
        })}
        {Array.from({ length: 12 }, (_, i) => {
          const n = i + 1;
          const a = (n * 30 * Math.PI) / 180;
          return (
            <text key={n} x={C + 70 * Math.sin(a)} y={C - 70 * Math.cos(a) + 6} textAnchor="middle" style={{ font: '700 17px Fredoka, Nunito, sans-serif', fill: 'var(--ink)' }}>
              {n}
            </text>
          );
        })}
        {veredicto === 'incorrecta' && <Punteros hora={ej.hora} minutos={ej.minutos} color="var(--ok)" tenue />}
        <Punteros hora={hora} minutos={minutos} color={color} />
        <circle cx={C} cy={C} r="7" fill="var(--ink)" />
      </svg>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Boton variante="suave" className="px-2! text-[13px]!" disabled={bloqueado} onClick={() => fijar(hora - 1, minutos)}>
          − 1 hora
        </Boton>
        <Boton variante="suave" className="px-2! text-[13px]!" disabled={bloqueado} onClick={() => fijar(hora + 1, minutos)}>
          + 1 hora
        </Boton>
        <Boton variante="suave" className="px-2! text-[13px]!" disabled={bloqueado} onClick={() => fijar(hora, minutos - 5)}>
          − 5 min
        </Boton>
        <Boton variante="suave" className="px-2! text-[13px]!" disabled={bloqueado} onClick={() => fijar(hora, minutos + 5)}>
          + 5 min
        </Boton>
      </div>
    </div>
  );
}

function Punteros({ hora, minutos, color, tenue = false }: { hora: number; minutos: number; color: string; tenue?: boolean }) {
  return (
    <g opacity={tenue ? 0.45 : 1}>
      <line x1={C} y1={C + 10} x2={C} y2={C - 48} stroke={tenue ? color : 'var(--ink)'} strokeWidth="8" strokeLinecap="round" transform={`rotate(${anguloHora(hora, minutos)} ${C} ${C})`} />
      <line x1={C} y1={C + 14} x2={C} y2={C - 78} stroke={color} strokeWidth="5" strokeLinecap="round" transform={`rotate(${anguloMinutos(minutos)} ${C} ${C})`} />
    </g>
  );
}
