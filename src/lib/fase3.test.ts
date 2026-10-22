import { describe, expect, it } from 'vitest';
import { LECCIONES, leccionesDeUnidad } from '../content';
import { semilla } from './azar';
import { abrirCofre, aplicarSesion, cofreDisponible, comprar, estadoInicial, type EstadoJuego, type ResultadoSesion } from './estado';
import { claveDia, sumarDias } from './fechas';
import { estadoNodo, leccionActual } from './progreso';
import { actualizarFicha, armarPractica, pendientes, temasDebiles } from './repaso';
import { armarCheckpoint, armarExamen, armarLegendario, armarRepasoLeccion, EJERCICIOS_CHECKPOINT, EJERCICIOS_REPASO, type ModoSesion } from './sesion';
import { logroPorId } from './logros';
import { lunesDe, xpSemanal } from './semana';
import { GEMAS, PRECIO_RECARGA_VIDAS } from './tienda';
import { VIDAS_MAX } from './vidas';
import { resumirXP } from './xp';

const T0 = new Date(2026, 9, 1, 10, 0, 0).getTime(); // jueves 1 de octubre de 2026
const HOY = claveDia(new Date(T0));
const L0 = LECCIONES[0].leccion;

function base(): EstadoJuego {
  return { ...estadoInicial(T0), perfil: { apodo: '', metaDiaria: 20, creado: HOY } };
}

function resultado(modo: ModoSesion, parcial: Partial<ResultadoSesion> = {}): ResultadoSesion {
  return {
    modo,
    completada: true,
    xp: resumirXP({ ejercicios: 12, combo: 0, leccion: 5, perfecta: 0, rapida: 0 }),
    total: 12,
    aciertosPrimerIntento: 11,
    aciertos: 12,
    respuestas: 13,
    errores: 1,
    segundos: 200,
    porEjercicio: { [L0.ejercicios[0].id]: { aciertos: 1, fallos: 1 }, [L0.ejercicios[1].id]: { aciertos: 1, fallos: 0 } },
    casosCorrectos: 2,
    ...parcial,
  };
}

describe('lecciones', () => {
  it('al empezar solo la primera lección está disponible', () => {
    const e = base();
    expect(estadoNodo(LECCIONES, e.lecciones, 0)).toBe('disponible');
    expect(estadoNodo(LECCIONES, e.lecciones, 1)).toBe('bloqueado');
    expect(leccionActual(LECCIONES, e.lecciones)?.orden).toBe(0);
  });

  it('completar da una corona, desbloquea la siguiente, suma racha, gemas por meta y el logro de la primera lección', () => {
    const conMeta = { xp: resumirXP({ ejercicios: 12, combo: 6, leccion: 5, perfecta: 0, rapida: 0 }) };
    const { estado, efectos } = aplicarSesion(base(), resultado({ tipo: 'leccion', leccionId: L0.id }, conMeta), T0);
    expect(estado.lecciones[L0.id]).toMatchObject({ coronas: 1, completadas: 1, mejorPrecision: 92 });
    expect(estadoNodo(LECCIONES, estado.lecciones, 1)).toBe('disponible');
    expect(estado.racha.actual).toBe(1);
    expect(efectos.metaCumplidaHoy).toBe(true);
    expect(efectos.logrosNuevos.map((l) => l.id)).toContain('primera-leccion');
    expect(estado.gemas).toBe(GEMAS.leccion + GEMAS.metaDiaria + logroPorId('primera-leccion')!.gemas);
    expect(estado.contadores.casosResueltos).toBe(2);
  });

  it('quedarse sin vidas no da corona ni racha, pero guarda la XP', () => {
    const { estado, efectos } = aplicarSesion(base(), resultado({ tipo: 'leccion', leccionId: L0.id }, { completada: false }), T0);
    expect(estado.lecciones).toEqual({});
    expect(estado.racha.actual).toBe(0);
    expect(estado.xpTotal).toBe(17);
    expect(efectos.coronasDespues).toBe(0);
  });
});

