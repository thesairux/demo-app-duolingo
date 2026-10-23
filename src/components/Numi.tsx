// Numi: búho con birrete y un libro de números. Diseño original en SVG.
import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';
import { useJuego } from '../hooks/useJuego';
import { useMovimiento } from '../hooks/useMovimiento';
import { ACCESORIOS, type Atuendo, type IdAccesorio } from '../lib/tienda';

export type Expresion = 'feliz' | 'celebrando' | 'triste' | 'pensando' | 'preocupada' | 'dormida';

const OSCURO = 'var(--nm-dark)';

function Trazo({ d, ancho = 3.2 }: { d: string; ancho?: number }) {
  return <path d={d} fill="none" stroke={OSCURO} strokeWidth={ancho} strokeLinecap="round" />;
}

/** Ojo abierto de búho: iris amarillo grande, pupila y brillo. */
function Ojo({ x, y, r = 6.5, dx = 0, dy = 0 }: { x: number; y: number; r?: number; dx?: number; dy?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={12.5} fill="var(--nm-iris)" stroke={OSCURO} strokeWidth="1.8" />
      <ellipse cx={x + dx} cy={y + dy} rx={r - 0.6} ry={r + 0.6} fill={OSCURO} />
      <circle cx={x + 2.4 + dx} cy={y - 3 + dy} r={2.3} fill="#fff" />
    </>
  );
}

