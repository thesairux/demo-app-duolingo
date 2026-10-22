// Numi: castora con birrete y un libro de números. Diseño original en SVG.
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

function Ojo({ x, y, r = 6.5, dx = 0, dy = 0 }: { x: number; y: number; r?: number; dx?: number; dy?: number }) {
  return (
    <>
      <ellipse cx={x} cy={y} rx={r - 0.6} ry={r + 0.6} fill={OSCURO} />
      <circle cx={x + 2 + dx} cy={y - 3 + dy} r={2.2} fill="#fff" />
    </>
  );
}

const LABIO_FELIZ = 'M86 108 Q93 114 100 107 Q107 114 114 108';
const LABIO_PLANO = 'M87 109 Q100 104 113 109';
const BRAZO_NORMAL = <ellipse cx="148" cy="152" rx="11" ry="20" transform="rotate(18 148 152)" fill="var(--nm-fur)" />;
const TEXTO_ZETA = { fontFamily: 'Fredoka, Nunito, sans-serif', fontWeight: 700, fill: 'var(--muted)' } as const;

interface Partes {
  ojos: ReactNode;
  cejas?: ReactNode;
  labio: string;
  boca?: ReactNode;
  brazo: ReactNode;
  extra?: ReactNode;
}

function partes(expresion: Expresion): Partes {
  switch (expresion) {
    case 'celebrando':
      return {
        ojos: (
          <>
            <Trazo d="M75 90 Q82 80 89 90" ancho={4} />
            <Trazo d="M111 90 Q118 80 125 90" ancho={4} />
          </>
        ),
        labio: LABIO_FELIZ,
        boca: <path d="M90 117 Q100 135 110 117 Z" fill="#B5473A" />,
        brazo: (
          <g className="numi-saludo">
            <ellipse cx="157" cy="112" rx="11" ry="22" transform="rotate(38 157 112)" fill="var(--nm-fur)" />
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
            <Ojo x={82} y={91} r={5.5} dy={1} />
            <Ojo x={118} y={91} r={5.5} dy={1} />
          </>
        ),
        cejas: (
          <>
            <Trazo d="M72 80 L89 74" ancho={3.4} />
            <Trazo d="M128 80 L111 74" ancho={3.4} />
          </>
        ),
        labio: LABIO_PLANO,
        boca: <Trazo d="M90 128 Q100 120 110 128" ancho={3} />,
        brazo: BRAZO_NORMAL,
        extra: (
          <g className="numi-gota">
            <path d="M84 98 Q79 106 84 109 Q89 106 84 98 Z" fill="#7CC4F2" />
          </g>
        ),
      };
    case 'pensando':
      return {
        ojos: (
          <>
            <Ojo x={82} y={88} dx={1.5} dy={-2} />
            <Ojo x={118} y={88} dx={1.5} dy={-2} />
          </>
        ),
        cejas: <Trazo d="M110 75 Q118 69 127 73" ancho={3.4} />,
        labio: LABIO_PLANO,
        boca: <Trazo d="M95 125 Q102 123 108 126" ancho={3} />,
        brazo: <ellipse cx="124" cy="130" rx="10" ry="17" transform="rotate(-50 124 130)" fill="var(--nm-fur)" />,
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
            <Ojo x={82} y={89} r={7.6} />
            <Ojo x={118} y={89} r={7.6} />
          </>
        ),
        cejas: (
          <>
            <Trazo d="M71 78 L89 71" ancho={3.4} />
            <Trazo d="M129 78 L111 71" ancho={3.4} />
          </>
        ),
        labio: LABIO_PLANO,
        boca: <Trazo d="M88 126 Q94 121 100 126 Q106 131 112 126" ancho={3} />,
        brazo: BRAZO_NORMAL,
        extra: (
          <g className="numi-gota" style={{ animationDuration: '1.6s' }}>
            <path d="M152 64 Q145 75 152 80 Q159 75 152 64 Z" fill="#7CC4F2" />
          </g>
        ),
      };
    case 'dormida':
      return {
        ojos: (
          <>
            <Trazo d="M75 89 Q82 94 89 89" ancho={3.6} />
            <Trazo d="M111 89 Q118 94 125 89" ancho={3.6} />
          </>
        ),
        labio: LABIO_PLANO,
        boca: <ellipse cx="100" cy="125" rx="4" ry="3" fill={OSCURO} />,
        brazo: BRAZO_NORMAL,
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
            <Ojo x={82} y={88} />
            <Ojo x={118} y={88} />
          </>
        ),
        labio: LABIO_FELIZ,
        brazo: BRAZO_NORMAL,
      };
  }
}

// ---------- Accesorios de la tienda ----------

const MARCO = '#1B2836';

