// Hojas para resolver en el cuaderno: se generan al azar, Claude lee la foto y la app corrige.
// Este archivo no usa nada del navegador: también lo usa el corrector del servidor (netlify/functions).
import { elegir, type Aleatorio } from './azar';

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

/** Lo que Claude leyó en la foto: el resultado escrito en cada ejercicio, o null si no se pudo leer. */
export interface LecturaHoja {
  hayEjercicios: boolean;
  ejercicios: { numero: number; leido: string | null }[];
}

export type EstadoRevision = 'bien' | 'mal' | 'sin-leer';

export interface RevisionEjercicio {
  ejercicio: EjercicioCuaderno;
  estado: EstadoRevision;
  leido: string | null;
  /** Un detalle para el niño, por ejemplo que le faltó anotar el resto. */
  nota?: string;
}

export const EJERCICIOS_POR_HOJA = 4;
/** XP por ejercicio bien revisado con foto, y extra si la hoja sale perfecta. */
export const XP_FOTO = 2;
export const XP_HOJA_PERFECTA = 5;
/** XP por ejercicio que el niño marca como bien al revisar él mismo (sin foto). */
export const XP_MANUAL = 1;

/** Escribe un número como en Chile: 1012 → "1.012". */
export function formatoNumero(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

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

// ---------- Lectura de la foto ----------

/** Lo mínimo que necesita el lector: el número y el enunciado de cada ejercicio. */
export type EjercicioALeer = Pick<EjercicioCuaderno, 'numero' | 'enunciado'>;

/** Enunciados válidos: solo números y signos, para que nadie pueda colar otras instrucciones al corrector. */
const ENUNCIADO_VALIDO = /^[0-9 .+−×:/=]{3,30}$/;

export function ejerciciosValidos(valor: unknown): valor is EjercicioALeer[] {
  return (
    Array.isArray(valor) &&
    valor.length >= 1 &&
    valor.length <= 6 &&
    valor.every((e, i) => e && e.numero === i + 1 && typeof e.enunciado === 'string' && ENUNCIADO_VALIDO.test(e.enunciado))
  );
}

/** Las instrucciones para Claude. Le pedimos solo que lea: la corrección la hace la app, que no se equivoca en las cuentas. */
export function promptLectura(ejercicios: EjercicioALeer[]): string {
  return [
    'Eres el ayudante de una app de matemática para niños de 4° básico en Chile.',
    'La foto muestra el cuaderno de un niño o una niña que resolvió a mano estos ejercicios:',
    '',
    ...ejercicios.map((e) => `${e.numero}) ${e.enunciado}`),
    '',
    'Tu tarea es solo LEER lo que escribió. No corrijas ni hagas las cuentas.',
    '- Para cada número de ejercicio, copia el resultado final que escribió: el número encerrado en un círculo o, si no hay, el que está después del signo = o al final de su desarrollo.',
    '- Copia exactamente lo que ves, aunque esté mal. No lo arregles.',
    '- Si en una división anotó un resto, inclúyelo así: "9 resto 5".',
    '- Escribe las fracciones así: "7/10".',
    '- Si un ejercicio no aparece, está tapado o no se lee con seguridad, usa null.',
    '- Si la foto no muestra ejercicios escritos a mano, responde "hayEjercicios": false.',
    '',
    'Responde solo con JSON, con esta forma:',
    '{"hayEjercicios": true, "ejercicios": [{"numero": 1, "leido": "623"}, {"numero": 2, "leido": null}]}',
  ].join('\n');
}

/** El mismo formato, como esquema JSON, para pedirle a la API una respuesta que siempre calce. */
export const ESQUEMA_LECTURA = {
  type: 'object',
  additionalProperties: false,
  required: ['hayEjercicios', 'ejercicios'],
  properties: {
    hayEjercicios: { type: 'boolean' },
    ejercicios: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['numero', 'leido'],
        properties: { numero: { type: 'integer' }, leido: { anyOf: [{ type: 'string' }, { type: 'null' }] } },
      },
    },
  },
} as const;

