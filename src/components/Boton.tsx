import type { ButtonHTMLAttributes, CSSProperties, Ref } from 'react';

type Variante = 'principal' | 'exito' | 'error' | 'suave' | 'unidad';

const COLORES: Record<Variante, CSSProperties> = {
  principal: {},
  exito: { '--btn-bg': 'var(--ok)', '--btn-fg': '#fff', '--btn-shadow': 'var(--ok-deep)' } as CSSProperties,
  error: { '--btn-bg': 'var(--bad)', '--btn-fg': '#fff', '--btn-shadow': 'var(--bad-deep)' } as CSSProperties,
  suave: { '--btn-bg': 'var(--surface)', '--btn-fg': 'var(--ink)', '--btn-shadow': 'var(--line-deep)' } as CSSProperties,
  unidad: { '--btn-bg': 'var(--unidad)', '--btn-fg': '#fff', '--btn-shadow': 'var(--unidad-oscuro)' } as CSSProperties,
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  variante?: Variante;
  ancho?: boolean;
}

/** Botón grande, redondeado, con sombra inferior que se hunde al presionar. */
export function Boton({ variante = 'principal', ancho = false, className = '', style, type = 'button', ...resto }: Props) {
  return (
    <button
      type={type}
      className={`btn-3d inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[15px] font-extrabold uppercase tracking-wider ${
        variante === 'suave' ? 'border-2 border-line' : ''
      } ${ancho ? 'w-full' : ''} ${className}`}
      style={{ ...COLORES[variante], ...style }}
      {...resto}
    />
  );
}
