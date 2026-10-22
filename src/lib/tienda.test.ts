import { describe, expect, it } from 'vitest';
import { LECCIONES } from '../content';
import { semilla } from './azar';
import { aplicarSesion, comprar, estadoInicial, quitarAccesorio, usarComodin, type EstadoJuego, type ResultadoSesion } from './estado';
import { claveDia } from './fechas';
import { armarSesion } from './sesion';
import { ACCESORIOS, COMODINES_INICIALES, MAX_COMODINES, MINUTOS_DOBLE_XP, opcionesAEsconder, PRECIO_UNA_VIDA } from './tienda';
import { VIDAS_MAX } from './vidas';
import { resumirXP } from './xp';

const T0 = new Date(2026, 9, 1, 10, 0, 0).getTime();
const L0 = LECCIONES[0].leccion;

function base(gemas = 500): EstadoJuego {
  return { ...estadoInicial(T0), gemas, perfil: { apodo: '', metaDiaria: 50, creado: claveDia(new Date(T0)) } };
}

function leccion(parcial: Partial<ResultadoSesion> = {}): ResultadoSesion {
  return {
    modo: { tipo: 'leccion', leccionId: L0.id },
    completada: true,
    xp: resumirXP({ ejercicios: 10, combo: 0, leccion: 5, perfecta: 5, rapida: 0 }),
    total: 10,
    aciertosPrimerIntento: 10,
    aciertos: 10,
    respuestas: 10,
    errores: 0,
    segundos: 300,
    porEjercicio: {},
    casosCorrectos: 0,
    ...parcial,
  };
}

describe('ayudas de la tienda', () => {
  it('se parte con comodines de regalo; se compran de a 3 hasta un máximo', () => {
    const e = base();
    expect(e.tienda.comodines).toBe(COMODINES_INICIALES);
    let actual = e;
    while (actual.tienda.comodines + 3 <= MAX_COMODINES) actual = comprar(actual, { tipo: 'comodines' }, T0).estado;
    expect(actual.tienda.comodines).toBe(MAX_COMODINES);
    expect(comprar(actual, { tipo: 'comodines' }, T0).error).toContain('hasta');
  });

  it('usar un comodín resta uno y no funciona sin comodines', () => {
    const uno = usarComodin(base());
    expect(uno.ok).toBe(true);
    expect(uno.estado.tienda.comodines).toBe(COMODINES_INICIALES - 1);
    const vacio = { ...base(), tienda: { ...base().tienda, comodines: 0 } };
    expect(usarComodin(vacio).ok).toBe(false);
  });

  it('el 50/50 esconde dos alternativas incorrectas distintas', () => {
    for (let s = 0; s < 20; s++) {
      const ocultas = opcionesAEsconder(4, 2, 2, semilla(s));
      expect(ocultas).toHaveLength(2);
      expect(new Set(ocultas).size).toBe(2);
      expect(ocultas).not.toContain(2);
    }
  });

  it('una vida suma una, y no se vende con las vidas llenas', () => {
    expect(comprar(base(), { tipo: 'una-vida' }, T0).error).toBeDefined();
    const conDos = { ...base(), vidas: { actuales: 2, desde: T0 } };
    const r = comprar(conDos, { tipo: 'una-vida' }, T0);
    expect(r.estado.vidas.actuales).toBe(3);
    expect(r.estado.gemas).toBe(conDos.gemas - PRECIO_UNA_VIDA);
    const casiLlenas = { ...base(), vidas: { actuales: VIDAS_MAX - 1, desde: T0 } };
    expect(comprar(casiLlenas, { tipo: 'una-vida' }, T0).estado.vidas.actuales).toBe(VIDAS_MAX);
  });

  it('el Doble XP dura 15 minutos y duplica la XP de las sesiones', () => {
    const { estado } = comprar(base(), { tipo: 'doble-xp' }, T0);
    expect(estado.tienda.dobleXPHasta).toBe(T0 + MINUTOS_DOBLE_XP * 60_000);
    expect(comprar(estado, { tipo: 'doble-xp' }, T0).error).toContain('activo');
    const r = leccion();
    const durante = aplicarSesion(estado, r, T0 + 5 * 60_000);
    expect(durante.efectos.xpDoble).toBe(r.xp.total);
    expect(durante.estado.xpTotal).toBe(r.xp.total * 2);
    const despues = aplicarSesion(estado, r, T0 + 20 * 60_000);
    expect(despues.efectos.xpDoble).toBe(0);
    expect(despues.estado.xpTotal).toBe(r.xp.total);
  });

  it('cada lección terminada da gemas, y más si fue sin errores', () => {
    const motivos = (r: ResultadoSesion) => aplicarSesion(base(0), r, T0).efectos.gemas.map((g) => g.motivo);
    expect(motivos(leccion())).toEqual(expect.arrayContaining(['Lección completada', 'Lección sin errores']));
    expect(motivos(leccion({ errores: 2 }))).not.toContain('Lección sin errores');
    expect(motivos(leccion({ completada: false }))).not.toContain('Lección completada');
  });
});

describe('ropa de Numi', () => {
  it('comprar un accesorio lo pone; si ya lo tiene, solo lo pone sin cobrar', () => {
    const compra = comprar(base(), { tipo: 'accesorio', id: 'lentes' }, T0);
    expect(compra.estado.tienda.atuendo.cara).toBe('lentes');
    expect(compra.estado.gemas).toBe(500 - ACCESORIOS.lentes.precio);
    const sol = comprar(compra.estado, { tipo: 'accesorio', id: 'lentes-sol' }, T0).estado;
    expect(sol.tienda.atuendo.cara).toBe('lentes-sol');
    const otraVez = comprar(sol, { tipo: 'accesorio', id: 'lentes' }, T0).estado;
    expect(otraVez.tienda.atuendo.cara).toBe('lentes');
    expect(otraVez.gemas).toBe(sol.gemas);
  });

  it('se puede quitar lo puesto, menos el libro', () => {
    const conCorbata = comprar(base(), { tipo: 'accesorio', id: 'corbata' }, T0).estado;
    expect(quitarAccesorio(conCorbata, 'cuello').tienda.atuendo.cuello).toBeNull();
    expect(quitarAccesorio(conCorbata, 'libro').tienda.atuendo.libro).toBe('libro-azul');
  });

  it('con la primera lección ya alcanza para algo de ropa', () => {
    const { estado } = aplicarSesion(base(0), leccion({ errores: 1 }), T0);
    const masBarato = Math.min(...Object.values(ACCESORIOS).map((a) => a.precio).filter((p) => p > 0));
    expect(estado.gemas).toBeGreaterThanOrEqual(masBarato);
  });

  it('sin gemas no se compra', () => {
    expect(comprar(base(10), { tipo: 'accesorio', id: 'chaleco' }, T0).error).toContain('faltan');
  });
});

describe('dificultad suave', () => {
  it('el primer nivel de cada lección parte por lo más fácil', () => {
    for (const { leccion: l } of LECCIONES) {
      const sesion = armarSesion(l, 0, semilla(3));
      const faciles = l.ejercicios.filter((e) => e.dificultad === 1).length;
      expect(sesion.filter((e) => e.dificultad === 1).length).toBe(Math.min(faciles, sesion.length));
      expect(sesion.some((e) => e.dificultad === 3) && faciles + l.ejercicios.filter((e) => e.dificultad === 2).length >= sesion.length).toBe(false);
    }
  });
});