describe('repaso y vidas', () => {
  it('repasar una lección devuelve una vida', () => {
    const e = { ...base(), vidas: { actuales: 2, desde: T0 } };
    const { estado, efectos } = aplicarSesion(e, resultado({ tipo: 'repaso-leccion', leccionId: L0.id }), T0);
    expect(estado.vidas.actuales).toBe(3);
    expect(efectos.vidaGanada).toBe(true);
    expect(estado.contadores.repasos).toBe(1);
  });

  it('con las vidas llenas el repaso no suma vidas', () => {
    const { estado, efectos } = aplicarSesion(base(), resultado({ tipo: 'practica', ids: [] }), T0);
    expect(estado.vidas.actuales).toBe(VIDAS_MAX);
    expect(efectos.vidaGanada).toBe(false);
  });

  it('las fichas suben de caja al acertar a la primera y vuelven a 0 al fallar', () => {
    const f1 = actualizarFicha(undefined, { aciertos: 1, fallos: 0 }, HOY, T0);
    expect(f1).toMatchObject({ caja: 1, proxima: sumarDias(HOY, 1) });
    const f2 = actualizarFicha(f1, { aciertos: 1, fallos: 0 }, HOY, T0);
    expect(f2).toMatchObject({ caja: 2, proxima: sumarDias(HOY, 3) });
    const f3 = actualizarFicha(f2, { aciertos: 1, fallos: 1 }, HOY, T0);
    expect(f3).toMatchObject({ caja: 0, proxima: HOY, aciertos: 3, fallos: 1 });
  });

  it('la práctica parte por lo pendiente y lo más débil', () => {
    const { estado } = aplicarSesion(base(), resultado({ tipo: 'leccion', leccionId: L0.id }), T0);
    const fallado = L0.ejercicios[0].id;
    expect(pendientes(estado.ejercicios, HOY)).toEqual([fallado]);
    expect(armarPractica(estado.ejercicios, HOY, semilla(1)).map((e) => e.id)).toContain(fallado);
    expect(armarPractica({}, HOY)).toEqual([]);
    expect(temasDebiles(estado.ejercicios)[0]).toMatchObject({ leccionId: L0.id, precision: 67 });
  });

  it('el repaso de lección usa ejercicios hasta el nivel alcanzado', () => {
    const repaso = armarRepasoLeccion(L0, 1, semilla(3));
    expect(repaso).toHaveLength(EJERCICIOS_REPASO);
    expect(repaso.every((e) => e.dificultad <= 2)).toBe(true);
    expect(armarRepasoLeccion(L0, 3, semilla(3))).toHaveLength(EJERCICIOS_REPASO);
  });
});

