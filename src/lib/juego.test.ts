import { describe, expect, it } from 'vitest';
import { LECCIONES, UNIDADES } from '../content';
import type { Ejercicio } from '../content/types';
import { semilla } from './azar';
import { evaluar, normalizar, type Respuesta } from './evaluar';
import { claveDia, diasEntre, sumarDias } from './fechas';
import { estadoRacha, registrarPractica } from './racha';
import { armarSesion, dificultadObjetivo, EJERCICIOS_POR_SESION } from './sesion';
import { MS_RECARGA, msParaProximaVida, perderVida, recargar, VIDAS_MAX } from './vidas';
import { bonusLeccion, resumirXP, xpAcierto } from './xp';

const T0 = new Date(2026, 9, 1, 10, 0, 0).getTime();

describe('fechas', () => {
  it('cuenta días calendario', () => {
    expect(diasEntre('2026-09-30', '2026-10-01')).toBe(1);
    expect(diasEntre('2026-10-01', '2026-10-01')).toBe(0);
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(claveDia(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('vidas', () => {
  it('pierde una vida y el reloj parte al perder la primera', () => {
    const v = perderVida({ actuales: VIDAS_MAX, desde: 0 }, T0);
    expect(v).toEqual({ actuales: 4, desde: T0 });
    expect(msParaProximaVida(v, T0 + 10 * 60_000)).toBe(20 * 60_000);
  });
  it('recupera una vida cada 30 minutos sin pasarse de 5', () => {
    const v = { actuales: 2, desde: T0 };
    expect(recargar(v, T0 + MS_RECARGA - 1).actuales).toBe(2);
    expect(recargar(v, T0 + MS_RECARGA).actuales).toBe(3);
    expect(recargar(v, T0 + 2 * MS_RECARGA + 5_000)).toEqual({ actuales: 4, desde: T0 + 2 * MS_RECARGA });
    expect(recargar(v, T0 + 10 * MS_RECARGA).actuales).toBe(VIDAS_MAX);
    expect(msParaProximaVida({ actuales: VIDAS_MAX, desde: T0 }, T0)).toBeNull();
  });
  it('no baja de cero', () => {
    expect(perderVida({ actuales: 0, desde: T0 }, T0).actuales).toBe(0);
  });
});

describe('racha', () => {
  const base = { actual: 4, mejor: 6, ultimoDia: '2026-09-30', protectores: 0 };
  it('sigue si se practica al día siguiente', () => {
    const r = registrarPractica(base, '2026-10-01');
    expect(r.racha.actual).toBe(5);
    expect(r.extendida).toBe(true);
  });
  it('no cuenta dos veces el mismo día', () => {
    const r = registrarPractica({ ...base, ultimoDia: '2026-10-01' }, '2026-10-01');
    expect(r.racha.actual).toBe(4);
    expect(r.extendida).toBe(false);
  });
  it('se corta si pasa un día sin practicar', () => {
    expect(registrarPractica(base, '2026-10-02').racha.actual).toBe(1);
    expect(estadoRacha(base, '2026-10-02')).toEqual({ dias: 0, estado: 'perdida' });
  });
  it('un protector cubre un día perdido', () => {
    const conProtector = { ...base, protectores: 1 };
    expect(estadoRacha(conProtector, '2026-10-02').estado).toBe('en-peligro');
    const r = registrarPractica(conProtector, '2026-10-02');
    expect(r.racha.actual).toBe(5);
    expect(r.protectoresUsados).toBe(1);
    expect(r.racha.protectores).toBe(0);
  });
  it('avisa que está en peligro si hoy no se ha practicado', () => {
    expect(estadoRacha(base, '2026-10-01').estado).toBe('en-peligro');
  });
});

describe('xp', () => {
  it('da bonus de combo desde el tercer acierto seguido', () => {
    expect(xpAcierto(2)).toEqual({ base: 1, combo: 0 });
    expect(xpAcierto(3)).toEqual({ base: 1, combo: 1 });
  });
  it('da bonus por perfección y velocidad', () => {
    expect(bonusLeccion({ completada: true, errores: 0, segundos: 100, cantidadEjercicios: 12 })).toEqual({ leccion: 5, perfecta: 5, rapida: 3 });
    expect(bonusLeccion({ completada: true, errores: 3, segundos: 100, cantidadEjercicios: 12 })).toEqual({ leccion: 5, perfecta: 0, rapida: 0 });
    expect(bonusLeccion({ completada: false, errores: 0, segundos: 10, cantidadEjercicios: 12 })).toEqual({ leccion: 0, perfecta: 0, rapida: 0 });
  });
  it('una lección cumple la meta normal de 20 XP', () => {
    const peor = resumirXP({ ejercicios: 12, combo: 0, ...bonusLeccion({ completada: true, errores: 4, segundos: 600, cantidadEjercicios: 12 }) });
    const mejor = resumirXP({ ejercicios: 12, combo: 10, ...bonusLeccion({ completada: true, errores: 0, segundos: 120, cantidadEjercicios: 12 }) });
    expect(peor.total).toBe(17);
    expect(mejor.total).toBe(35);
  });
});

describe('evaluar', () => {
  const todos: Ejercicio[] = UNIDADES.flatMap((u) => u.lecciones.flatMap((l) => l.ejercicios));
  const de = <T extends Ejercicio['tipo']>(tipo: T) => todos.find((e) => e.tipo === tipo) as Extract<Ejercicio, { tipo: T }>;

  it('corrige alternativas y casos', () => {
    const e = de('seleccion_multiple');
    expect(evaluar(e, { tipo: 'opcion', indice: e.respuesta }).correcta).toBe(true);
    expect(evaluar(e, { tipo: 'opcion', indice: (e.respuesta + 1) % 4 }).correcta).toBe(false);
  });
  it('acepta respuestas sin tildes ni mayúsculas al completar', () => {
    const e = de('completar');
    expect(evaluar(e, { tipo: 'texto', valor: ` ${e.respuesta.toUpperCase()} ` }).correcta).toBe(true);
    expect(normalizar('Límite')).toBe('limite');
  });
  it('exige el orden exacto', () => {
    const e = de('ordenar');
    const ok = e.pasos.map((_, i) => i);
    expect(evaluar(e, { tipo: 'orden', indices: ok }).correcta).toBe(true);
    expect(evaluar(e, { tipo: 'orden', indices: [...ok].reverse() }).correcta).toBe(false);
  });
  it('unir pares es correcto solo sin intentos fallidos', () => {
    const e = de('unir_pares');
    expect(evaluar(e, { tipo: 'pares', errores: 0 }).correcta).toBe(true);
    expect(evaluar(e, { tipo: 'pares', errores: 2 }).nota).toContain('2 intentos');
  });
  it('clasifica cada elemento', () => {
    const e = de('clasificar');
    const ok = e.elementos.map((el) => el.categoria);
    expect(evaluar(e, { tipo: 'clasificacion', categorias: ok }).correcta).toBe(true);
    expect(evaluar(e, { tipo: 'clasificacion', categorias: ok.map((c) => (c + 1) % e.categorias.length) }).correcta).toBe(false);
  });
  it('verdadero o falso con justificación exige ambas partes', () => {
    // El banco ya no usa justificación (las preguntas se resuelven en un paso), pero la app la sigue soportando.
    const base = todos.find((x) => x.tipo === 'verdadero_falso') as Extract<Ejercicio, { tipo: 'verdadero_falso' }>;
    const e = { ...base, justificacion: { opciones: ['Porque sí', 'Porque lo dice la ley', 'Porque no'], respuesta: 1 } };
    const j = e.justificacion!.respuesta;
    expect(evaluar(e, { tipo: 'vf', valor: e.respuesta, justificacion: j }).correcta).toBe(true);
    expect(evaluar(e, { tipo: 'vf', valor: e.respuesta, justificacion: (j + 1) % e.justificacion!.opciones.length }).correcta).toBe(false);
  });
});

describe('sesiones', () => {
  const leccion = UNIDADES[0].lecciones[0];
  it('arma sesiones de 10 ejercicios, de lo fácil a lo difícil', () => {
    const s = armarSesion(leccion, 0, semilla(1));
    expect(s).toHaveLength(EJERCICIOS_POR_SESION);
    expect(s.map((e) => e.dificultad)).toEqual([...s.map((e) => e.dificultad)].sort());
  });
  it('cada corona sube la dificultad, de a poco', () => {
    expect([0, 1, 2, 3].map(dificultadObjetivo)).toEqual([1, 1.5, 2.5, 2.5]);
    const promedio = (c: number) => armarSesion(leccion, c, semilla(2)).reduce((a, e) => a + e.dificultad, 0) / EJERCICIOS_POR_SESION;
    expect(promedio(2)).toBeGreaterThan(promedio(0));
  });
});

describe('contenido', () => {
  it('carga las 4 unidades y 12 lecciones con al menos 10 ejercicios cada una', () => {
    expect(UNIDADES.map((u) => u.unidad)).toEqual([1, 2, 3, 4]);
    expect(LECCIONES).toHaveLength(12);
    expect(LECCIONES.every((l) => l.leccion.ejercicios.length >= 10)).toBe(true);
    expect(LECCIONES.every((l) => l.leccion.guia.length >= 2)).toBe(true);
  });

  it('la respuesta correcta de cada pregunta del banco se corrige como correcta', () => {
    const correcta = (e: Ejercicio): Respuesta => {
      switch (e.tipo) {
        case 'seleccion_multiple':
        case 'caso_practico':
          return { tipo: 'opcion', indice: e.respuesta };
        case 'verdadero_falso':
          return { tipo: 'vf', valor: e.respuesta };
        case 'completar':
          return { tipo: 'texto', valor: e.respuesta };
        case 'unir_pares':
          return { tipo: 'pares', errores: 0 };
        case 'ordenar':
          return { tipo: 'orden', indices: e.pasos.map((_, i) => i) };
        case 'identificar_error':
          return { tipo: 'segmento', indice: e.respuesta };
        case 'clasificar':
          return { tipo: 'clasificacion', categorias: e.elementos.map((el) => el.categoria) };
      }
    };
    const mal = UNIDADES.flatMap((u) => u.lecciones.flatMap((l) => l.ejercicios)).filter((e) => !evaluar(e, correcta(e)).correcta);
    expect(mal.map((e) => e.id)).toEqual([]);
  });
});
