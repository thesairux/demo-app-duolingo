// Hojas para resolver en el cuaderno: se generan al azar, el niño escribe sus resultados en la app y la app los corrige.
import { elegir, type Aleatorio } from './azar';
import { formatoNumero } from './numeros';

export type TemaCuaderno = 'sumas-restas' | 'multiplicar' | 'dividir' | 'fracciones' | 'mezcla';

export interface DatosTema {
  nombre: string;
  detalle: string;
  /** Unidad del camino de la que sale el tema, para usar su color. */
  unidad: number;
}

export const TEMAS_CUADERNO: Record<TemaCuaderno, DatosTema> = {
  'sumas-restas': { nombre: 'Sumas y restas', detalle: 'Números hasta el 1.000', unidad: 1 },
  multiplicar: { nombre: 'Multiplicaciones', detalle: 'Por un número de 1 cifra', unidad: 2 },
  dividir: { nombre: 'Divisiones', detalle: 'Algunas tienen resto', unidad: 2 },
  fracciones: { nombre: 'Fracciones', detalle: 'Con igual denominador', unidad: 3 },
  mezcla: { nombre: 'De todo un poco', detalle: 'Un ejercicio de cada tema', unidad: 4 },
};

export type Solucion =
  | { tipo: 'entero'; valor: number }
  | { tipo: 'division'; cociente: number; resto: number }
  | { tipo: 'fraccion'; numerador: number; denominador: number };

export interface EjercicioCuaderno {
  numero: number;
  /** Lo que se copia en el cuaderno, por ejemplo "345 + 278 =". */
  enunciado: string;
  solucion: Solucion;
  /** Cómo se resuelve, para mostrarlo si quedó mal. */
  desarrollo: string;
}

export interface HojaCuaderno {
  tema: TemaCuaderno;
  ejercicios: EjercicioCuaderno[];
}

export type EstadoRevision = 'bien' | 'mal' | 'en-blanco';

export interface RevisionEjercicio {
  ejercicio: EjercicioCuaderno;
  estado: EstadoRevision;
  /** Lo que escribió el niño, o null si lo dejó en blanco. */
  leido: string | null;
  /** Un detalle para el niño, por ejemplo que le faltó anotar el resto. */
  nota?: string;
}

export const EJERCICIOS_POR_HOJA = 4;
/** XP por ejercicio bien, y extra si la hoja sale perfecta. */
export const XP_BIEN = 2;
export const XP_HOJA_PERFECTA = 5;

export function textoSolucion(s: Solucion): string {
  switch (s.tipo) {
    case 'entero':
      return formatoNumero(s.valor);
    case 'division':
      return s.resto ? `${s.cociente} y sobran ${s.resto}` : String(s.cociente);
    case 'fraccion':
      return `${s.numerador}/${s.denominador}`;
  }
}

const entre = (a: Aleatorio, min: number, max: number) => min + Math.floor(a() * (max - min + 1));
const f = formatoNumero;

/** Separa un número en centenas, decenas y unidades, sin las partes que valen cero: 278 → [200, 70, 8]. */
function partes(n: number): number[] {
  const p = [Math.floor(n / 1000) * 1000, Math.floor((n % 1000) / 100) * 100, Math.floor((n % 100) / 10) * 10, n % 10];
  return p.filter((x) => x > 0);
}

function suma(a: Aleatorio): Omit<EjercicioCuaderno, 'numero'> {
  const x = entre(a, 126, 689);
  const y = entre(a, 118, Math.min(689, 999 - x));
  let acumulado = x;
  const pasos = partes(y).map((p) => `${f(acumulado)} + ${f(p)} = ${f((acumulado += p))}`);
  return {
    enunciado: `${f(x)} + ${f(y)} =`,
    solucion: { tipo: 'entero', valor: x + y },
    desarrollo: `Suma por partes: ${pasos.join('; ')}.`,
  };
}