/** Un ala con forma de gota: la punta redonda va en el hombro y la punta fina es el extremo del ala. */
function Ala({ x, y, giro }: { x: number; y: number; giro: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro})`}>
      <path d="M0 -24 C12 -23 15 -5 11 8 C8 17 3 23 0 26 C-3 23 -8 17 -11 8 C-15 -5 -12 -23 0 -24 Z" fill="var(--nm-ear)" />
      <path d="M-7 -6 Q0 0 7 -6 M-6 5 Q0 11 6 5" fill="none" stroke={OSCURO} strokeOpacity=".28" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

const ALA_NORMAL = <Ala x={152} y={157} giro={-16} />;
const TEXTO_ZETA = { fontFamily: 'Fredoka, Nunito, sans-serif', fontWeight: 700, fill: 'var(--muted)' } as const;

interface Partes {
  ojos: ReactNode;
  cejas?: ReactNode;
  pico: 'cerrado' | 'abierto';
  /** El ala derecha: quieta, saludando o en la barbilla. */
  ala: ReactNode;
  extra?: ReactNode;
}

function partes(expresion: Expresion): Partes {
  switch (expresion) {
    case 'celebrando':
      return {
        ojos: (
          <>
            <Trazo d="M73 92 Q82 81 91 92" ancho={4} />
            <Trazo d="M109 92 Q118 81 127 92" ancho={4} />
          </>
        ),
        pico: 'abierto',
        ala: (
          <g className="numi-saludo">
            <Ala x={161} y={114} giro={-140} />
          </g>
        ),
        extra: (
          <>
            {[
              [24, 34, 'var(--u1)', 20],
              [172, 52, 'var(--u5)', -15],
              [18, 96, 'var(--nm-hat)', 35],
              [184, 92, 'var(--u4)', 10],
              [38, 10, 'var(--u2)', -30],
              [160, 10, 'var(--u3)', 25],
            ].map(([x, y, color, giro], i) => (
              <g key={`${x}-${y}`} className="numi-destello" style={{ animationDelay: `${i * 0.18}s` }}>
                <rect x={x} y={y} width="10" height="5" rx="1.5" fill={color as string} transform={`rotate(${giro} ${x} ${y})`} />
              </g>
            ))}
          </>
        ),
      };
    case 'triste':
      return {
        ojos: (
          <>
            <Ojo x={82} y={90} r={5.2} dy={2.5} />
            <Ojo x={118} y={90} r={5.2} dy={2.5} />
          </>
        ),
        cejas: (
          <>
            <Trazo d="M70 79 L89 72" ancho={3.4} />
            <Trazo d="M130 79 L111 72" ancho={3.4} />
          </>
        ),
        pico: 'cerrado',
        ala: ALA_NORMAL,
        extra: (
          <g className="numi-gota">
            <path d="M72 101 Q67 109 72 112 Q77 109 72 101 Z" fill="#7CC4F2" />
          </g>
        ),
      };
    case 'pensando':
      return {
        ojos: (
          <>
            <Ojo x={82} y={90} dx={2.5} dy={-3} />
            <Ojo x={118} y={90} dx={2.5} dy={-3} />
          </>
        ),
        cejas: <Trazo d="M109 74 Q118 68 128 72" ancho={3.4} />,
        pico: 'cerrado',
        ala: <Ala x={125} y={129} giro={118} />,
        extra: (
          <g className="numi-flota">
            <circle cx="150" cy="56" r="4" fill="var(--surface)" stroke="var(--line-deep)" strokeWidth="2" />
            <circle cx="160" cy="42" r="6" fill="var(--surface)" stroke="var(--line-deep)" strokeWidth="2" />
            <circle cx="178" cy="22" r="14" fill="var(--surface)" stroke="var(--line-deep)" strokeWidth="2" />
            <text x="178" y="29" textAnchor="middle" style={{ ...TEXTO_ZETA, fontSize: 19 }}>
              ?
            </text>
          </g>
        ),
      };
    case 'preocupada':
      return {
        ojos: (
          <>
            <Ojo x={82} y={90} r={7.8} />
            <Ojo x={118} y={90} r={7.8} />
          </>
        ),
        cejas: (
          <>
            <Trazo d="M69 78 L89 71" ancho={3.4} />
            <Trazo d="M131 78 L111 71" ancho={3.4} />
          </>
        ),
        pico: 'cerrado',
        ala: ALA_NORMAL,
        extra: (
          <g className="numi-gota" style={{ animationDuration: '1.6s' }}>
            <path d="M156 70 Q149 81 156 86 Q163 81 156 70 Z" fill="#7CC4F2" />
          </g>
        ),
      };
    case 'dormida':
      return {
        ojos: (
          <>
            <Trazo d="M73 91 Q82 97 91 91" ancho={3.6} />
            <Trazo d="M109 91 Q118 97 127 91" ancho={3.6} />
          </>
        ),
        pico: 'cerrado',
        ala: ALA_NORMAL,
        extra: (
          <>
            {[
              [150, 46, 22, 'Z'],
              [168, 30, 16, 'z'],
              [181, 18, 12, 'z'],
            ].map(([x, y, tam, letra], i) => (
              <g key={i} className="numi-zeta" style={{ animationDelay: `${i * 0.9}s` }}>
                <text x={x} y={y} style={{ ...TEXTO_ZETA, fontSize: tam }}>
                  {letra}
                </text>
              </g>
            ))}
          </>
        ),
      };
    default:
      return {
        ojos: (
          <>
            <Ojo x={82} y={90} />
            <Ojo x={118} y={90} />
          </>
        ),
        pico: 'cerrado',
        ala: ALA_NORMAL,
      };
  }
}

function Pico({ abierto }: { abierto: boolean }) {
  if (!abierto) {
    return (
      <g>
        <path d="M92 103 Q100 99 108 103 L101.5 116 Q100 118 98.5 116 Z" fill="var(--nm-beak)" />
        <path d="M95 104 Q100 102 103 103.5" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx="100" cy="112" rx="6" ry="5" fill="#B5473A" />
      <path d="M92 102 Q100 98 108 102 L101.5 110 Q100 112 98.5 110 Z" fill="var(--nm-beak)" />
      <path d="M94.5 114 L105.5 114 L100.8 121 Q100 122 99.2 121 Z" fill="var(--nm-beak)" />
    </g>
  );
}

/** Plumas en forma de «v» sobre la guata. */
const PLUMAS = [
  [88, 152],
  [112, 152],
  [100, 164],
  [80, 172],
  [120, 172],
  [92, 184],
  [108, 184],
  [100, 196],
];

// ---------- Accesorios de la tienda ----------

const MARCO = '#1B2836';

function Lentes({ sol }: { sol: boolean }) {
  return (
    <g>
      {[82, 118].map((x) => (
        <circle key={x} cx={x} cy={90} r={15} fill={sol ? MARCO : '#BFE3FF'} fillOpacity={sol ? 0.92 : 0.28} stroke={MARCO} strokeWidth={3} />
      ))}
      {sol && <path d="M73 85 Q77 80 83 81 M109 85 Q113 80 119 81" stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" fill="none" />}
      <path d="M97 89 Q100 86 103 89 M67 88 L54 83 M133 88 L146 83" stroke={MARCO} strokeWidth={3} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Corbata() {
  return (
    <g>
      <path d="M96 145 L104 145 L108 172 L100 181 L92 172 Z" fill="#C0392B" />
      <path d="M94 136 L106 136 L104 146 L96 146 Z" fill="#962D22" />
    </g>
  );
}

function Humita() {
  return (
    <g>
      <path d="M100 141 L85 133 L85 149 Z M100 141 L115 133 L115 149 Z" fill="#2B3A55" />
      <circle cx="100" cy="141" r="4" fill="#3F5378" />
    </g>
  );
}

function Bufanda() {
  return (
    <g>
      <path d="M58 128 Q100 150 142 128 L144 139 Q100 162 56 139 Z" fill="#11998D" />
      <path d="M118 147 L132 142 L137 177 L123 179 Z" fill="#0E7F75" />
      <path d="M70 135 L72 145 M86 141 L87 151 M114 141 L113 151 M130 135 L128 145 M124 179 L124 184 M129 178 L130 183 M134 177 L135 182" stroke="#0B6158" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

function Chaleco() {
  return (
    <g>
      <path d="M64 128 C51 141 46 158 47 176 C48 190 55 200 66 206 L86 206 L86 134 Z M136 128 C149 141 154 158 153 176 C152 190 145 200 134 206 L114 206 L114 134 Z" fill="#FF7A1A" />
      <path d="M48 167 H86 V174 H48 Z M51 185 H86 V192 H52 Z M152 167 H114 V174 H152 Z M149 185 H114 V192 H148 Z" fill="#E6EDF4" />
    </g>
  );
}

function Antiparras() {
  return (
    <g>
      <path d="M63 90 L50 86 M137 90 L150 86" stroke="#2B3A55" strokeWidth={5} strokeLinecap="round" />
      <rect x="63" y="75" width="74" height="30" rx="14" fill="#BFE3FF" fillOpacity=".35" stroke="#FF8C1A" strokeWidth={3.5} />
      <path d="M71 84 Q75 79 82 79 M107 84 Q111 79 118 79" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  );
}

const CORAZON = 'M0 11 C-6 6 -13 1 -13 -5 C-13 -10 -9 -12 -6 -12 C-3 -12 -1 -10 0 -7 C1 -10 3 -12 6 -12 C9 -12 13 -10 13 -5 C13 1 6 6 0 11 Z';

function LentesCorazon() {
  return (
    <g>
      {[82, 118].map((x) => (
        <path key={x} d={CORAZON} transform={`translate(${x} 91) scale(1.35)`} fill="#E2508C" fillOpacity=".85" stroke="#B33669" strokeWidth={2} strokeLinejoin="round" />
      ))}
      <path d="M71 85 Q73 80 78 80 M107 85 Q109 80 114 80" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M97 86 Q100 83 103 86 M65 86 L54 82 M135 86 L146 82" stroke="#B33669" strokeWidth={2.5} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Lentes3D() {
  return (
    <g>
      <rect x="65" y="78" width="31" height="24" rx="3" fill="#E53935" fillOpacity=".8" stroke="#F4F6F8" strokeWidth={3.5} />
      <rect x="104" y="78" width="31" height="24" rx="3" fill="#00B8D4" fillOpacity=".8" stroke="#F4F6F8" strokeWidth={3.5} />
      <path d="M96 88 H104 M65 87 L54 83 M135 87 L146 83" stroke="#F4F6F8" strokeWidth={3.5} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Monoculo() {
  return (
    <g>
      <path d="M129 100 Q146 116 132 138" stroke="#C99700" strokeWidth={2} strokeDasharray="2 2.5" fill="none" />
      <circle cx="118" cy="90" r="15" fill="#BFE3FF" fillOpacity=".3" stroke="#E0A800" strokeWidth={3} />
      <path d="M109 85 Q113 80 119 80" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  );
}

function Credencial() {
  return (
    <g>
      <path d="M82 133 L106 158 M126 131 L110 158" stroke="#2F7FD8" strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <rect x="104" y="155" width="8" height="6" rx="1.5" fill="#9AA8B6" />
      <rect x="97" y="160" width="22" height="30" rx="3" fill="#fff" stroke="#C3CDD8" strokeWidth={1.5} />
      <rect x="101" y="164" width="8" height="9" rx="1.5" fill="#F5B400" />
      <path d="M111 166 H116 M111 170 H115" stroke="#9AA8B6" strokeWidth={1.6} strokeLinecap="round" />
      <path d="M97 181 H119 V187 Q119 190 116 190 H100 Q97 190 97 187 Z" fill="#2F7FD8" />
    </g>
  );
}

function Panuelo() {
  return (
    <g>
      <path d="M62 130 Q100 148 138 130 L100 172 Z" fill="#D93A3A" stroke="#A82727" strokeWidth={2} strokeLinejoin="round" />
      {[
        [84, 141],
        [100, 146],
        [116, 141],
        [92, 155],
        [108, 155],
        [100, 164],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2} fill="#fff" />
      ))}
    </g>
  );
}

const FLORES = Array.from({ length: 9 }, (_, i) => {
  const t = i / 8;
  return { x: 62 + 76 * t, y: 130 + 56 * t * (1 - t) };
});
const COLORES_FLOR = ['#FF6FA5', '#FFD23F', '#FF8C42', '#B57BFF'];

function CollarFlores() {
  return (
    <g>
      {FLORES.map(({ x, y }, i) => (
        <g key={i}>
          {[0, 72, 144, 216, 288].map((angulo) => (
            <circle key={angulo} cx={x + 3.6 * Math.cos((angulo * Math.PI) / 180)} cy={y + 3.6 * Math.sin((angulo * Math.PI) / 180)} r={3.4} fill={COLORES_FLOR[i % COLORES_FLOR.length]} />
          ))}
          <circle cx={x} cy={y} r={2} fill="#FFF3B0" />
        </g>
      ))}
    </g>
  );
}

function Medalla() {
  return (
    <g>
      <path d="M88 132 L103 152" stroke="#2F7FD8" strokeWidth={7} />
      <path d="M122 132 L107 152" stroke="#E53935" strokeWidth={7} />
      <circle cx="105" cy="161" r="10" fill="#E0A800" stroke="#A87600" strokeWidth={2} />
      <path d="M105 155.5 L106.35 159.14 L110.23 159.3 L107.19 161.71 L108.23 165.45 L105 163.3 L101.77 165.45 L102.81 161.71 L99.77 159.3 L103.65 159.14 Z" fill="#FFF0A0" />
    </g>
  );
}

function Overol() {
  return (
    <g>
      <path d="M84 148 L70 122 M116 148 L130 122" stroke="#2F6BB3" strokeWidth={7} strokeLinecap="round" />
      <rect x="80" y="144" width="40" height="38" rx="4" fill="#2F6BB3" />
      <path d="M46.7 176 A56 52 0 0 0 153.3 176 Z" fill="#2F6BB3" />
      <rect x="91" y="156" width="18" height="13" rx="2" fill="#25588F" />
      <path d="M100 186 V212" stroke="#25588F" strokeWidth={2} />
      <circle cx="85" cy="150" r="3" fill="#F5B400" />
      <circle cx="115" cy="150" r="3" fill="#F5B400" />
    </g>
  );
}

function Delantal() {
  return (
    <g>
      <path d="M84 145 L76 124 M116 145 L124 124 M76 168 L48 166 M124 168 L152 166" stroke="#F4F6F8" strokeWidth={3} strokeLinecap="round" />
      <path d="M80 144 L120 144 L126 204 Q100 212 74 204 Z" fill="#fff" stroke="#C3CDD8" strokeWidth={2} strokeLinejoin="round" />
      <rect x="90" y="176" width="20" height="14" rx="3" fill="#F2F5F8" stroke="#C3CDD8" strokeWidth={1.5} />
      <path d="M80 152 H120" stroke="#E53935" strokeWidth={3} />
    </g>
  );
}

function Bata() {
  return (
    <g>
      <path d="M64 128 C51 141 46 158 47 176 C48 192 56 204 68 210 L90 210 L90 140 Z M136 128 C149 141 154 158 153 176 C152 192 144 204 132 210 L110 210 L110 140 Z" fill="#F7FAFC" stroke="#C3CDD8" strokeWidth={2} strokeLinejoin="round" />
      <path d="M80 134 Q84 166 101 168" stroke="#5B6B7C" strokeWidth={3} strokeLinecap="round" fill="none" />
      <circle cx="104" cy="169" r="5" fill="#C3CDD8" stroke="#5B6B7C" strokeWidth={2} />
      <rect x="126" y="168" width="3.5" height="12" rx="1" fill="#2F7FD8" />
      <rect x="120" y="176" width="20" height="14" rx="2" fill="#EEF2F6" stroke="#C3CDD8" strokeWidth={1.5} />
    </g>
  );
}

function Terno() {
  return (
    <g>
      <path d="M86 134 L114 134 L100 180 Z" fill="#fff" />
      <path d="M64 128 C51 141 46 158 47 176 C48 190 55 200 66 206 L100 206 L100 180 L86 134 Z M136 128 C149 141 154 158 153 176 C152 190 145 200 134 206 L100 206 L100 180 L114 134 Z" fill="#2B3A55" />
      <path d="M86 134 L95 160 L89 158 L80 140 Z M114 134 L105 160 L111 158 L120 140 Z" fill="#3F5378" />
      <path d="M118 157 L121 152 L124 156 L127 152 L130 157 Z" fill="#fff" />
      <path d="M117 157 H131" stroke="#1B2836" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx="100" cy="188" r="2.5" fill="#1B2836" />
      <circle cx="100" cy="198" r="2.5" fill="#1B2836" />
    </g>
  );
}

/** La capa va detrás de Numi; adelante solo se ven los broches en los hombros. */
function CapaDetras() {
  return (
    <g>
      <path d="M62 126 Q24 186 32 214 L168 214 Q176 186 138 126 Z" fill="#D62F3A" />
      <path d="M44 168 Q38 194 42 212 M156 168 Q162 194 158 212" stroke="#A8232C" strokeWidth={2.5} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Capa() {
  return (
    <g>
      <path d="M72 134 Q58 128 48 140 M128 134 Q142 128 152 140" stroke="#D62F3A" strokeWidth={6} strokeLinecap="round" fill="none" />
      <circle cx="72" cy="134" r="4.5" fill="#F5C518" stroke="#A87600" strokeWidth={1.5} />
      <circle cx="128" cy="134" r="4.5" fill="#F5C518" stroke="#A87600" strokeWidth={1.5} />
    </g>
  );
}

function Accesorio({ id }: { id: IdAccesorio | null }) {
  switch (id) {
    case 'lentes':
      return <Lentes sol={false} />;
    case 'lentes-sol':
      return <Lentes sol />;
    case 'antiparras':
      return <Antiparras />;
    case 'lentes-corazon':
      return <LentesCorazon />;
    case 'lentes-3d':
      return <Lentes3D />;
    case 'monoculo':
      return <Monoculo />;
    case 'corbata':
      return <Corbata />;
    case 'humita':
      return <Humita />;
    case 'bufanda':
      return <Bufanda />;
    case 'credencial':
      return <Credencial />;
    case 'panuelo':
      return <Panuelo />;
    case 'collar-flores':
      return <CollarFlores />;
    case 'medalla':
      return <Medalla />;
    case 'chaleco':
      return <Chaleco />;
    case 'overol':
      return <Overol />;
    case 'delantal':
      return <Delantal />;
    case 'bata':
      return <Bata />;
    case 'terno':
      return <Terno />;
    case 'capa':
      return <Capa />;
    default:
      return null;
  }
}

interface Props {
  expresion?: Expresion;
  className?: string;
  /** Texto para lectores de pantalla. Si falta, Numi se trata como decorativo. */
  etiqueta?: string;
  /** Para probarle ropa en la tienda; si falta, usa lo que tiene puesto. */
  atuendo?: Partial<Atuendo>;
}

export function Numi({ expresion = 'feliz', className = '', etiqueta, atuendo }: Props) {
  const p = partes(expresion);
  const movimiento = useMovimiento();
  const { estado } = useJuego();
  const puesto = { ...estado.tienda.atuendo, ...atuendo };
  const colorLibro = puesto.libro ? ACCESORIOS[puesto.libro].color : undefined;
  const parpadea = expresion !== 'celebrando' && expresion !== 'dormida';
  return (
    <motion.svg
      key={expresion}
      initial={movimiento ? { scale: 0.92, rotate: -2 } : false}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 14 }}
      viewBox="0 0 200 220"
      className={`numi overflow-visible ${className}`}
      role={etiqueta ? 'img' : undefined}
      aria-label={etiqueta}
      aria-hidden={etiqueta ? undefined : true}
    >
      {/* El color del libro va en este grupo y no en el <svg>: framer-motion no actualiza variables CSS en su style. */}
      <g className={expresion === 'celebrando' ? 'numi-salto' : 'numi-respira'} style={colorLibro ? ({ '--nm-book': colorLibro } as CSSProperties) : undefined}>
        {puesto.ropa === 'capa' && <CapaDetras />}
        {/* penachos: las "orejas" de plumas asoman bajo el birrete */}
        <path d="M64 64 L34 50 L80 50 Z" fill="var(--nm-ear)" strokeLinejoin="round" />
        <path d="M136 64 L166 50 L120 50 Z" fill="var(--nm-ear)" strokeLinejoin="round" />
        {/* ala izquierda, detrás del libro */}
        <Ala x={50} y={158} giro={14} />
        {/* cuerpo, guata con plumas y patas */}
        <ellipse cx="100" cy="160" rx="56" ry="52" fill="var(--nm-fur)" />
        <ellipse cx="100" cy="172" rx="36" ry="36" fill="var(--nm-light)" />
        {PLUMAS.map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x - 5} ${y - 2} Q${x} ${y + 4} ${x + 5} ${y - 2}`} fill="none" stroke="var(--nm-ear)" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
        ))}
        <Accesorio id={puesto.ropa} />
        {[86, 114].map((x) => (
          <g key={x} fill="var(--nm-beak)">
            <ellipse cx={x - 6} cy="210" rx="3.6" ry="6" />
            <ellipse cx={x} cy="211" rx="3.6" ry="6.5" />
            <ellipse cx={x + 6} cy="210" rx="3.6" ry="6" />
          </g>
        ))}
        {/* cabeza y disco facial */}
        <circle cx="100" cy="92" r="50" fill="var(--nm-fur)" />
        <circle cx="82" cy="93" r="21" fill="var(--nm-light)" />
        <circle cx="118" cy="93" r="21" fill="var(--nm-light)" />
        <circle cx="66" cy="111" r="6" fill="var(--nm-cheek)" opacity=".5" />
        <circle cx="134" cy="111" r="6" fill="var(--nm-cheek)" opacity=".5" />
        <g className={parpadea ? 'numi-ojos' : undefined}>{p.ojos}</g>
        {p.cejas}
        <Pico abierto={p.pico === 'abierto'} />
        {/* birrete: va encima de la cabeza y tapa el borde de arriba del disco facial */}
        <path d="M62 66 Q62 50 100 48 Q138 50 138 66 Q100 75 62 66 Z" fill="var(--nm-hat-d)" />
        <path d="M100 20 L166 41 L100 62 L34 41 Z" fill="var(--nm-hat)" />
        <path d="M34 41 L100 62 L166 41" fill="none" stroke="var(--nm-hat-d)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M100 41 Q138 46 154 46 V72" fill="none" stroke="var(--nm-hat-d)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="41" r="4.5" fill="var(--nm-hat-d)" />
        <path d="M149 70 H159 L161 86 Q154 89 147 86 Z" fill="var(--nm-hat-d)" />
        <Accesorio id={puesto.cara} />
        <Accesorio id={puesto.cuello} />
        {/* libro de números */}
        <g transform="rotate(-9 66 162)">
          <rect x="46" y="138" width="40" height="48" rx="4" fill="var(--nm-book)" />
          <rect x="46" y="138" width="6" height="48" rx="2" fill="#000" fillOpacity=".2" />
          <text x="64" y="160" textAnchor="middle" style={{ fontFamily: 'Fredoka, Nunito, sans-serif', fontWeight: 700, fontSize: 13, fill: '#fff' }}>
            123
          </text>
          <text x="64" y="176" textAnchor="middle" style={{ fontFamily: 'Fredoka, Nunito, sans-serif', fontWeight: 700, fontSize: 13, fill: '#fff' }}>
            +÷
          </text>
        </g>
        {/* punta del ala que sujeta el libro */}
        <ellipse cx="87" cy="161" rx="9" ry="16" transform="rotate(28 87 161)" fill="var(--nm-ear)" />
        {p.ala}
        {p.extra}
      </g>
    </motion.svg>
  );
}
