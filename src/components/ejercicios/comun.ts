import type { Respuesta } from '../../lib/evaluar';

export type Veredicto = 'correcta' | 'incorrecta' | null;

export interface PropsEjercicio<E> {
  ej: E;
  /** Se bloquea al comprobar. */
  bloqueado: boolean;
  /** Resultado ya comprobado, para colorear lo elegido. */
  veredicto: Veredicto;
  /** Respuesta completa, o null si todavía falta algo. */
  onRespuesta: (respuesta: Respuesta | null) => void;
  /** Alternativas escondidas por el comodín 50/50. */
  ocultas?: number[];
}

export function claseVeredicto(elegido: boolean, veredicto: Veredicto): string {
  if (!elegido || !veredicto) return '';
  return veredicto === 'correcta' ? 'acierto' : 'error';
}

export const CLASE_PREGUNTA = 'font-display text-[21px] font-semibold leading-snug';
export const CLASE_OPCION = 'opcion w-full rounded-2xl px-4 py-3.5 text-left text-[15.5px] font-bold leading-snug text-ink';