function resta(a: Aleatorio): Omit<EjercicioCuaderno, 'numero'> {
  const x = entre(a, 402, 985);
  const y = entre(a, 108, x - 61);
  let acumulado = x;
  const pasos = partes(y).map((p) => `${f(acumulado)} − ${f(p)} = ${f((acumulado -= p))}`);
  return {
    enunciado: `${f(x)} − ${f(y)} =`,
    solucion: { tipo: 'entero', valor: x - y },
    desarrollo: `Resta por partes: ${pasos.join('; ')}.`,
  };
}

function multiplicacion(a: Aleatorio, cifras: 2 | 3): Omit<EjercicioCuaderno, 'numero'> {
  const y = entre(a, cifras === 2 ? 3 : 2, 9);
  const x = cifras === 2 ? entre(a, 13, 98) : entre(a, 102, 989);
  const p = partes(x);
  const desarrollo =
    p.length === 1
      ? `${f(x)} × ${y} = ${f(x * y)}.`
      : `${f(x)} × ${y} = ${p.map((q) => `${f(q)} × ${y}`).join(' + ')} = ${p.map((q) => f(q * y)).join(' + ')} = ${f(x * y)}.`;
  return { enunciado: `${f(x)} × ${y} =`, solucion: { tipo: 'entero', valor: x * y }, desarrollo };
}

function division(a: Aleatorio, conResto: boolean): Omit<EjercicioCuaderno, 'numero'> {
  const y = entre(a, conResto ? 3 : 2, 9);
  const minimo = Math.max(2, Math.ceil(20 / y));
  const r = conResto ? entre(a, 1, y - 1) : 0;
  const q = entre(a, minimo, Math.floor((99 - r) / y));
  const x = y * q + r;
  const desarrollo = r
    ? `En la tabla del ${y}: ${y} × ${q} = ${y * q} y ${y} × ${q + 1} = ${y * (q + 1)} ya se pasa. Entonces ${x} : ${y} = ${q} y sobran ${x} − ${y * q} = ${r}.`
    : `En la tabla del ${y}: ${y} × ${q} = ${x}. Entonces ${x} : ${y} = ${q}.`;
  return { enunciado: `${x} : ${y} =`, solucion: { tipo: 'division', cociente: q, resto: r }, desarrollo };
}

const DENOMINADORES = [4, 5, 6, 8, 10, 12];

function fraccion(a: Aleatorio, sumar: boolean): Omit<EjercicioCuaderno, 'numero'> {
  const d = elegir(DENOMINADORES, a);
  const x = sumar ? entre(a, 1, d - 2) : entre(a, 2, d - 1);
  const y = sumar ? entre(a, 1, d - 1 - x) : entre(a, 1, x - 1);
  const n = sumar ? x + y : x - y;
  return {
    enunciado: `${x}/${d} ${sumar ? '+' : '−'} ${y}/${d} =`,
    solucion: { tipo: 'fraccion', numerador: n, denominador: d },
    desarrollo: `Tienen el mismo denominador (${d}): se ${sumar ? 'suman' : 'restan'} los numeradores, ${x} ${sumar ? '+' : '−'} ${y} = ${n}, y el denominador queda igual. Resultado: ${n}/${d}.`,
  };
}

type Generador = (a: Aleatorio) => Omit<EjercicioCuaderno, 'numero'>;

const RECETAS: Record<TemaCuaderno, Generador[]> = {
  'sumas-restas': [suma, resta, suma, resta],
  multiplicar: [(a) => multiplicacion(a, 2), (a) => multiplicacion(a, 2), (a) => multiplicacion(a, 3), (a) => multiplicacion(a, 3)],
  dividir: [(a) => division(a, false), (a) => division(a, true), (a) => division(a, false), (a) => division(a, true)],
  fracciones: [(a) => fraccion(a, true), (a) => fraccion(a, false), (a) => fraccion(a, true), (a) => fraccion(a, false)],
  mezcla: [(a) => (a() < 0.5 ? suma(a) : resta(a)), (a) => multiplicacion(a, 3), (a) => division(a, a() < 0.5), (a) => fraccion(a, a() < 0.5)],
};

