// Qué lecciones están desbloqueadas y en qué estado se dibuja cada nodo del camino.
import type { LeccionUbicada } from '../content';
import { CORONAS_MAX } from './sesion';

export interface ProgresoLeccion {
  coronas: number;
  completadas: number;
  mejorPrecision: number;
  /** Superó el desafío legendario: el nodo se ve dorado. */
  legendaria?: boolean;
}

export type EstadoNodo = 'bloqueado' | 'disponible' | 'en-progreso' | 'completado' | 'legendario';

export function coronasDe(progreso: Record<string, ProgresoLeccion>, id: string): number {
  return progreso[id]?.coronas ?? 0;
}

/** Una lección se desbloquea cuando la anterior del camino tiene al menos una corona. */
export function estaDesbloqueada(lecciones: LeccionUbicada[], progreso: Record<string, ProgresoLeccion>, orden: number): boolean {
  if (orden === 0) return true;
  const anterior = lecciones[orden - 1];
  return !!anterior && coronasDe(progreso, anterior.leccion.id) >= 1;
}

export function estadoNodo(lecciones: LeccionUbicada[], progreso: Record<string, ProgresoLeccion>, orden: number): EstadoNodo {
  if (!estaDesbloqueada(lecciones, progreso, orden)) return 'bloqueado';
  const p = progreso[lecciones[orden].leccion.id];
  const coronas = p?.coronas ?? 0;
  if (coronas === 0) return 'disponible';
  if (coronas < CORONAS_MAX) return 'en-progreso';
  return p?.legendaria ? 'legendario' : 'completado';
}

/** La lección sugerida: la primera desbloqueada sin coronas, o la primera sin completar del todo. */
export function leccionActual(lecciones: LeccionUbicada[], progreso: Record<string, ProgresoLeccion>): LeccionUbicada | undefined {
  const desbloqueadas = lecciones.filter((l) => estaDesbloqueada(lecciones, progreso, l.orden));
  return (
    desbloqueadas.find((l) => coronasDe(progreso, l.leccion.id) === 0) ??
    desbloqueadas.find((l) => coronasDe(progreso, l.leccion.id) < CORONAS_MAX) ??
    desbloqueadas[desbloqueadas.length - 1]
  );
}

/** Una unidad está "firmada" cuando todas sus lecciones tienen al menos `minimo` coronas. */
export function unidadCompleta(lecciones: LeccionUbicada[], progreso: Record<string, ProgresoLeccion>, unidad: number, minimo = 1): boolean {
  const deUnidad = lecciones.filter((l) => l.unidad.unidad === unidad);
  return deUnidad.length > 0 && deUnidad.every((l) => coronasDe(progreso, l.leccion.id) >= minimo);
}
