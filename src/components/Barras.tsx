// Barra de progreso de la lección y anillo de la meta diaria.

export function BarraProgreso({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  const pct = Math.round(Math.min(Math.max(valor, 0), 1) * 100);
  return (
    <div
      className="h-4 flex-1 overflow-hidden rounded-full bg-line"
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className="h-full rounded-full bg-ok transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function AnilloMeta({ valor, tamano = 38 }: { valor: number; tamano?: number }) {
  const r = 16;
  const largo = 2 * Math.PI * r;
  const pct = Math.min(Math.max(valor, 0), 1);
  return (
    <svg viewBox="0 0 40 40" width={tamano} height={tamano} aria-hidden="true" className="flex-none">
      <circle cx="20" cy="20" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke={pct >= 1 ? 'var(--ok)' : 'var(--amber)'}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={largo}
        strokeDashoffset={largo * (1 - pct)}
        transform="rotate(-90 20 20)"
        style={{ transition: 'stroke-dashoffset .6s ease' }}
      />
    </svg>
  );
}
