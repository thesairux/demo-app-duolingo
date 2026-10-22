// Formato del banco de contenido. Cada unidad vive en src/content/unidad-N.json.
// El validador (scripts/validar-contenido.mjs) revisa que los JSON cumplan este formato.

export type TipoEjercicio =
  | 'seleccion_multiple'
  | 'verdadero_falso'
  | 'completar'
  | 'unir_pares'
  | 'ordenar'
  | 'caso_practico'
  | 'identificar_error'
  | 'clasificar'
  | 'recta_numerica'
  | 'reloj'
  | 'fraccion_visual'
  | 'bloques';

/** 1 = 👑 lo básico · 2 = 👑👑 un poco más · 3 = 👑👑👑 problemas de la vida real */
export type Dificultad = 1 | 2 | 3;

export interface Fuente {
  /** De dónde sale el contenido, por ejemplo "Bases Curriculares Matemática 4° básico". No se muestra en la app: sirve para revisar y actualizar el banco. */
  archivo: string;
  pagina?: number;
  diapositiva?: number;
  /** Sección dentro del archivo, por ejemplo "OA 5" (objetivo de aprendizaje). */
  seccion?: string;
  /** Referencia más precisa, si la hay. */
  articulo?: string;
  /** true cuando el dato sale de una fuente externa y no de un archivo del proyecto. */
  fueraDelMaterial?: boolean;
}

interface EjercicioBase {
  /** u{unidad}-l{leccion}-e{nn}, por ejemplo "u1-l3-e07". */
  id: string;
  unidad: number;
  leccion: number;
  tipo: TipoEjercicio;
  dificultad: Dificultad;
  /** Etiqueta del concepto evaluado; el repaso inteligente agrupa por concepto. */
  concepto: string;
  enunciado: string;
  /** Se muestra al responder: la respuesta correcta y por qué. */
  explicacion: string;
  fuente: Fuente;
  fuentesAdicionales?: Fuente[];
  /** true si el dato hay que confirmarlo antes de usarlo. */
  revisar: boolean;
  /** Motivo de la revisión, obligatorio cuando revisar es true. */
  notaRevision?: string;
}

export interface SeleccionMultiple extends EjercicioBase {
  tipo: 'seleccion_multiple';
  opciones: [string, string, string, string];
  /** Índice de la opción correcta. */
  respuesta: number;
}

export interface VerdaderoFalso extends EjercicioBase {
  tipo: 'verdadero_falso';
  respuesta: boolean;
  /** Segundo paso opcional: elegir por qué. */
  justificacion?: { opciones: string[]; respuesta: number };
}

export interface Completar extends EjercicioBase {
  tipo: 'completar';
  /** El enunciado contiene "___" donde va la respuesta. */
  respuesta: string;
  /** Otras respuestas válidas. La comparación ignora mayúsculas y tildes. */
  aceptadas?: string[];
  /** Fichas para tocar (incluye la respuesta). Si falta, se escribe la respuesta. */
  banco?: string[];
}

export interface UnirPares extends EjercicioBase {
  tipo: 'unir_pares';
  pares: { a: string; b: string }[];
}

export interface Ordenar extends EjercicioBase {
  tipo: 'ordenar';
  /** Pasos en el orden correcto; la app los desordena. */
  pasos: string[];
}

export interface CasoPractico extends EjercicioBase {
  tipo: 'caso_practico';
  /** Historia breve; el enunciado es la pregunta sobre ella. */
  caso: string;
  opciones: [string, string, string, string];
  respuesta: number;
}

export interface IdentificarError extends EjercicioBase {
  tipo: 'identificar_error';
  /** La afirmación dividida en partes; el usuario toca la parte equivocada. */
  segmentos: string[];
  /** Índice del segmento con el error. */
  respuesta: number;
  /** Cómo debería decir ese segmento. */
  correccion: string;
}

export interface Clasificar extends EjercicioBase {
  tipo: 'clasificar';
  categorias: string[];
  elementos: { texto: string; categoria: number }[];
}

/** Arrastrar un punto por la recta numérica hasta un número. El punto parte en `min`. */
export interface RectaNumerica extends EjercicioBase {
  tipo: 'recta_numerica';
  min: number;
  max: number;
  /** Cuánto vale cada rayita. Entre `min` y `max` caben de 4 a 20 rayitas. */
  paso: number;
  /** Cada cuántas rayitas se escribe el número. Las dos puntas siempre lo llevan. */
  etiquetaCada: number;
  /** Dónde va el punto: una rayita entre `min` (sin incluirlo) y `max`. */
  respuesta: number;
}

/** Mover los punteros de un reloj hasta una hora. El reloj parte en las 12:00. */
export interface Reloj extends EjercicioBase {
  tipo: 'reloj';
  /** De 1 a 12. */
  hora: number;
  /** Múltiplo de 5, de 0 a 55. */
  minutos: number;
}

/** Tocar las partes de una pizza (círculo) o de una barra para pintar una fracción. */
export interface FraccionVisual extends EjercicioBase {
  tipo: 'fraccion_visual';
  figura: 'circulo' | 'barra';
  /** En cuántas partes iguales está dividida la figura (denominador), de 2 a 12. */
  partes: number;
  /** Cuántas partes hay que pintar (numerador). */
  respuesta: number;
}

/** Armar un número con bloques de mil, de cien, de diez y de uno (máximo 9 de cada uno). */
export interface Bloques extends EjercicioBase {
  tipo: 'bloques';
  /** El número que hay que armar, de 1 a 9.999. */
  respuesta: number;
}

export type Ejercicio =
  | SeleccionMultiple
  | VerdaderoFalso
  | Completar
  | UnirPares
  | Ordenar
  | CasoPractico
  | IdentificarError
  | Clasificar
  | RectaNumerica
  | Reloj
  | FraccionVisual
  | Bloques;

/** Tarjeta de la guía: la mini lección que se lee antes de practicar. */
export interface TarjetaGuia {
  titulo: string;
  texto: string;
  ejemplo?: string;
  fuentes: Fuente[];
  revisar: boolean;
  notaRevision?: string;
}

export interface Leccion {
  /** u{unidad}-l{leccion} */
  id: string;
  numero: number;
  titulo: string;
  objetivo: string;
  /** 'caso_practico' se dibuja como nodo especial (de problemas) en el camino. */
  tipoNodo: 'leccion' | 'caso_practico';
  /** De 2 a 6 tarjetas que explican el tema antes de los ejercicios. */
  guia: TarjetaGuia[];
  ejercicios: Ejercicio[];
}

export interface Unidad {
  unidad: number;
  titulo: string;
  descripcion: string;
  /** true si la unidad se armó con datos que hay que confirmar (dato interno). */
  fueraDelMaterial: boolean;
  /** Número de la lección después de la cual aparece un cofre. */
  cofreDespuesDe: number;
  lecciones: Leccion[];
}

export interface TerminoGlosario {
  termino: string;
  /** Otras formas en que aparece en los textos, para resaltarlo. */
  alias?: string[];
  definicion: string;
  unidad: number;
  fuente?: Fuente;
  revisar: boolean;
  notaRevision?: string;
}
