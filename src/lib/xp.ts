// XP por ejercicio y por lección, con bonus por combo, perfección y velocidad.
// Escala pensada para las metas diarias de 10, 20, 30 o 50 XP:
// una lección de 10 ejercicios entrega entre ~15 y ~31 XP.

export const XP_ACIERTO = 1;
export const XP_COMBO = 1;
/** Desde este acierto seguido se gana el bonus de combo. */
export const COMBO_MINIMO = 3;
export const XP_LECCION = 5;
export const XP_PERFECTA = 5;
export const XP_RAPIDA = 3;
/** Segundos promedio por ejercicio para ganar el bonus de velocidad. */
export const SEGUNDOS_RAPIDA = 20;
/** Errores máximos permitidos para el bonus de velocidad (evita premiar respuestas al azar). */
export const ERRORES_MAX_RAPIDA = 2;

export interface ResumenXP {
  ejercicios: number;
  combo: number;
  leccion: number;
  perfecta: number;
  rapida: number;
  total: number;
}

/** XP de un acierto, dado el combo que se alcanza con ese acierto. */
export function xpAcierto(combo: number): { base: number; combo: number } {
  return { base: XP_ACIERTO, combo: combo >= COMBO_MINIMO ? XP_COMBO : 0 };
}

export function bonusLeccion(opciones: {
  completada: boolean;
  errores: number;
  segundos: number;
  cantidadEjercicios: number;
}): { leccion: number; perfecta: number; rapida: number } {
  if (!opciones.completada) return { leccion: 0, perfecta: 0, rapida: 0 };
  return {
    leccion: XP_LECCION,
    perfecta: opciones.errores === 0 ? XP_PERFECTA : 0,
    rapida:
      opciones.errores <= ERRORES_MAX_RAPIDA && opciones.segundos <= opciones.cantidadEjercicios * SEGUNDOS_RAPIDA ? XP_RAPIDA : 0,
  };
}

export function resumirXP(partes: Omit<ResumenXP, 'total'>): ResumenXP {
  return { ...partes, total: partes.ejercicios + partes.combo + partes.leccion + partes.perfecta + partes.rapida };
}
