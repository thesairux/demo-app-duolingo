// Tipos de sesión y cómo se arman sus ejercicios.
import { LECCIONES, leccionesDeUnidad } from '../content';
import type { Ejercicio, Leccion } from '../content/types';
import { mezclar, type Aleatorio } from './azar';

export const CORONAS_MAX = 3;
// Formato de stand: niveles cortos de 5 preguntas, para que den ganas de terminarlos.
export const EJERCICIOS_POR_SESION = 5;
export const EJERCICIOS_REPASO = 5;
export const EJERCICIOS_CHECKPOINT = 8;
/** Porcentaje mínimo de aciertos para aprobar un checkpoint. */
export const APROBAR_CHECKPOINT = 0.7;
/** Errores máximos para superar el desafío legendario. */
export const ERRORES_LEGENDARIO: number = 1;
/** Porcentaje mínimo para aprobar el modo examen (60 %, como la nota 4,0 en Chile). */
export const APROBAR_EXAMEN = 0.6;
export const SEGUNDOS_POR_PREGUNTA_EXAMEN = 60;

export type ModoSesion =
  | { tipo: 'leccion'; leccionId: string }
  | { tipo: 'repaso-leccion'; leccionId: string }
  | { tipo: 'practica'; ids: string[] }
  | { tipo: 'legendario'; leccionId: string }
  | { tipo: 'checkpoint'; unidad: number }
  | { tipo: 'examen'; unidades: number[]; cantidad: number };

export interface Reglas {
  /** Cada error resta una vida (y se necesita al menos una para empezar). */
  cuestaVidas: boolean;
  /** Lo fallado se repite al final. */
  repiteErrores: boolean;
  /** Completarla devuelve una vida. */
  daVida: boolean;
  /** Ayudas: glosario tocable y comodín 50/50. En las pruebas no, porque darían la respuesta. */
  ayudas: boolean;
}

export const REGLAS: Record<ModoSesion['tipo'], Reglas> = {
  leccion: { cuestaVidas: true, repiteErrores: true, daVida: false, ayudas: true },
  'repaso-leccion': { cuestaVidas: false, repiteErrores: true, daVida: true, ayudas: true },
  practica: { cuestaVidas: false, repiteErrores: true, daVida: true, ayudas: true },
  legendario: { cuestaVidas: true, repiteErrores: false, daVida: false, ayudas: false },
  checkpoint: { cuestaVidas: true, repiteErrores: false, daVida: false, ayudas: false },
  examen: { cuestaVidas: false, repiteErrores: false, daVida: false, ayudas: false },
};

/**
 * Dificultad a la que apunta cada nivel. La subida es suave:
 * nivel 1 (0 coronas) solo fáciles, nivel 2 mezcla fáciles y medias, nivel 3 mezcla medias y difíciles.
 */
const OBJETIVOS = [1, 1.5, 2.5];
export function dificultadObjetivo(coronas: number): number {
  return OBJETIVOS[Math.min(Math.max(coronas, 0), CORONAS_MAX - 1)];
}

const deFacilADificil = (lista: Ejercicio[]) => lista.sort((a, b) => a.dificultad - b.dificultad);

/** Elige los ejercicios más cercanos a la dificultad objetivo; los empates quedan mezclados al azar. */
function cercanosA(ejercicios: Ejercicio[], objetivo: number, cantidad: number, aleatorio: Aleatorio): Ejercicio[] {
  const distancia = (e: Ejercicio) => Math.abs(e.dificultad - objetivo);
  return mezclar([...ejercicios], aleatorio)
    .sort((a, b) => distancia(a) - distancia(b))
    .slice(0, cantidad);
}

/** Sesión normal de una lección: cada corona sube la dificultad. */
export function armarSesion(leccion: Leccion, coronas: number, aleatorio: Aleatorio = Math.random): Ejercicio[] {
  if (coronas >= CORONAS_MAX) return deFacilADificil(mezclar(leccion.ejercicios, aleatorio).slice(0, EJERCICIOS_POR_SESION));
  return deFacilADificil(cercanosA(leccion.ejercicios, dificultadObjetivo(coronas), EJERCICIOS_POR_SESION, aleatorio));
}

/** Repaso de una lección ya aprendida: ejercicios de los niveles que ya se practicaron (la primera sesión mezcla los niveles 1 y 2). */
export function armarRepasoLeccion(leccion: Leccion, coronas: number, aleatorio: Aleatorio = Math.random): Ejercicio[] {
  const tope = Math.min(Math.max(coronas, 1) + 1, CORONAS_MAX);
  return deFacilADificil(mezclar(leccion.ejercicios.filter((e) => e.dificultad <= tope), aleatorio).slice(0, EJERCICIOS_REPASO));
}

/** Desafío legendario: lo más difícil de la lección. */
export function armarLegendario(leccion: Leccion, aleatorio: Aleatorio = Math.random): Ejercicio[] {
  return deFacilADificil(cercanosA(leccion.ejercicios, 3, EJERCICIOS_POR_SESION, aleatorio));
}

/** Checkpoint: preguntas de todas las lecciones de la unidad, repartidas por igual. */
export function armarCheckpoint(unidad: number, aleatorio: Aleatorio = Math.random): Ejercicio[] {
  const porLeccion = leccionesDeUnidad(unidad).map((l) => mezclar(l.leccion.ejercicios.filter((e) => e.dificultad <= 2), aleatorio));
  const elegidos: Ejercicio[] = [];
  for (let ronda = 0; elegidos.length < EJERCICIOS_CHECKPOINT && porLeccion.some((p) => p.length > ronda); ronda++) {
    for (const lista of porLeccion) if (lista[ronda] && elegidos.length < EJERCICIOS_CHECKPOINT) elegidos.push(lista[ronda]);
  }
  return mezclar(elegidos, aleatorio);
}

/** Modo examen: preguntas al azar de las unidades elegidas, repartidas por igual. */
export function armarExamen(unidades: number[], cantidad: number, aleatorio: Aleatorio = Math.random): Ejercicio[] {
  const porUnidad = unidades.map((u) => mezclar(LECCIONES.filter((l) => l.unidad.unidad === u).flatMap((l) => l.leccion.ejercicios), aleatorio));
  const elegidos: Ejercicio[] = [];
  for (let i = 0; elegidos.length < cantidad && porUnidad.some((p) => p.length > i); i++) {
    for (const lista of porUnidad) if (lista[i] && elegidos.length < cantidad) elegidos.push(lista[i]);
  }
  return mezclar(elegidos, aleatorio);
}
