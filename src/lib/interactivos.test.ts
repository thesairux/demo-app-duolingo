import { describe, expect, it } from 'vitest';
import { UNIDADES } from '../content';
import type { Bloques, Ejercicio, FraccionVisual, RectaNumerica, Reloj } from '../content/types';
import { semilla } from './azar';
import { ACIERTOS_POR_NIVEL, nivelDesafio, nuevoCalculo, NIVEL_MAXIMO } from './desafio';
import { aplicarActividad, estadoInicial } from './estado';
import { bloquesDe, evaluar } from './evaluar';

const T0 = new Date(2026, 9, 1, 10, 0, 0).getTime();
const base = { id: 'x', unidad: 1, leccion: 1, dificultad: 1 as const, concepto: 'c', enunciado: 'e', explicacion: 'x', fuente: { archivo: 'a' }, revisar: false };
const todos: Ejercicio[] = UNIDADES.flatMap((u) => u.lecciones.flatMap((l) => l.ejercicios));

describe('recta numérica', () => {
  const decimal: RectaNumerica = { ...base, tipo: 'recta_numerica', min: 0, max: 1, paso: 0.1, etiquetaCada: 5, respuesta: 0.7 };
  const miles: RectaNumerica = { ...base, tipo: 'recta_numerica', min: 4000, max: 5000, paso: 100, etiquetaCada: 5, respuesta: 4300 };

  it('acepta el valor de la rayita aunque la suma de decimales no sea exacta', () => {
    expect(evaluar(decimal, { tipo: 'valor', valor: 0.1 * 7 }).correcta).toBe(true);
    expect(evaluar(decimal, { tipo: 'valor', valor: 0.6 }).correcta).toBe(false);
    expect(evaluar(miles, { tipo: 'valor', valor: 4300 }).correcta).toBe(true);
    expect(evaluar(miles, { tipo: 'valor', valor: 4400 }).correcta).toBe(false);
  });

  it('dice dónde va el punto, escrito como en Chile', () => {
    expect(evaluar(decimal, { tipo: 'valor', valor: 0 }).solucion).toBe('El punto va en el 0,7.');
    expect(evaluar(miles, { tipo: 'valor', valor: 0 }).solucion).toBe('El punto va en el 4.300.');
  });
});

describe('reloj', () => {
  const ej: Reloj = { ...base, tipo: 'reloj', hora: 7, minutos: 30 };

  it('revisa hora y minutos', () => {
    expect(evaluar(ej, { tipo: 'hora', hora: 7, minutos: 30 }).correcta).toBe(true);
    expect(evaluar(ej, { tipo: 'hora', hora: 7, minutos: 35 }).correcta).toBe(false);
    expect(evaluar(ej, { tipo: 'hora', hora: 8, minutos: 30 }).correcta).toBe(false);
  });

  it('explica dónde apunta cada puntero', () => {
    expect(evaluar(ej, { tipo: 'hora', hora: 12, minutos: 0 }).solucion).toBe('A las 7:30, el puntero largo apunta al 6 y el corto queda entre el 7 y el 8.');
    const enPunto: Reloj = { ...base, tipo: 'reloj', hora: 3, minutos: 0 };
    expect(evaluar(enPunto, { tipo: 'hora', hora: 12, minutos: 0 }).solucion).toBe('A las 3:00, el puntero largo apunta al 12 y el corto apunta al 3.');
    const doce: Reloj = { ...base, tipo: 'reloj', hora: 12, minutos: 15 };
    expect(evaluar(doce, { tipo: 'hora', hora: 12, minutos: 15 }).correcta).toBe(true);
    expect(evaluar(doce, { tipo: 'hora', hora: 12, minutos: 0 }).solucion).toContain('entre el 12 y el 1');
  });
});

describe('fracción para pintar', () => {
  const ej: FraccionVisual = { ...base, tipo: 'fraccion_visual', figura: 'circulo', partes: 8, respuesta: 3 };
  it('cuenta las partes pintadas', () => {
    expect(evaluar(ej, { tipo: 'partes', cantidad: 3 }).correcta).toBe(true);
    expect(evaluar(ej, { tipo: 'partes', cantidad: 5 }).correcta).toBe(false);
    expect(evaluar(ej, { tipo: 'partes', cantidad: 0 }).solucion).toBe('Había que pintar 3 de las 8 partes: 3/8.');
  });
});

