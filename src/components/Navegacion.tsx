// Barra inferior para moverse entre las secciones principales.
import type { ComponentType, SVGProps } from 'react';
import { IconoCamino, IconoPersona, IconoPracticar, IconoTienda, IconoTrofeo } from './Iconos';

export type Pestana = 'camino' | 'practicar' | 'logros' | 'tienda' | 'perfil';

const PESTANAS: { id: Pestana; nombre: string; Icono: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { id: 'camino', nombre: 'Aprender', Icono: IconoCamino },
  { id: 'practicar', nombre: 'Practicar', Icono: IconoPracticar },
  { id: 'logros', nombre: 'Logros', Icono: IconoTrofeo },
  { id: 'tienda', nombre: 'Tienda', Icono: IconoTienda },
  { id: 'perfil', nombre: 'Perfil', Icono: IconoPersona },
];

export function Navegacion({ actual, onCambiar, avisos }: { actual: Pestana; onCambiar: (p: Pestana) => void; avisos?: Partial<Record<Pestana, boolean>> }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-surface"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Secciones"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {PESTANAS.map(({ id, nombre, Icono }) => {
          const activa = id === actual;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onCambiar(id)}
                aria-current={activa ? 'page' : undefined}
                className="relative grid w-full justify-items-center gap-0.5 px-1 pb-2 pt-2.5 text-[11.5px] font-extrabold"
                style={{ color: activa ? 'var(--select)' : 'var(--muted)' }}
              >
                <span className={`grid h-9 w-12 place-items-center rounded-xl ${activa ? 'bg-select-soft' : ''}`}>
                  <Icono className="h-6 w-6" />
                </span>
                {nombre}
                {avisos?.[id] && <span className="absolute right-[22%] top-2 h-2.5 w-2.5 rounded-full bg-bad" aria-label="Hay algo nuevo" />}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
