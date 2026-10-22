// Corrige una respuesta y arma el texto de la respuesta correcta para el feedback.
import type { Bloques, Ejercicio, Reloj } from '../content/types';
import { formatoValor } from './numeros';

export type Respuesta =
  | { tipo: 'opcion'; indice: number }
  | { tipo: 'vf'; valor: boolean; justificacion?: number }
  | { tipo: 'texto'; valor: string }
  | { tipo: 'pares'; errores: number }
  | { tipo: 'orden'; indices: number[] }
  | { tipo: 'segmento'; indice: number }
  | { tipo: 'clasificacion'; categorias: number[] }
  | { tipo: 'valor'; valor: number }
  | { tipo: 'hora'; hora: number; minutos: number }
  | { tipo: 'partes'; cantidad: number }
  /** Bloques de mil, de cien, de diez y de uno, en ese orden. */
  | { tipo: 'bloques'; cantidades: number[] };

export interface Correccion {
  correcta: boolean;
  /** La respuesta correcta, lista para mostrar. */
  solucion: string;
  /** Comentario extra (por ejemplo, intentos fallidos al unir pares). */
  nota?: string;
}

/** Minúsculas, sin tildes ni espacios sobrantes. */
export function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
}

/** Valor de cada columna de bloques: mil, cien, diez y uno. */
export const VALORES_BLOQUES = [1000, 100, 10, 1];

/** Cuántos bloques de cada tipo forman un número: 4060 → [4, 0, 6, 0]. */
export function bloquesDe(n: number): number[] {
  return VALORES_BLOQUES.map((v) => Math.floor(n / v) % 10);
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

function describirBloques(ej: Bloques): string {
  const [m, c, d, u] = bloquesDe(ej.respuesta);
  const partes = [
    ej.respuesta >= 1000 ? plural(m, 'cubo de mil', 'cubos de mil') : null,
    plural(c, 'placa de cien', 'placas de cien'),
    plural(d, 'barra de diez', 'barras de diez'),
    plural(u, 'cubito', 'cubitos'),
  ].filter((p): p is string => !!p);
  return `Se arma con ${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}.`;
}

export function textoHora(hora: number, minutos: number): string {
  return `${hora}:${String(minutos).padStart(2, '0')}`;
}

function describirReloj(ej: Reloj): string {
  const largo = ej.minutos === 0 ? 12 : ej.minutos / 5;
  const corto = ej.minutos === 0 ? `apunta al ${ej.hora}` : `queda entre el ${ej.hora} y el ${(ej.hora % 12) + 1}`;
  return `A las ${textoHora(ej.hora, ej.minutos)}, el puntero largo apunta al ${largo} y el corto ${corto}.`;
}

export function evaluar(ej: Ejercicio, r: Respuesta): Correccion {
  switch (ej.tipo) {
    case 'seleccion_multiple':
    case 'caso_practico':
      return { correcta: r.tipo === 'opcion' && r.indice === ej.respuesta, solucion: ej.opciones[ej.respuesta] };

    case 'verdadero_falso': {
      const valorOk = r.tipo === 'vf' && r.valor === ej.respuesta;
      const justOk = !ej.justificacion || (r.tipo === 'vf' && r.justificacion === ej.justificacion.respuesta);
      const solucion = (ej.respuesta ? 'Verdadero' : 'Falso') + (ej.justificacion ? `: ${ej.justificacion.opciones[ej.justificacion.respuesta]}` : '');
      return { correcta: valorOk && justOk, solucion };
    }

    case 'completar': {
      const validas = [ej.respuesta, ...(ej.aceptadas ?? [])].map(normalizar);
      return {
        correcta: r.tipo === 'texto' && validas.includes(normalizar(r.valor)),
        solucion: ej.enunciado.replace('___', ej.respuesta),
      };
    }

    case 'unir_pares': {
      const errores = r.tipo === 'pares' ? r.errores : 1;
      return {
        correcta: errores === 0,
        solucion: ej.pares.map((p) => `${p.a} → ${p.b}`).join('\n'),
        nota: errores > 0 ? `Completaste los pares, pero con ${errores} ${errores === 1 ? 'intento equivocado' : 'intentos equivocados'}.` : undefined,
      };
    }

    case 'ordenar':
      return {
        correcta: r.tipo === 'orden' && r.indices.length === ej.pasos.length && r.indices.every((v, i) => v === i),
        solucion: ej.pasos.map((p, i) => `${i + 1}. ${p}`).join('\n'),
      };

    case 'identificar_error':
      return {
        correcta: r.tipo === 'segmento' && r.indice === ej.respuesta,
        solucion: `La parte equivocada es «${ej.segmentos[ej.respuesta].trim()}». Debería decir: «${ej.correccion}»`,
      };

    case 'clasificar':
      return {
        correcta: r.tipo === 'clasificacion' && ej.elementos.every((el, i) => r.categorias[i] === el.categoria),
        solucion: ej.categorias
          .map((c, ci) => `${c}: ${ej.elementos.filter((el) => el.categoria === ci).map((el) => el.texto).join(' · ')}`)
          .join('\n'),
      };

    case 'recta_numerica':
      return {
        correcta: r.tipo === 'valor' && Math.abs(r.valor - ej.respuesta) < ej.paso / 2,
        solucion: `El punto va en el ${formatoValor(ej.respuesta, ej.paso)}.`,
      };

    case 'reloj':
      return {
        correcta: r.tipo === 'hora' && r.hora % 12 === ej.hora % 12 && r.minutos === ej.minutos,
        solucion: describirReloj(ej),
      };

    case 'fraccion_visual':
      return {
        correcta: r.tipo === 'partes' && r.cantidad === ej.respuesta,
        solucion: `Había que pintar ${ej.respuesta} de las ${ej.partes} partes: ${ej.respuesta}/${ej.partes}.`,
      };

    case 'bloques':
      return {
        correcta: r.tipo === 'bloques' && r.cantidades.reduce((s, c, i) => s + c * VALORES_BLOQUES[i], 0) === ej.respuesta,
        solucion: describirBloques(ej),
      };
  }
}