describe('bloques', () => {
  const ej: Bloques = { ...base, tipo: 'bloques', respuesta: 4060 };
  it('separa un número en bloques', () => {
    expect(bloquesDe(4060)).toEqual([4, 0, 6, 0]);
    expect(bloquesDe(2315)).toEqual([2, 3, 1, 5]);
    expect(bloquesDe(507)).toEqual([0, 5, 0, 7]);
  });
  it('revisa el número armado', () => {
    expect(evaluar(ej, { tipo: 'bloques', cantidades: [4, 0, 6, 0] }).correcta).toBe(true);
    expect(evaluar(ej, { tipo: 'bloques', cantidades: [4, 6, 0, 0] }).correcta).toBe(false);
    expect(evaluar(ej, { tipo: 'bloques', cantidades: [0, 0, 0, 0] }).solucion).toBe('Se arma con 4 cubos de mil, 0 placas de cien, 6 barras de diez y 0 cubitos.');
    const chico: Bloques = { ...base, tipo: 'bloques', respuesta: 105 };
    expect(evaluar(chico, { tipo: 'bloques', cantidades: [0, 0, 0, 0] }).solucion).toBe('Se arma con 1 placa de cien, 0 barras de diez y 5 cubitos.');
  });
});

describe('el banco tiene preguntas interactivas', () => {
  it('hay de los 4 tipos nuevos y todas tienen una explicación', () => {
    for (const tipo of ['recta_numerica', 'reloj', 'fraccion_visual', 'bloques'] as const) {
      const de = todos.filter((e) => e.tipo === tipo);
      expect(de.length).toBeGreaterThanOrEqual(2);
      expect(de.every((e) => e.explicacion.length > 20)).toBe(true);
    }
  });
});

/** Resuelve el texto del cálculo por su cuenta, sin mirar la respuesta guardada. */
function resolver(texto: string): number {
  const t = texto.replace(/(\d)\.(\d{3})/g, '$1$2');
  const doble = t.match(/^Doble de (\d+)$/);
  if (doble) return Number(doble[1]) * 2;
  const mitad = t.match(/^Mitad de (\d+)$/);
  if (mitad) return Number(mitad[1]) / 2;
  const [x, op, y] = t.split(' ');
  const [a, b] = [Number(x), Number(y)];
  if (op === '+') return a + b;
  if (op === '−') return a - b;
  if (op === '×') return a * b;
  if (op === ':') return a / b;
  throw new Error(`No sé resolver ${texto}`);
}

describe('desafío relámpago', () => {
  it('los cálculos de cada nivel tienen la respuesta correcta y son de cabeza', () => {
    const azar = semilla(11);
    for (let nivel = 0; nivel <= NIVEL_MAXIMO; nivel++) {
      let anterior = null;
      for (let i = 0; i < 400; i++) {
        const c = nuevoCalculo(nivel, anterior, azar);
        expect(c.respuesta).toBe(resolver(c.texto));
        expect(Number.isInteger(c.respuesta)).toBe(true);
        expect(c.respuesta).toBeGreaterThanOrEqual(0);
        expect(c.respuesta).toBeLessThan(10_000);
        expect(c.texto).not.toBe(anterior?.texto);
        anterior = c;
      }
    }
  });

  it('sube de nivel cada 4 aciertos, hasta el 3', () => {
    expect(nivelDesafio(0)).toBe(0);
    expect(nivelDesafio(ACIERTOS_POR_NIVEL - 1)).toBe(0);
    expect(nivelDesafio(ACIERTOS_POR_NIVEL)).toBe(1);
    expect(nivelDesafio(100)).toBe(NIVEL_MAXIMO);
  });

  it('guarda el récord y da el logro Rayo mental con 15 aciertos', () => {
    const inicio = { ...estadoInicial(T0), perfil: { apodo: '', metaDiaria: 20 as const, creado: '2026-10-01' } };
    const primero = aplicarActividad(inicio, { xp: 9, practica: true, puntajeDesafio: 9 }, T0);
    expect(primero.efectos.record).toBe(true);
    expect(primero.estado.mejorDesafio).toBe(9);
    expect(primero.estado.racha.actual).toBe(1);
    const peor = aplicarActividad(primero.estado, { xp: 5, practica: true, puntajeDesafio: 5 }, T0);
    expect(peor.efectos.record).toBe(false);
    expect(peor.estado.mejorDesafio).toBe(9);
    const mejor = aplicarActividad(peor.estado, { xp: 15, practica: true, puntajeDesafio: 15 }, T0);
    expect(mejor.efectos.logrosNuevos.map((l) => l.id)).toContain('desafio-15');
  });
});
