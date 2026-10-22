// Corrige una respuesta y arma el texto de la respuesta correcta para el feedback.
import type { Ejercicio } from '../content/types';

export type Respuesta =
  | { tipo: 'opcion'; indice: number }
  | { tipo: 'vf'; valor: boolean; justificacion?: number }
  | { tipo: 'texto'; valor: string }
  | { tipo: 'pares'; errores: number }
  | { tipo: 'orden'; indices: number[] }
  | { tipo: 'segmento'; indice: number }
  | { tipo: 'clasificacion'; categorias: number[] };

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
  }
}