/** Revisa que la respuesta de Claude tenga la forma pedida. Devuelve null si no sirve. */
export function validarLectura(valor: unknown, ejercicios: EjercicioALeer[]): LecturaHoja | null {
  if (!valor || typeof valor !== 'object') return null;
  const v = valor as { hayEjercicios?: unknown; ejercicios?: unknown };
  if (typeof v.hayEjercicios !== 'boolean' || !Array.isArray(v.ejercicios)) return null;
  const leidos = new Map<number, string | null>();
  for (const e of v.ejercicios) {
    if (!e || typeof e !== 'object') continue;
    const { numero, leido } = e as { numero?: unknown; leido?: unknown };
    if (typeof numero !== 'number') continue;
    leidos.set(numero, typeof leido === 'string' && leido.trim() ? leido.trim().slice(0, 40) : null);
  }
  return { hayEjercicios: v.hayEjercicios, ejercicios: ejercicios.map((e) => ({ numero: e.numero, leido: leidos.get(e.numero) ?? null })) };
}

// ---------- Corrección ----------

/** Los números enteros que aparecen en lo leído, después del último "=". El punto de los miles no corta el número. */
function enteros(leido: string): number[] {
  const final = leido.slice(leido.lastIndexOf('=') + 1);
  const limpio = final.replace(/(\d)[.\s](?=\d{3}(?!\d))/g, '$1').replace(/(\d)\s+(?=\d)/g, '$1');
  return (limpio.match(/\d+/g) ?? []).map(Number);
}

/** Compara lo que escribió el niño con la solución. */
export function revisarEjercicio(ejercicio: EjercicioCuaderno, leido: string | null): RevisionEjercicio {
  const base = { ejercicio, leido };
  if (!leido) return { ...base, estado: 'sin-leer' };
  const s = ejercicio.solucion;
  switch (s.tipo) {
    case 'entero': {
      const n = enteros(leido);
      if (!n.length) return { ...base, estado: 'sin-leer' };
      return { ...base, estado: n[n.length - 1] === s.valor ? 'bien' : 'mal' };
    }
    case 'division': {
      const [cociente, resto] = enteros(leido);
      if (cociente === undefined) return { ...base, estado: 'sin-leer' };
      if (cociente !== s.cociente) return { ...base, estado: 'mal' };
      if (resto === undefined && s.resto > 0) return { ...base, estado: 'mal', nota: `El ${s.cociente} está bien, pero te faltó anotar que sobran ${s.resto}.` };
      return { ...base, estado: (resto ?? 0) === s.resto ? 'bien' : 'mal' };
    }
    case 'fraccion': {
      const todas = [...leido.matchAll(/(\d+)\s*\/\s*(\d+)/g)];
      const ultima = todas[todas.length - 1];
      if (!ultima) return { ...base, estado: 'sin-leer' };
      const [n, d] = [Number(ultima[1]), Number(ultima[2])];
      if (d === 0) return { ...base, estado: 'mal' };
      if (n * s.denominador !== s.numerador * d) return { ...base, estado: 'mal' };
      // Una fracción equivalente también vale, aunque en 4° básico todavía no se simplifica.
      return { ...base, estado: 'bien', nota: d !== s.denominador ? `¡Bien! ${n}/${d} es lo mismo que ${s.numerador}/${s.denominador}.` : undefined };
    }
  }
}

export function revisarHoja(hoja: HojaCuaderno, lectura: LecturaHoja): RevisionEjercicio[] {
  return hoja.ejercicios.map((e) => revisarEjercicio(e, lectura.ejercicios.find((l) => l.numero === e.numero)?.leido ?? null));
}

/** XP que vale una revisión con foto: 2 por ejercicio bien y 5 más si están todos bien. */
export function xpRevision(revisiones: RevisionEjercicio[]): number {
  const bien = revisiones.filter((r) => r.estado === 'bien').length;
  return bien * XP_FOTO + (bien === revisiones.length ? XP_HOJA_PERFECTA : 0);
}
