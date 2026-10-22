// Bloques de base diez: con + y − se ponen cubos de mil, placas de cien, barras de diez y cubitos de uno (hasta 9 de cada uno).
import { useState, type ReactNode } from 'react';
import type { Bloques as B } from '../../content/types';
import { VALORES_BLOQUES } from '../../lib/evaluar';
import { Boton } from '../Boton';
import { TextoGlosario } from '../TextoGlosario';
import { CLASE_PREGUNTA, type PropsEjercicio } from './comun';

const NOMBRES: Record<number, string> = { 1000: 'Mil', 100: 'Cien', 10: 'Diez', 1: 'Uno' };
const MAXIMO = 9;
const BORDE = 'color-mix(in srgb, var(--unidad) 55%, #000)';
const CARA = 'color-mix(in srgb, var(--unidad) 70%, #fff)';

export function Bloques({ ej, bloqueado, veredicto, onRespuesta }: PropsEjercicio<B>) {
  // Sin cubos de mil si el número es menor que 1.000.
  const columnas = VALORES_BLOQUES.filter((v) => ej.respuesta >= 1000 || v < 1000);
  const [cantidades, setCantidades] = useState<number[]>(() => columnas.map(() => 0));

  function cambiar(i: number, delta: number) {
    if (bloqueado) return;
    const nuevas = cantidades.map((c, k) => (k === i ? Math.min(MAXIMO, Math.max(0, c + delta)) : c));
    setCantidades(nuevas);
    // La respuesta siempre va con las 4 columnas: mil, cien, diez y uno.
    const completas = VALORES_BLOQUES.map((v) => nuevas[columnas.indexOf(v)] ?? 0);
    onRespuesta(nuevas.some((c) => c > 0) ? { tipo: 'bloques', cantidades: completas } : null);
  }

  const marco = veredicto === 'correcta' ? 'var(--ok)' : veredicto === 'incorrecta' ? 'var(--bad)' : 'var(--line)';

  return (
    <div className="grid gap-4">
      <p className={CLASE_PREGUNTA}>
        <TextoGlosario texto={ej.enunciado} />
      </p>
      <div className="grid gap-2 rounded-2xl border-2 p-2" style={{ borderColor: marco, gridTemplateColumns: `repeat(${columnas.length}, minmax(0, 1fr))` }}>
        {columnas.map((v, i) => (
          <div key={v} className="grid justify-items-center gap-2 rounded-xl bg-surface-2 px-1 py-2" role="group" aria-label={`Bloques de ${NOMBRES[v].toLowerCase()}`}>
            <span className="text-xs font-black uppercase tracking-[.08em] text-muted">{NOMBRES[v]}</span>
            <div className="grid h-[104px] w-full place-items-center" aria-hidden="true">
              <Dibujo valor={v} cantidad={cantidades[i]} />
            </div>
            <span className="font-display text-2xl font-semibold tabular-nums" aria-live="polite" aria-label={`${cantidades[i]} de ${NOMBRES[v].toLowerCase()}`}>
              {cantidades[i]}
            </span>
            <div className="grid w-full grid-cols-2 gap-1">
              <Boton variante="suave" className="px-0! py-2! text-lg!" disabled={bloqueado || cantidades[i] === 0} onClick={() => cambiar(i, -1)} aria-label={`Quitar un bloque de ${NOMBRES[v].toLowerCase()}`}>
                −
              </Boton>
              <Boton variante="suave" className="px-0! py-2! text-lg!" disabled={bloqueado || cantidades[i] === MAXIMO} onClick={() => cambiar(i, 1)} aria-label={`Poner un bloque de ${NOMBRES[v].toLowerCase()}`}>
                +
              </Boton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Lienzo({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 80 104" className="h-full w-full max-w-[80px]">
      {children}
    </svg>
  );
}

/** Cómo se ve cada tipo de bloque: cubo de mil, placa de cien, barra de diez y cubito de uno. */
function Dibujo({ valor, cantidad }: { valor: number; cantidad: number }) {
  if (cantidad === 0) return <span className="text-sm font-bold text-line-deep">—</span>;
  const lista = Array.from({ length: cantidad }, (_, k) => k);
  if (valor === 1) {
    // Cubitos en filas de 3.
    return (
      <Lienzo>
        {lista.map((k) => (
          <rect key={k} x={14 + (k % 3) * 18} y={24 + Math.floor(k / 3) * 18} width="14" height="14" rx="2" fill="var(--unidad)" stroke={BORDE} strokeWidth="1.5" />
        ))}
      </Lienzo>
    );
  }
  if (valor === 10) {
    // Barras verticales de 10 cuadritos, una al lado de la otra.
    return (
      <Lienzo>
        {lista.map((k) => (
          <g key={k} transform={`translate(${4 + k * 8} 2)`}>
            <rect width="7" height="100" rx="1.5" fill="var(--unidad)" stroke={BORDE} strokeWidth="1" />
            {Array.from({ length: 9 }, (_, j) => (
              <line key={j} x1="0" x2="7" y1={(j + 1) * 10} y2={(j + 1) * 10} stroke={BORDE} strokeWidth="0.8" />
            ))}
          </g>
        ))}
      </Lienzo>
    );
  }
  if (valor === 100) {
    // Placas de 10 × 10, apiladas con un pequeño desfase.
    return (
      <Lienzo>
        {lista.map((k) => (
          <g key={k} transform={`translate(${6 + k * 4} ${8 + k * 6})`}>
            <rect width="40" height="40" rx="2" fill="var(--unidad)" stroke={BORDE} strokeWidth="1.2" />
            {Array.from({ length: 9 }, (_, j) => (
              <g key={j} stroke={BORDE} strokeWidth="0.6">
                <line x1={(j + 1) * 4} x2={(j + 1) * 4} y1="0" y2="40" />
                <line y1={(j + 1) * 4} y2={(j + 1) * 4} x1="0" x2="40" />
              </g>
            ))}
          </g>
        ))}
      </Lienzo>
    );
  }
  // Cubos de mil, dibujados en perspectiva y apilados.
  return (
    <Lienzo>
      {lista.map((k) => (
        <g key={k} transform={`translate(${6 + k * 3} ${12 + k * 6})`}>
          <path d="M0 10 L10 0 L44 0 L34 10 Z" fill={CARA} stroke={BORDE} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M34 10 L44 0 L44 34 L34 44 Z" fill={BORDE} stroke={BORDE} strokeWidth="1.2" strokeLinejoin="round" />
          <rect x="0" y="10" width="34" height="34" fill="var(--unidad)" stroke={BORDE} strokeWidth="1.2" />
        </g>
      ))}
    </Lienzo>
  );
}
