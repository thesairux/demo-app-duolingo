import { useReducedMotion } from 'framer-motion';
import { useJuego } from './useJuego';

/**
 * true si se deben mostrar animaciones: el ajuste de la app está activo
 * y el sistema no pide reducir el movimiento.
 */
export function useMovimiento(): boolean {
  const { estado } = useJuego();
  const reducir = useReducedMotion();
  return estado.ajustes.animaciones && !reducir;
}