/** Arma una hoja nueva de 4 ejercicios distintos. */
export function armarHoja(tema: TemaCuaderno, aleatorio: Aleatorio = Math.random): HojaCuaderno {
  const ejercicios: EjercicioCuaderno[] = [];
  for (const generar of RECETAS[tema]) {
    let ej = generar(aleatorio);
    for (let intento = 0; intento < 20 && ejercicios.some((e) => e.enunciado === ej.enunciado); intento++) ej = generar(aleatorio);
    ejercicios.push({ numero: ejercicios.length + 1, ...ej });
  }
  return { tema, ejercicios };
}

// ---------- Corrección ----------

/** Los números enteros que aparecen en lo escrito, después del último "=". El punto de los miles no corta el número. */
function enteros(leido: string): number[] {
  const final = leido.slice(leido.lastIndexOf('=') + 1);
  const limpio = final.replace(/(\d)[.\s](?=\d{3}(?!\d))/g, '$1').replace(/(\d)\s+(?=\d)/g, '$1');
  return (limpio.match(/\d+/g) ?? []).map(Number);
}

/** Compara lo que escribió el niño con la solución. */
export function revisarEjercicio(ejercicio: EjercicioCuaderno, leido: string | null): RevisionEjercicio {
  const base = { ejercicio, leido };
  if (!leido) return { ...base, estado: 'en-blanco' };
  const s = ejercicio.solucion;
  switch (s.tipo) {
    case 'entero': {
      const n = enteros(leido);
      if (!n.length) return { ...base, estado: 'en-blanco' };
      return { ...base, estado: n[n.length - 1] === s.valor ? 'bien' : 'mal' };
    }
    case 'division': {
      const [cociente, resto] = enteros(leido);
      if (cociente === undefined) return { ...base, estado: 'en-blanco' };
      if (cociente !== s.cociente) return { ...base, estado: 'mal' };
      if (resto === undefined && s.resto > 0) return { ...base, estado: 'mal', nota: `El ${s.cociente} está bien, pero te faltó anotar que sobran ${s.resto}.` };
      return { ...base, estado: (resto ?? 0) === s.resto ? 'bien' : 'mal' };
    }
    case 'fraccion': {
      const todas = [...leido.matchAll(/(\d+)\s*\/\s*(\d+)/g)];
      const ultima = todas[todas.length - 1];
      if (!ultima) return { ...base, estado: 'en-blanco' };
      const [n, d] = [Number(ultima[1]), Number(ultima[2])];
      if (d === 0) return { ...base, estado: 'mal' };
      if (n * s.denominador !== s.numerador * d) return { ...base, estado: 'mal' };
      // Una fracción equivalente también vale, aunque en 4° básico todavía no se simplifica.
      return { ...base, estado: 'bien', nota: d !== s.denominador ? `¡Bien! ${n}/${d} es lo mismo que ${s.numerador}/${s.denominador}.` : undefined };
    }
  }
}

/**
 * Junta lo que el niño escribió en las casillas de un ejercicio: un número, o cociente y resto,
 * o numerador y denominador. Devuelve null si falta la casilla principal.
 */
export function unirCasillas(ejercicio: EjercicioCuaderno, casillas: string[]): string | null {
  const [a = '', b = ''] = casillas.map((c) => c.trim());
  switch (ejercicio.solucion.tipo) {
    case 'entero':
      return a || null;
    case 'division':
      return a ? (b ? `${a} resto ${b}` : a) : null;
    case 'fraccion':
      return a && b ? `${a}/${b}` : null;
  }
}

/** Revisa la hoja completa con lo escrito en las casillas de cada ejercicio. */
export function revisarHoja(hoja: HojaCuaderno, casillas: string[][]): RevisionEjercicio[] {
  return hoja.ejercicios.map((e, i) => revisarEjercicio(e, unirCasillas(e, casillas[i] ?? [])));
}

/** XP que vale una revisión: 2 por ejercicio bien y 5 más si están todos bien. */
export function xpRevision(revisiones: RevisionEjercicio[]): number {
  const bien = revisiones.filter((r) => r.estado === 'bien').length;
  return bien * XP_BIEN + (bien === revisiones.length ? XP_HOJA_PERFECTA : 0);
}
