// Cofre del camino: se sacude mientras espera, se abre al tocarlo y suelta gemas.
import type { CSSProperties } from 'react';

export type FaseCofre = 'cerrado' | 'abriendo' | 'abierto';

const MADERA = '#9c5b2e';
const MADERA_CLARA = '#b8733d';
const MADERA_OSCURA = '#6e3d1d';
const ORO = '#f5b400';
const ORO_OSCURO = '#c98a00';

/** Hacia dónde salta cada gema y con cuánto retraso. */
const GEMAS = [
  { dx: -58, dy: -62, giro: -24, retraso: 0 },
  { dx: -24, dy: -88, giro: 12, retraso: 0.06 },
  { dx: 18, dy: -96, giro: -10, retraso: 0.03 },
  { dx: 56, dy: -66, giro: 22, retraso: 0.09 },
  { dx: -40, dy: -30, giro: 30, retraso: 0.12 },
  { dx: 42, dy: -34, giro: -30, retraso: 0.15 },
];

function Gema({ color }: { color: string }) {
  return (
    <g>
      <path d="M-9 -7h18l5 7-14 16-14-16z" fill={color} />
      <path d="M-14 0h28M-4.5 -7l4.5 23 4.5-23" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" fill="none" />
    </g>
  );
}

export function CofreAnimado({ fase }: { fase: FaseCofre }) {
  const abierto = fase !== 'cerrado';
  return (
    // El viewBox parte en -50 para dejar espacio a la tapa abierta y a las gemas que saltan.
    <svg viewBox="0 -50 200 220" className={`cofre-animado ${abierto ? 'cofre-abierto' : 'cofre-cerrado'} h-auto w-48 overflow-visible`} aria-hidden="true">
      {/* rayos de luz detrás */}
      <g className="cofre-rayos" style={{ transformOrigin: '100px 92px' }}>
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M100 92 L92 -10 L108 -10 Z" fill="var(--amber)" opacity=".45" transform={`rotate(${i * 30} 100 92)`} />
        ))}
      </g>
      <g className="cofre-cuerpo">
        {/* sombra */}
        <ellipse cx="100" cy="158" rx="70" ry="8" fill="#000" opacity=".18" />
        {/* luz que sale de adentro */}
        <ellipse className="cofre-brillo" cx="100" cy="88" rx="52" ry="10" fill="#fff3b0" />
        {/* caja */}
        <rect x="32" y="86" width="136" height="68" rx="10" fill={MADERA} />
        <rect x="32" y="106" width="136" height="6" fill={MADERA_OSCURA} opacity=".45" />
        <rect x="32" y="130" width="136" height="6" fill={MADERA_OSCURA} opacity=".45" />
        <rect x="32" y="86" width="14" height="68" rx="5" fill={ORO} />
        <rect x="154" y="86" width="14" height="68" rx="5" fill={ORO} />
        <rect x="88" y="94" width="24" height="28" rx="5" fill={ORO} />
        <circle cx="100" cy="105" r="4" fill={MADERA_OSCURA} />
        <rect x="98" y="106" width="4" height="9" rx="1.5" fill={MADERA_OSCURA} />
        {/* gemas que saltan al abrir */}
        {GEMAS.map((g, i) => (
          <g
            key={i}
            className="cofre-gema"
            style={{ '--dx': `${g.dx}px`, '--dy': `${g.dy}px`, '--giro': `${g.giro}deg`, '--retraso': `${0.18 + g.retraso}s` } as CSSProperties}
          >
            <g transform="translate(100 88)">
              <Gema color={i % 2 ? 'var(--u2)' : 'var(--u1)'} />
            </g>
          </g>
        ))}
        {/* tapa: gira sobre la bisagra de la izquierda */}
        <g className="cofre-tapa">
          <path d="M28 88 V66 Q28 34 100 34 Q172 34 172 66 V88 Z" fill={MADERA_CLARA} />
          <path d="M28 88 V66 Q28 34 100 34 Q172 34 172 66 V88 Z" fill="none" stroke={MADERA_OSCURA} strokeOpacity=".35" strokeWidth="3" />
          <path d="M28 70 Q28 40 46 37 V88 H28 Z M172 70 Q172 40 154 37 V88 H172 Z" fill={ORO} />
          <rect x="28" y="80" width="144" height="8" rx="3" fill={ORO_OSCURO} />
          <rect x="88" y="74" width="24" height="16" rx="4" fill={ORO} />
          <path d="M60 50 Q100 42 140 50" stroke="#fff" strokeOpacity=".3" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      </g>
    </svg>
  );
}
