// Desafío relámpago: cálculo mental contra el reloj. Mientras más aciertos, más difíciles se ponen los cálculos.
import { elegir, type Aleatorio } from './azar';
import { formatoNumero } from './numeros';

export const SEGUNDOS_DESAFIO = 60;
/** Cada cuántos aciertos sube el nivel, y el nivel más alto. */
export const ACIERTOS_POR_NIVEL = 4;
export const NIVEL_MAXIMO = 3;
/** 1 XP por acierto, con este tope por desafío. */
export const XP_MAX_DESAFIO = 20;

export interface Calculo {
  /** Lo que se muestra, por ejemplo "7 × 8" o "Doble de 24". */
  texto: string;
  respuesta: number;
}

const entre = (a: Aleatorio, min: number, max: number) => min + Math.floor(a() * (max - min + 1));
const f = formatoNumero;

type Receta = (a: Aleatorio) => Calculo;

const tabla =
  (min: number, max: number): Receta =>
  (a) => {
    const x = entre(a, min, max);
    const y = entre(a, 2, max);
    return { texto: `${x} × ${y}`, respuesta: x * y };
  };

const sumaDecenas: Receta = (a) => {
  const x = entre(a, 1, 6) * 10;
  const y = entre(a, 1, 9 - x / 10) * 10;
  return { texto: `${x} + ${y}`, respuesta: x + y };
};

const restaDecenas: Receta = (a) => {
  const x = entre(a, 5, 9) * 10;
  const y = entre(a, 1, x / 10 - 1) * 10;
  return { texto: `${x} − ${y}`, respuesta: x - y };
};

const porDiez: Receta = (a) => {
  const x = entre(a, 2, 9);
  return { texto: `${x} × 10`, respuesta: x * 10 };
};

const porDiezGrande: Receta = (a) => {
  const x = entre(a, 11, 99);
  return { texto: `${x} × 10`, respuesta: x * 10 };
};

const porCien: Receta = (a) => {
  const x = entre(a, 2, 45);
  return { texto: `${x} × 100`, respuesta: x * 100 };
};

const doble: Receta = (a) => {
  const x = entre(a, 11, 49);
  return { texto: `Doble de ${x}`, respuesta: x * 2 };
};

const mitad: Receta = (a) => {
  const x = entre(a, 10, 49) * 2;
  return { texto: `Mitad de ${x}`, respuesta: x / 2 };
};

const divisionTabla: Receta = (a) => {
  const y = entre(a, 2, 9);
  const q = entre(a, 2, 9);
  return { texto: `${y * q} : ${y}`, respuesta: q };
};

const sumaCentenas: Receta = (a) => {
  const x = entre(a, 11, 89) * 10;
  const y = entre(a, 1, 9) * 10;
  return { texto: `${f(x)} + ${y}`, respuesta: x + y };
};

/** Los cálculos de cada nivel: del 0 (tablas fáciles y decenas) al 3 (todo mezclado). */
const NIVELES: Receta[][] = [
  [tabla(2, 5), sumaDecenas, porDiez],
  [tabla(2, 9), restaDecenas, porDiezGrande, doble],
  [tabla(3, 9), divisionTabla, mitad, porCien, sumaDecenas],
  [tabla(6, 9), divisionTabla, mitad, doble, porCien, sumaCentenas, restaDecenas],
];

export function nivelDesafio(aciertos: number): number {
  return Math.min(NIVEL_MAXIMO, Math.floor(aciertos / ACIERTOS_POR_NIVEL));
}

/** Un cálculo nuevo para el nivel, distinto del anterior. */
export function nuevoCalculo(nivel: number, anterior: Calculo | null = null, aleatorio: Aleatorio = Math.random): Calculo {
  const recetas = NIVELES[Math.min(Math.max(nivel, 0), NIVEL_MAXIMO)];
  let calculo = elegir(recetas, aleatorio)(aleatorio);
  for (let intento = 0; intento < 10 && calculo.texto === anterior?.texto; intento++) calculo = elegir(recetas, aleatorio)(aleatorio);
  return calculo;
}
