import { useCallback, useRef } from 'react';
import { reproducir, type Sonido } from '../lib/sonido';
import { useJuego } from './useJuego';

/** Devuelve una función que reproduce un sonido solo si el sonido está activado en Ajustes. */
export function useSonido(): (sonido: Sonido) => void {
  const { estado } = useJuego();
  const activo = useRef(estado.ajustes.sonido);
  activo.current = estado.ajustes.sonido;
  return useCallback((sonido: Sonido) => {
    if (activo.current) reproducir(sonido);
  }, []);
}
