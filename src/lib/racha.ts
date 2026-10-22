// Racha diaria: se mantiene completando al menos una lección al día.
// Un protector de racha cubre un día sin práctica.
import { diasEntre } from './fechas';

export interface Racha {
  actual: number;
  mejor: number;
  /** Último día (clave local) en que se completó una lección. */
  ultimoDia: string | null;
  protectores: number;
}

export type EstadoRacha = 'sin-empezar' | 'activa-hoy' | 'en-peligro' | 'perdida';

export const RACHA_INICIAL: Racha = { actual: 0, mejor: 0, ultimoDia: null, protectores: 0 };

/** Cómo se ve la racha hoy, sin modificarla. */
export function estadoRacha(racha: Racha, hoy: string): { dias: number; estado: EstadoRacha } {
  if (!racha.ultimoDia || racha.actual === 0) return { dias: 0, estado: 'sin-empezar' };
  const brecha = diasEntre(racha.ultimoDia, hoy);
  if (brecha <= 0) return { dias: racha.actual, estado: 'activa-hoy' };
  if (brecha === 1) return { dias: racha.actual, estado: 'en-peligro' };
  if (racha.protectores >= brecha - 1) return { dias: racha.actual, estado: 'en-peligro' };
  return { dias: 0, estado: 'perdida' };
}

/** Registra que hoy se completó una lección. */
export function registrarPractica(
  racha: Racha,
  hoy: string,
): { racha: Racha; extendida: boolean; protectoresUsados: number } {
  if (racha.ultimoDia && diasEntre(racha.ultimoDia, hoy) <= 0) {
    return { racha, extendida: false, protectoresUsados: 0 };
  }
  let actual = 1;
  let usados = 0;
  if (racha.ultimoDia) {
    const brecha = diasEntre(racha.ultimoDia, hoy);
    const diasPerdidos = brecha - 1;
    if (diasPerdidos === 0) {
      actual = racha.actual + 1;
    } else if (racha.protectores >= diasPerdidos) {
      actual = racha.actual + 1;
      usados = diasPerdidos;
    }
  }
  return {
    racha: { actual, mejor: Math.max(racha.mejor, actual), ultimoDia: hoy, protectores: racha.protectores - usados },
    extendida: true,
    protectoresUsados: usados,
  };
}
