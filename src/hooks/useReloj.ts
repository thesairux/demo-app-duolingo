import { useEffect, useState } from 'react';

/** Hora actual (ms) que se actualiza cada `intervaloMs`. Útil para la recarga de vidas. */
export function useReloj(intervaloMs = 1000): number {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setAhora(Date.now()), intervaloMs);
    return () => window.clearInterval(id);
  }, [intervaloMs]);
  return ahora;
}
