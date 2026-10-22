// Vidas: 5 como máximo, se pierde una por error y se recupera una cada 30 minutos.

export const VIDAS_MAX = 5;
export const MS_RECARGA = 30 * 60 * 1000;

export interface Vidas {
  actuales: number;
  /** Instante (ms) desde el que corre la próxima recarga. Sin uso cuando están llenas. */
  desde: number;
}

export function vidasLlenas(ahora: number): Vidas {
  return { actuales: VIDAS_MAX, desde: ahora };
}

/** Aplica las recargas que correspondan según el tiempo transcurrido. */
export function recargar(vidas: Vidas, ahora: number): Vidas {
  if (vidas.actuales >= VIDAS_MAX) return { actuales: VIDAS_MAX, desde: vidas.desde };
  const ganadas = Math.floor((ahora - vidas.desde) / MS_RECARGA);
  if (ganadas <= 0) return vidas;
  const actuales = Math.min(VIDAS_MAX, vidas.actuales + ganadas);
  return { actuales, desde: actuales >= VIDAS_MAX ? ahora : vidas.desde + ganadas * MS_RECARGA };
}

export function perderVida(vidas: Vidas, ahora: number): Vidas {
  const v = recargar(vidas, ahora);
  if (v.actuales <= 0) return v;
  // Si estaban llenas, el reloj de recarga parte ahora.
  return { actuales: v.actuales - 1, desde: v.actuales >= VIDAS_MAX ? ahora : v.desde };
}

/** Milisegundos para la próxima vida, o null si están llenas. */
export function msParaProximaVida(vidas: Vidas, ahora: number): number | null {
  const v = recargar(vidas, ahora);
  if (v.actuales >= VIDAS_MAX) return null;
  return Math.max(0, v.desde + MS_RECARGA - ahora);
}
