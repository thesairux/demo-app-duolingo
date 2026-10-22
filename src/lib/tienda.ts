// Artículos que se compran con gemas: ayudas para las lecciones y ropa para Numi.

export type Gorro = 'amarillo' | 'naranjo' | 'azul' | 'verde' | 'rosado' | 'morado' | 'blanco' | 'dorado';

export interface DatosGorro {
  nombre: string;
  precio: number;
  /** Colores del birrete: base, sombra y brillo. */
  colores: [string, string, string];
}

export const GORROS: Record<Gorro, DatosGorro> = {
  amarillo: { nombre: 'Birrete clásico', precio: 0, colores: ['#F5B400', '#D69200', '#FFD660'] },
  naranjo: { nombre: 'Birrete naranjo', precio: 30, colores: ['#F07C1F', '#C45F0E', '#FFA75C'] },
  azul: { nombre: 'Birrete azul', precio: 30, colores: ['#2F7FD8', '#1E5EA8', '#6FAEF0'] },
  verde: { nombre: 'Birrete verde', precio: 30, colores: ['#23A35A', '#177A41', '#63CB8C'] },
  rosado: { nombre: 'Birrete rosado', precio: 30, colores: ['#E2508C', '#B33669', '#F28DB5'] },
  morado: { nombre: 'Birrete morado', precio: 30, colores: ['#8656D6', '#6339AE', '#B391EE'] },
  blanco: { nombre: 'Birrete de profe', precio: 50, colores: ['#F2F5F8', '#C3CDD8', '#FFFFFF'] },
  dorado: { nombre: 'Birrete de oro', precio: 100, colores: ['#E0A800', '#A87600', '#FFF0A0'] },
};

/** Partes de Numi donde va un accesorio. El libro siempre tiene uno; las demás pueden ir vacías. */
export type Ranura = 'cara' | 'cuello' | 'ropa' | 'libro';

export type IdAccesorio =
  | 'lentes'
  | 'lentes-sol'
  | 'antiparras'
  | 'lentes-corazon'
  | 'lentes-3d'
  | 'monoculo'
  | 'corbata'
  | 'humita'
  | 'bufanda'
  | 'credencial'
  | 'panuelo'
  | 'collar-flores'
  | 'medalla'
  | 'chaleco'
  | 'overol'
  | 'delantal'
  | 'bata'
  | 'terno'
  | 'capa'
  | 'libro-azul'
  | 'libro-rojo'
  | 'libro-verde'
  | 'libro-morado';

export interface DatosAccesorio {
  nombre: string;
  precio: number;
  ranura: Ranura;
  /** Color principal (libros). */
  color?: string;
}

export const ACCESORIOS: Record<IdAccesorio, DatosAccesorio> = {
  lentes: { nombre: 'Lentes de estudio', precio: 20, ranura: 'cara' },
  'lentes-sol': { nombre: 'Lentes de sol', precio: 20, ranura: 'cara' },
  antiparras: { nombre: 'Antiparras de ciencias', precio: 25, ranura: 'cara' },
  'lentes-corazon': { nombre: 'Lentes de corazón', precio: 20, ranura: 'cara' },
  'lentes-3d': { nombre: 'Lentes 3D', precio: 20, ranura: 'cara' },
  monoculo: { nombre: 'Monóculo', precio: 30, ranura: 'cara' },
  corbata: { nombre: 'Corbata', precio: 20, ranura: 'cuello' },
  humita: { nombre: 'Humita', precio: 20, ranura: 'cuello' },
  bufanda: { nombre: 'Bufanda', precio: 20, ranura: 'cuello' },
  credencial: { nombre: 'Credencial del colegio', precio: 20, ranura: 'cuello' },
  panuelo: { nombre: 'Pañuelo', precio: 15, ranura: 'cuello' },
  'collar-flores': { nombre: 'Collar de flores', precio: 25, ranura: 'cuello' },
  medalla: { nombre: 'Medalla de oro', precio: 35, ranura: 'cuello' },
  chaleco: { nombre: 'Chaleco reflectante', precio: 35, ranura: 'ropa' },
  overol: { nombre: 'Overol de pintor', precio: 35, ranura: 'ropa' },
  delantal: { nombre: 'Delantal de chef', precio: 30, ranura: 'ropa' },
  bata: { nombre: 'Bata de científica', precio: 35, ranura: 'ropa' },
  terno: { nombre: 'Terno', precio: 45, ranura: 'ropa' },
  capa: { nombre: 'Capa de héroe', precio: 60, ranura: 'ropa' },
  'libro-azul': { nombre: 'Libro azul', precio: 0, ranura: 'libro', color: '#2C5AA6' },
  'libro-rojo': { nombre: 'Libro rojo', precio: 15, ranura: 'libro', color: '#C0392B' },
  'libro-verde': { nombre: 'Libro verde', precio: 15, ranura: 'libro', color: '#1E8A4C' },
  'libro-morado': { nombre: 'Libro morado', precio: 15, ranura: 'libro', color: '#6B3FB5' },
};

export type Atuendo = Record<Ranura, IdAccesorio | null>;
export const ATUENDO_INICIAL: Atuendo = { cara: null, cuello: null, ropa: null, libro: 'libro-azul' };

export const NOMBRE_RANURA: Record<Ranura, string> = { cara: 'Lentes', cuello: 'Cuello', ropa: 'Ropa', libro: 'Libro' };

export const PRECIO_RECARGA_VIDAS = 15;
export const PRECIO_UNA_VIDA = 5;
export const PRECIO_PROTECTOR = 25;
export const MAX_PROTECTORES = 2;

/** El comodín 50/50 quita dos alternativas incorrectas. Se compran de a 3. */
export const PRECIO_COMODINES = 10;
export const COMODINES_POR_COMPRA = 3;
export const MAX_COMODINES = 9;
export const COMODINES_INICIALES = 3;

export const PRECIO_DOBLE_XP = 20;
export const MINUTOS_DOBLE_XP = 15;

/** Gemas por abrir un cofre: entre 20 y 40. */
export function gemasDeCofre(aleatorio: () => number = Math.random): number {
  return 20 + Math.floor(aleatorio() * 21);
}

export const GEMAS = {
  leccion: 10,
  leccionPerfecta: 5,
  metaDiaria: 15,
  checkpoint: 40,
  legendaria: 30,
  examenAprobado: 25,
} as const;

/** Elige al azar `cantidad` alternativas incorrectas para esconder con el comodín. */
export function opcionesAEsconder(total: number, correcta: number, cantidad = 2, aleatorio: () => number = Math.random): number[] {
  const incorrectas = Array.from({ length: total }, (_, i) => i).filter((i) => i !== correcta);
  for (let i = incorrectas.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [incorrectas[i], incorrectas[j]] = [incorrectas[j], incorrectas[i]];
  }
  return incorrectas.slice(0, cantidad);
}