function Lentes({ sol }: { sol: boolean }) {
  return (
    <g>
      {[82, 118].map((x) => (
        <circle key={x} cx={x} cy={88} r={11} fill={sol ? MARCO : '#BFE3FF'} fillOpacity={sol ? 0.92 : 0.28} stroke={MARCO} strokeWidth={3} />
      ))}
      {sol && <path d="M75 84 Q79 80 84 81 M111 84 Q115 80 120 81" stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" fill="none" />}
      <path d="M93 87 Q100 83 107 87 M71 86 L57 81 M129 86 L143 81" stroke={MARCO} strokeWidth={3} strokeLinecap="round" fill="none" />
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
      <path d="M66 88 L53 84 M134 88 L147 84" stroke="#2B3A55" strokeWidth={5} strokeLinecap="round" />
      <rect x="66" y="77" width="68" height="23" rx="11" fill="#BFE3FF" fillOpacity=".35" stroke="#FF8C1A" strokeWidth={3.5} />
      <path d="M74 84 Q78 80 84 80 M108 84 Q112 80 118 80" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  );
}

const CORAZON = 'M0 11 C-6 6 -13 1 -13 -5 C-13 -10 -9 -12 -6 -12 C-3 -12 -1 -10 0 -7 C1 -10 3 -12 6 -12 C9 -12 13 -10 13 -5 C13 1 6 6 0 11 Z';

function LentesCorazon() {
  return (
    <g>
      {[82, 118].map((x) => (
        <path key={x} d={CORAZON} transform={`translate(${x} 88)`} fill="#E2508C" fillOpacity=".85" stroke="#B33669" strokeWidth={2.5} strokeLinejoin="round" />
      ))}
      <path d="M74 84 Q76 80 80 80 M110 84 Q112 80 116 80" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M95 84 Q100 80 105 84 M69 84 L57 80 M131 84 L143 80" stroke="#B33669" strokeWidth={2.5} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Lentes3D() {
  return (
    <g>
      <rect x="69" y="79" width="26" height="18" rx="3" fill="#E53935" fillOpacity=".8" stroke="#F4F6F8" strokeWidth={3.5} />
      <rect x="105" y="79" width="26" height="18" rx="3" fill="#00B8D4" fillOpacity=".8" stroke="#F4F6F8" strokeWidth={3.5} />
      <path d="M95 86 H105 M69 85 L57 81 M131 85 L143 81" stroke="#F4F6F8" strokeWidth={3.5} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Monoculo() {
  return (
    <g>
      <path d="M126 96 Q142 112 130 134" stroke="#C99700" strokeWidth={2} strokeDasharray="2 2.5" fill="none" />
      <circle cx="118" cy="88" r="11.5" fill="#BFE3FF" fillOpacity=".3" stroke="#E0A800" strokeWidth={3} />
      <path d="M111 84 Q114 80 119 80" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" fill="none" />
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
  /** Texto para lectores de pantalla. Si falta, Numi se trata como decorativa. */
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
        {/* cola */}
        <ellipse cx="152" cy="196" rx="31" ry="13" transform="rotate(-28 152 196)" fill="var(--nm-tail)" />
        <path d="M134 196 L166 186 M138 206 L172 194" stroke="#000" strokeOpacity=".18" strokeWidth="2" fill="none" />
        {/* orejas */}
        <circle cx="53" cy="77" r="11" fill="var(--nm-fur)" />
        <circle cx="53" cy="77" r="5.5" fill="var(--nm-ear)" />
        <circle cx="147" cy="77" r="11" fill="var(--nm-fur)" />
        <circle cx="147" cy="77" r="5.5" fill="var(--nm-ear)" />
        {/* cuerpo */}
        <ellipse cx="100" cy="160" rx="56" ry="52" fill="var(--nm-fur)" />
        <ellipse cx="100" cy="170" rx="34" ry="34" fill="var(--nm-light)" />
        <Accesorio id={puesto.ropa} />
        <ellipse cx="78" cy="210" rx="17" ry="8" fill="var(--nm-ear)" />
        <ellipse cx="122" cy="210" rx="17" ry="8" fill="var(--nm-ear)" />
        {/* cabeza y birrete */}
        <circle cx="100" cy="92" r="48" fill="var(--nm-fur)" />
        <path d="M62 66 Q62 50 100 48 Q138 50 138 66 Q100 75 62 66 Z" fill="var(--nm-hat-d)" />
        <path d="M100 20 L166 41 L100 62 L34 41 Z" fill="var(--nm-hat)" />
        <path d="M34 41 L100 62 L166 41" fill="none" stroke="var(--nm-hat-d)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M100 41 Q138 46 154 46 V72" fill="none" stroke="var(--nm-hat-d)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="41" r="4.5" fill="var(--nm-hat-d)" />
        <path d="M149 70 H159 L161 86 Q154 89 147 86 Z" fill="var(--nm-hat-d)" />
        {/* cara */}
        <circle cx="71" cy="107" r="7.5" fill="var(--nm-cheek)" opacity=".55" />
        <circle cx="129" cy="107" r="7.5" fill="var(--nm-cheek)" opacity=".55" />
        <ellipse cx="100" cy="111" rx="24" ry="16" fill="var(--nm-light)" />
        <g className={parpadea ? 'numi-ojos' : undefined}>{p.ojos}</g>
        {p.cejas}
        <ellipse cx="100" cy="101" rx="8" ry="5.5" fill={OSCURO} />
        <Trazo d={p.labio} ancho={3} />
        {p.boca}
        <rect x="94" y="108" width="6" height="10" rx="1.5" fill="#fff" stroke={OSCURO} strokeWidth="1.2" />
        <rect x="100" y="108" width="6" height="10" rx="1.5" fill="#fff" stroke={OSCURO} strokeWidth="1.2" />
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
        <ellipse cx="86" cy="160" rx="10" ry="18" transform="rotate(28 86 160)" fill="var(--nm-fur)" />
        {p.brazo}
        {p.extra}
      </g>
    </motion.svg>
  );
}
