// Carga todas las unidades (unidad-N.json) y el glosario.
import type { Ejercicio, Leccion, TerminoGlosario, Unidad } from './types';
import glosarioJson from './glosario.json';

const modulos = import.meta.glob<Unidad>('./unidad-*.json', { eager: true, import: 'default' });

export const UNIDADES: Unidad[] = Object.values(modulos).sort((a, b) => a.unidad - b.unidad);

export const GLOSARIO = glosarioJson as TerminoGlosario[];

export interface LeccionUbicada {
  leccion: Leccion;
  unidad: Unidad;
  /** Posición en el recorrido completo (0, 1, 2…). */
  orden: number;
}

/** Todas las lecciones en el orden del camino. */
export const LECCIONES: LeccionUbicada[] = UNIDADES.flatMap((unidad) => unidad.lecciones.map((leccion) => ({ leccion, unidad }))).map(
  (l, orden) => ({ ...l, orden }),
);

const PORID = new Map(LECCIONES.map((l) => [l.leccion.id, l]));

export function buscarLeccion(id: string): LeccionUbicada | undefined {
  return PORID.get(id);
}

export interface EjercicioUbicado {
  ej: Ejercicio;
  ubicada: LeccionUbicada;
}

/** Todos los ejercicios por id, con la lección a la que pertenecen. */
export const EJERCICIOS = new Map<string, EjercicioUbicado>(
  LECCIONES.flatMap((ubicada) => ubicada.leccion.ejercicios.map((ej) => [ej.id, { ej, ubicada }] as const)),
);

export function leccionesDeUnidad(numero: number): LeccionUbicada[] {
  return LECCIONES.filter((l) => l.unidad.unidad === numero);
}
