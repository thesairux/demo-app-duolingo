// Repaso inteligente con cajas de Leitner.
// Cada ejercicio visto está en una caja (0 a 5). Acertar a la primera lo sube de caja y lo aleja en el tiempo;
// fallar lo devuelve a la caja 0, para repasarlo hoy mismo.
import { EJERCICIOS } from '../content';
import type { Ejercicio } from '../content/types';
import { mezclar, type Aleatorio } from './azar';
import { sumarDias } from './fechas';

/** Días hasta el próximo repaso según la caja. */
export const INTERVALOS = [0, 1, 3, 7, 14, 30];
export const CAJA_MAX = INTERVALOS.length - 1;
export const EJERCICIOS_PRACTICA = 5;

export interface FichaEjercicio {
  aciertos: number;
  fallos: number;
  /** Último intento (ms). */
  ultimo: number;
  caja: number;
  /** Día (clave local) desde el que conviene repasarlo. */
  proxima: string;
}

/** Actualiza la ficha después de responder un ejercicio en una sesión. */
export function actualizarFicha(
  ficha: FichaEjercicio | undefined,
  intento: { aciertos: number; fallos: number },
  hoy: string,
  ahora: number,
): FichaEjercicio {
  const previa = ficha ?? { aciertos: 0, fallos: 0, ultimo: 0, caja: 0, proxima: hoy };
  const aPrimera = intento.fallos === 0 && intento.aciertos > 0;
  const caja = aPrimera ? Math.min(CAJA_MAX, previa.caja + 1) : 0;
  return {
    aciertos: previa.aciertos + intento.aciertos,
    fallos: previa.fallos + intento.fallos,
    ultimo: ahora,
    caja,
    proxima: sumarDias(hoy, INTERVALOS[caja]),
  };
}

/** Ids de ejercicios que toca repasar hoy, los más débiles primero. */
export function pendientes(fichas: Record<string, FichaEjercicio>, hoy: string): string[] {
  return Object.entries(fichas)
    .filter(([id, f]) => EJERCICIOS.has(id) && f.proxima <= hoy)
    .sort(([, a], [, b]) => a.caja - b.caja || a.proxima.localeCompare(b.proxima) || a.ultimo - b.ultimo)
    .map(([id]) => id);
}

/**
 * Arma una sesión de práctica: primero lo pendiente; si falta, lo de cajas más bajas.
 * Devuelve [] si todavía no hay nada visto.
 */
export function armarPractica(fichas: Record<string, FichaEjercicio>, hoy: string, aleatorio: Aleatorio = Math.random): Ejercicio[] {
  const vence = pendientes(fichas, hoy);
  const resto = Object.entries(fichas)
    .filter(([id]) => EJERCICIOS.has(id) && !vence.includes(id))
    .sort(([, a], [, b]) => a.caja - b.caja || a.ultimo - b.ultimo)
    .map(([id]) => id);
  const ids = [...vence, ...resto].slice(0, EJERCICIOS_PRACTICA);
  return mezclar(ids, aleatorio).map((id) => EJERCICIOS.get(id)!.ej);
}

export interface TemaDebil {
  leccionId: string;
  leccionTitulo: string;
  unidad: number;
  precision: number;
  intentos: number;
}

/** Lecciones con menor precisión (con al menos `minimoIntentos` respuestas y algún error). */
export function temasDebiles(fichas: Record<string, FichaEjercicio>, maximo = 5, minimoIntentos = 2): TemaDebil[] {
  const grupos = new Map<string, TemaDebil & { aciertos: number }>();
  for (const [id, f] of Object.entries(fichas)) {
    const info = EJERCICIOS.get(id);
    if (!info) continue;
    const l = info.ubicada.leccion;
    const g = grupos.get(l.id) ?? { leccionId: l.id, leccionTitulo: l.titulo, unidad: info.ubicada.unidad.unidad, precision: 0, intentos: 0, aciertos: 0 };
    g.aciertos += f.aciertos;
    g.intentos += f.aciertos + f.fallos;
    grupos.set(l.id, g);
  }
  return [...grupos.values()]
    .map(({ aciertos, ...g }) => ({ ...g, precision: Math.round((aciertos / Math.max(1, g.intentos)) * 100) }))
    .filter((t) => t.intentos >= minimoIntentos && t.precision < 100)
    .sort((a, b) => a.precision - b.precision || b.intentos - a.intentos)
    .slice(0, maximo);
}

/** Precisión por unidad, a partir de todas las respuestas guardadas. */
export function precisionPorUnidad(fichas: Record<string, FichaEjercicio>): Record<number, { aciertos: number; fallos: number }> {
  const porUnidad: Record<number, { aciertos: number; fallos: number }> = {};
  for (const [id, f] of Object.entries(fichas)) {
    const info = EJERCICIOS.get(id);
    if (!info) continue;
    const u = info.ubicada.unidad.unidad;
    porUnidad[u] ??= { aciertos: 0, fallos: 0 };
    porUnidad[u].aciertos += f.aciertos;
    porUnidad[u].fallos += f.fallos;
  }
  return porUnidad;
}
