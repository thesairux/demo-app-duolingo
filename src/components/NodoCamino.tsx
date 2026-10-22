// Un nodo circular del camino. Su forma y color dicen su estado.
import type { CSSProperties, ReactNode } from 'react';
import type { EstadoNodo } from '../lib/progreso';
import { CORONAS_MAX } from '../lib/sesion';
import { IconoCandado, IconoCheck, IconoCofre, IconoCorona, IconoEstrella, IconoTrofeo } from './Iconos';

const OSCURO = 'color-mix(in srgb, var(--unidad) 62%, #000)';

function estilo(estado: EstadoNodo | 'especial'): CSSProperties {
  switch (estado) {
    case 'bloqueado':
    case 'especial':
      return { background: 'var(--line)', boxShadow: '0 6px 0 var(--line-deep)', color: 'var(--muted)' };
    case 'legendario':
      return { background: 'var(--amber)', boxShadow: '0 6px 0 var(--amber-deep)', color: 'var(--on-amber)' };
    default:
      return { background: 'var(--unidad)', boxShadow: `0 6px 0 ${OSCURO}`, color: '#fff' };
  }
}

function icono(estado: EstadoNodo, esCaso: boolean): ReactNode {
  const clase = 'h-8 w-8';
  if (estado === 'bloqueado') return <IconoCandado className={clase} />;
  if (estado === 'completado') return <IconoCheck className={clase} />;
  if (estado === 'legendario') return <IconoCorona className={clase} />;
  if (esCaso) return <IconoMaletinBlanco />;
  return <IconoEstrella className={clase} />;
}

function IconoMaletinBlanco() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
      <rect x="3" y="8" width="18" height="12" rx="2.5" fill="currentColor" />
      <path d="M9 8V6.2A1.2 1.2 0 0 1 10.2 5h3.6A1.2 1.2 0 0 1 15 6.2V8" stroke="currentColor" strokeWidth="2.2" fill="none" />
    </svg>
  );
}

interface PropsLeccion {
  estado: EstadoNodo;
  coronas: number;
  esCaso: boolean;
  esActual: boolean;
  desplazamiento: number;
  etiqueta: string;
  onClick: () => void;
}

export function NodoLeccion({ estado, coronas, esCaso, esActual, desplazamiento, etiqueta, onClick }: PropsLeccion) {
  return (
    <div className="relative grid justify-items-center gap-2" style={{ translate: `${desplazamiento}px 0` }}>
      {esActual && (
        <span
          className="absolute -top-11 z-10 whitespace-nowrap rounded-xl border-2 border-line bg-surface px-3 py-1 text-[13px] font-black tracking-wider"
          style={{ color: 'var(--unidad)' }}
        >
          {coronas > 0 ? 'SIGUIENTE NIVEL' : 'EMPEZAR'}
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        aria-label={etiqueta}
        className={`relative grid h-[70px] w-[70px] place-items-center ${esCaso ? 'rounded-[22px]' : 'rounded-full'} transition-transform active:translate-y-[5px]`}
        style={estilo(estado)}
      >
        {esActual && (
          <span
            className={`anillo-pulso pointer-events-none absolute -inset-[9px] border-4 ${esCaso ? 'rounded-[28px]' : 'rounded-full'}`}
            style={{ borderColor: 'color-mix(in srgb, var(--unidad) 45%, transparent)' }}
          />
        )}
        {icono(estado, esCaso)}
      </button>
      {estado !== 'bloqueado' && (
        <span className="flex gap-0.5" aria-hidden="true">
          {Array.from({ length: CORONAS_MAX }, (_, i) => (
            <IconoCorona key={i} className="h-4 w-4" style={{ color: i < coronas ? 'var(--amber)' : 'var(--line-deep)' }} />
          ))}
        </span>
      )}
    </div>
  );
}

export type EstadoEspecial = 'bloqueado' | 'disponible' | 'hecho';

interface PropsEspecial {
  tipo: 'cofre' | 'checkpoint';
  estado: EstadoEspecial;
  desplazamiento: number;
  etiqueta: string;
  onClick: () => void;
}

export function NodoEspecial({ tipo, estado, desplazamiento, etiqueta, onClick }: PropsEspecial) {
  const disponible = estado === 'disponible';
  const estiloNodo: CSSProperties =
    estado === 'bloqueado'
      ? estilo('especial')
      : estado === 'hecho'
        ? tipo === 'checkpoint'
          ? estilo('legendario')
          : { background: 'var(--surface-2)', boxShadow: '0 6px 0 var(--line)', color: 'var(--line-deep)', border: '2px dashed var(--line-deep)' }
        : tipo === 'cofre'
          ? estilo('legendario')
          : estilo('disponible');
  return (
    <div className="grid justify-items-center" style={{ translate: `${desplazamiento}px 0` }}>
      <button
        type="button"
        onClick={onClick}
        aria-label={etiqueta}
        className="relative grid h-[66px] w-[66px] place-items-center rounded-[20px] transition-transform active:translate-y-[5px]"
        style={estiloNodo}
      >
        {disponible && (
          <span
            className="anillo-pulso pointer-events-none absolute -inset-[8px] rounded-[26px] border-4"
            style={{ borderColor: tipo === 'cofre' ? 'color-mix(in srgb, var(--amber) 50%, transparent)' : 'color-mix(in srgb, var(--unidad) 45%, transparent)' }}
          />
        )}
        {tipo === 'cofre' ? <IconoCofre className={`h-8 w-8 ${disponible ? 'icono-sacude' : ''}`} /> : <IconoTrofeo className="h-8 w-8" />}
      </button>
    </div>
  );
}
