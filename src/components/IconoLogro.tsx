// Medalla redonda de un logro: a color si está desbloqueado, gris si no.
import type { IconoLogro as TipoIcono } from '../lib/logros';
import { IconoCheck, IconoCofre, IconoCorona, IconoEstrella, IconoFuego, IconoLibro, IconoMaletin, IconoRayo, IconoTrofeo } from './Iconos';

const COLOR: Record<TipoIcono, string> = {
  leccion: 'var(--u1)',
  fuego: 'var(--u3)',
  estrella: 'var(--amber)',
  corona: 'var(--amber)',
  maletin: 'var(--u2)',
  rayo: 'var(--u4)',
  trofeo: 'var(--u5)',
  libro: 'var(--u6)',
  cofre: 'var(--u3)',
  meta: 'var(--ok)',
};

export function IconoLogro({ icono, activo, tamano = 48 }: { icono: TipoIcono; activo: boolean; tamano?: number }) {
  const clase = 'h-[55%] w-[55%]';
  const dibujo = {
    leccion: <IconoCheck className={clase} />,
    fuego: <IconoFuego className={clase} />,
    estrella: <IconoEstrella className={clase} />,
    corona: <IconoCorona className={clase} />,
    maletin: <IconoMaletin className={clase} />,
    rayo: <IconoRayo className={clase} />,
    trofeo: <IconoTrofeo className={clase} />,
    libro: <IconoLibro className={clase} />,
    cofre: <IconoCofre className={clase} />,
    meta: <IconoCheck className={clase} />,
  }[icono];
  return (
    <span
      className="grid place-items-center rounded-full"
      style={{
        width: tamano,
        height: tamano,
        background: activo ? `color-mix(in srgb, ${COLOR[icono]} 22%, var(--surface))` : 'var(--surface-2)',
        color: activo ? COLOR[icono] : 'var(--line-deep)',
        border: `3px solid ${activo ? COLOR[icono] : 'var(--line)'}`,
        filter: activo ? undefined : 'grayscale(1)',
      }}
      aria-hidden="true"
    >
      {dibujo}
    </span>
  );
}