describe('checkpoint, legendario y examen', () => {
  it('el checkpoint reparte preguntas de toda la unidad', () => {
    const preguntas = armarCheckpoint(1, semilla(4));
    expect(preguntas).toHaveLength(EJERCICIOS_CHECKPOINT);
    expect(new Set(preguntas.map((e) => e.id.split('-e')[0])).size).toBe(leccionesDeUnidad(1).length);
  });

  it('aprobar el checkpoint (70%) desbloquea toda la unidad y la siguiente', () => {
    const r = resultado({ tipo: 'checkpoint', unidad: 1 }, { total: 15, aciertosPrimerIntento: 12, errores: 3 });
    const { estado, efectos } = aplicarSesion(base(), r, T0);
    expect(efectos.aprobado).toBe(true);
    expect(leccionesDeUnidad(1).every((l) => estado.lecciones[l.leccion.id]?.coronas === 1)).toBe(true);
    const primeraU2 = leccionesDeUnidad(2)[0];
    expect(estadoNodo(LECCIONES, estado.lecciones, primeraU2.orden)).toBe('disponible');
    expect(estado.checkpoints.u1).toEqual({ aprobado: true, mejor: 80 });
  });

  it('el checkpoint con menos de 70% no se aprueba', () => {
    const r = resultado({ tipo: 'checkpoint', unidad: 1 }, { total: 12, aciertosPrimerIntento: 8, errores: 4 });
    const { estado, efectos } = aplicarSesion(base(), r, T0);
    expect(efectos.aprobado).toBe(false);
    expect(estado.lecciones).toEqual({});
  });

  it('el desafío legendario se supera con un error como máximo', () => {
    const e = { ...base(), lecciones: { [L0.id]: { coronas: 3, completadas: 3, mejorPrecision: 90 } } };
    const ok = aplicarSesion(e, resultado({ tipo: 'legendario', leccionId: L0.id }, { errores: 1 }), T0);
    expect(ok.estado.lecciones[L0.id].legendaria).toBe(true);
    expect(estadoNodo(LECCIONES, ok.estado.lecciones, 0)).toBe('legendario');
    const mal = aplicarSesion(e, resultado({ tipo: 'legendario', leccionId: L0.id }, { errores: 2 }), T0);
    expect(mal.estado.lecciones[L0.id].legendaria).toBeUndefined();
    expect(armarLegendario(L0, semilla(5)).at(-1)!.dificultad).toBe(3);
  });

  it('el examen se aprueba con 60% y queda en el historial', () => {
    const preguntas = armarExamen([1, 2], 20, semilla(6));
    expect(preguntas).toHaveLength(20);
    const r = resultado({ tipo: 'examen', unidades: [1, 2], cantidad: 20 }, { total: 20, aciertosPrimerIntento: 14 });
    const { estado, efectos } = aplicarSesion(base(), r, T0);
    expect(efectos.aprobado).toBe(true);
    expect(estado.examenes).toHaveLength(1);
    expect(estado.contadores.examenesAprobados).toBe(1);
  });
});

describe('cofres, tienda y semana', () => {
  it('el cofre se abre después de la lección indicada y solo una vez', () => {
    const e = base();
    expect(cofreDisponible(e, 1)).toBe(false);
    const listo = { ...e, lecciones: { 'u1-l2': { coronas: 1, completadas: 1, mejorPrecision: 80 } } };
    expect(cofreDisponible(listo, 1)).toBe(true);
    const { estado, gemas } = abrirCofre(listo, 1, T0, semilla(7));
    expect(gemas).toBeGreaterThanOrEqual(20);
    expect(gemas).toBeLessThanOrEqual(40);
    expect(estado.gemas).toBe(gemas + logroPorId('cofre')!.gemas + logroPorId('primera-leccion')!.gemas);
    expect(cofreDisponible(estado, 1)).toBe(false);
  });

  it('la tienda cobra gemas y respeta los límites', () => {
    const conGemas = { ...base(), gemas: 100, vidas: { actuales: 1, desde: T0 } };
    const recarga = comprar(conGemas, { tipo: 'recarga-vidas' }, T0);
    expect(recarga.estado.vidas.actuales).toBe(VIDAS_MAX);
    expect(recarga.estado.gemas).toBe(100 - PRECIO_RECARGA_VIDAS);
    expect(comprar(recarga.estado, { tipo: 'recarga-vidas' }, T0).error).toBeDefined();
    const gorro = comprar(conGemas, { tipo: 'gorro', gorro: 'azul' }, T0);
    expect(gorro.estado.tienda).toMatchObject({ gorro: 'azul', gorros: ['amarillo', 'azul'] });
    expect(comprar(base(), { tipo: 'protector' }, T0).error).toContain('faltan');
  });

  it('compara la XP de esta semana con la anterior', () => {
    expect(lunesDe('2026-10-01')).toBe('2026-09-28');
    const xp = { '2026-09-21': 10, '2026-09-27': 15, '2026-09-28': 20, '2026-10-01': 5, '2026-09-20': 99 };
    expect(xpSemanal(xp, '2026-10-01')).toEqual({ estaSemana: 25, semanaPasada: 25 });
  });
});
