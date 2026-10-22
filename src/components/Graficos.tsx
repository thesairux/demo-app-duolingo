// Gráficos del perfil. Un solo tono (magnitud), valores en color de texto y una tabla para leerlos sin el gráfico.
import { useState } from 'react';

const COLOR = 'var(--grafico)';

function diaCorto(clave: string): string {
  const [y, m, d] = clave.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' }).replace('.', '');
}

/** Columnas de XP por día, con la meta diaria como línea de referencia. */
export function GraficoXPDiaria({ dias, meta }: { dias: { dia: string; xp: number }[]; meta: number }) {
  const [activo, setActivo] = useState<number | null>(null);
  const ancho = 340;
  const alto = 150;
  const ejeX = 22; // banda inferior para las fechas
  const arriba = 18; // espacio para el valor sobre la columna
  const maximo = Math.max(meta, ...dias.map((d) => d.xp), 10);
  const escalaMax = Math.ceil(maximo / 10) * 10;
  const banda = ancho / dias.length;
  const grosor = Math.min(18, banda - 2);
  const y = (v: number) => arriba + (alto - arriba - ejeX) * (1 - v / escalaMax);
  const base = alto - ejeX;
  const hoy = dias.length - 1;
  const mayor = dias.reduce((m, d, i) => (d.xp > dias[m].xp ? i : m), 0);
  const etiquetados = new Set([hoy, ...(dias[mayor].xp > 0 ? [mayor] : [])]);

  return (
    <figure className="grid gap-2">
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="h-auto w-full overflow-visible" role="img" aria-label={`XP de los últimos ${dias.length} días. Hoy: ${dias[hoy].xp} XP. Meta diaria: ${meta} XP.`}>
        {/* línea base y meta */}
        <line x1="0" x2={ancho} y1={base} y2={base} stroke="var(--line-deep)" strokeWidth="1" />
        <line x1="0" x2={ancho} y1={y(meta)} y2={y(meta)} stroke="var(--muted)" strokeWidth="1" opacity=".6" />
        <text x={ancho} y={y(meta) - 4} textAnchor="end" style={{ font: '700 10px Nunito, sans-serif', fill: 'var(--muted)' }}>
          Meta {meta} XP
        </text>
        {dias.map((d, i) => {
          const x = i * banda + (banda - grosor) / 2;
          const alturaBarra = Math.max(0, base - y(d.xp));
          const r = Math.min(4, alturaBarra);
          return (
            <g key={d.dia}>
              {d.xp > 0 && (
                <path
                  d={`M${x},${base} V${base - alturaBarra + r} Q${x},${base - alturaBarra} ${x + r},${base - alturaBarra} H${x + grosor - r} Q${x + grosor},${base - alturaBarra} ${x + grosor},${base - alturaBarra + r} V${base} Z`}
                  fill={COLOR}
                  opacity={activo === null || activo === i ? 1 : 0.55}
                />
              )}
              {(etiquetados.has(i) || activo === i) && (
                <text x={x + grosor / 2} y={y(d.xp) - 5} textAnchor="middle" style={{ font: '800 10.5px Nunito, sans-serif', fill: 'var(--ink)' }}>
                  {d.xp}
                </text>
              )}
              {(i % 2 === hoy % 2 || i === hoy) && (
                <text x={x + grosor / 2} y={alto - 6} textAnchor="middle" style={{ font: `${i === hoy ? 800 : 600} 9.5px Nunito, sans-serif`, fill: i === hoy ? 'var(--ink)' : 'var(--muted)' }}>
                  {i === hoy ? 'hoy' : diaCorto(d.dia).split(' ')[1]}
                </text>
              )}
              {/* zona táctil: toda la columna */}
              <rect
                x={i * banda}
                y={0}
                width={banda}
                height={alto}
                fill="transparent"
                onPointerEnter={() => setActivo(i)}
                onPointerLeave={() => setActivo(null)}
                onClick={() => setActivo(activo === i ? null : i)}
              >
                <title>{`${diaCorto(d.dia)}: ${d.xp} XP`}</title>
              </rect>
            </g>
          );
        })}
      </svg>
      <figcaption className="min-h-5 text-center text-sm font-bold text-muted" aria-live="polite">
        {activo !== null ? `${diaCorto(dias[activo].dia)}: ${dias[activo].xp} XP` : 'Toca una columna para ver el día.'}
      </figcaption>
      <TablaDatos titulo="XP por día" filas={dias.map((d) => [diaCorto(d.dia), `${d.xp} XP`])} />
    </figure>
  );
}

/** Barras horizontales de precisión por unidad (0 a 100%). */
export function GraficoPrecision({ filas }: { filas: { unidad: number; titulo: string; precision: number; respuestas: number }[] }) {
  return (
    <figure className="grid gap-3">
      <ul className="grid gap-3" aria-label="Precisión por unidad">
        {filas.map((f) => (
          <li key={f.unidad} className="grid gap-1">
            {/* minmax(0,1fr): el título se recorta en vez de ensanchar la página en celulares chicos */}
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 text-sm">
              <span className="min-w-0 truncate font-bold">
                <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: `var(--u${f.unidad})` }} aria-hidden="true" />
                Unidad {f.unidad} · {f.titulo}
              </span>
              <span className="flex-none font-black tabular-nums">{f.precision}%</span>
            </div>
            <div className="h-4 rounded-r-[4px]" style={{ width: `${Math.max(f.precision, 1)}%`, background: COLOR }} title={`${f.precision}% en ${f.respuestas} respuestas`} />
          </li>
        ))}
      </ul>
      <TablaDatos titulo="Precisión por unidad" filas={filas.map((f) => [`Unidad ${f.unidad}`, `${f.precision}% (${f.respuestas} respuestas)`])} />
    </figure>
  );
}

function TablaDatos({ titulo, filas }: { titulo: string; filas: [string, string][] }) {
  return (
    <details className="text-sm">
      <summary className="cursor-pointer font-bold text-muted">Ver como tabla</summary>
      <table className="mt-2 w-full border-collapse">
        <caption className="sr-only">{titulo}</caption>
        <tbody>
          {filas.map(([a, b]) => (
            <tr key={a} className="border-b border-line">
              <th scope="row" className="py-1 text-left font-semibold">
                {a}
              </th>
              <td className="py-1 text-right tabular-nums">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
