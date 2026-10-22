import { describe, expect, it } from 'vitest';
import { semilla } from './azar';
import {
  armarHoja,
  EJERCICIOS_POR_HOJA,
  revisarEjercicio,
  revisarHoja,
  TEMAS_CUADERNO,
  textoSolucion,
  unirCasillas,
  xpRevision,
  type EjercicioCuaderno,
  type TemaCuaderno,
} from './cuaderno';
import { aplicarActividad, estadoInicial, type EstadoJuego } from './estado';
import { formatoNumero, formatoValor } from './numeros';
import { claveDia } from './fechas';
import { logroPorId } from './logros';

const T0 = new Date(2026, 9, 1, 10, 0, 0).getTime();
const TEMAS = Object.keys(TEMAS_CUADERNO) as TemaCuaderno[];

/** Resuelve el enunciado por su cuenta, sin mirar la solución guardada. */
function resolver(enunciado: string): string {
  const sinPuntos = enunciado.replace(/(\d)\.(\d{3})/g, '$1$2').replace(' =', '');
  const frac = sinPuntos.match(/^(\d+)\/(\d+) ([+−]) (\d+)\/(\d+)$/);
  if (frac) {
    const [, a, d, op, b, d2] = frac;
    expect(d).toBe(d2);
    return `${op === '+' ? Number(a) + Number(b) : Number(a) - Number(b)}/${d}`;
  }
  const [x, op, y] = sinPuntos.split(' ');
  const [a, b] = [Number(x), Number(y)];
  if (op === '+') return formatoNumero(a + b);
  if (op === '−') return formatoNumero(a - b);
  if (op === '×') return formatoNumero(a * b);
  const q = Math.floor(a / b);
  return a % b ? `${q} y sobran ${a % b}` : String(q);
}

describe('hojas del cuaderno', () => {
  it('cada tema arma 4 ejercicios distintos, de 4° básico y con la solución correcta', () => {
    for (let s = 1; s <= 300; s++) {
      for (const tema of TEMAS) {
        const hoja = armarHoja(tema, semilla(s));
        expect(hoja.ejercicios).toHaveLength(EJERCICIOS_POR_HOJA);
        expect(new Set(hoja.ejercicios.map((e) => e.enunciado)).size).toBe(EJERCICIOS_POR_HOJA);
        for (const e of hoja.ejercicios) {
          expect(textoSolucion(e.solucion)).toBe(resolver(e.enunciado));
          const sol = e.solucion;
          if (sol.tipo === 'entero') expect(sol.valor).toBeGreaterThan(0);
          if (sol.tipo === 'entero') expect(sol.valor).toBeLessThan(10_000);
          if (sol.tipo === 'division') expect(sol.cociente * Number(e.enunciado.split(' ')[2]) + sol.resto).toBeLessThan(100);
          if (sol.tipo === 'fraccion') expect(sol.numerador).toBeLessThan(sol.denominador);
          if (sol.tipo === 'fraccion') expect(sol.numerador).toBeGreaterThan(0);
        }
      }
    }
  });

  it('el desarrollo termina en la respuesta correcta', () => {
    for (let s = 1; s <= 50; s++) {
      for (const tema of TEMAS) {
        for (const e of armarHoja(tema, semilla(s)).ejercicios) {
          const sol = e.solucion;
          const final = sol.tipo === 'division' ? (sol.resto ? `sobran ${e.enunciado.split(' ')[0]} − ` : `= ${sol.cociente}.`) : textoSolucion(sol);
          expect(e.desarrollo).toContain(final);
        }
      }
    }
  });

  it('escribe los números como en Chile', () => {
    expect(formatoNumero(623)).toBe('623');
    expect(formatoNumero(1012)).toBe('1.012');
    expect(formatoNumero(8901)).toBe('8.901');
    expect(formatoValor(4300, 100)).toBe('4.300');
    expect(formatoValor(0.7, 0.1)).toBe('0,7');
    expect(formatoValor(0.30000000000000004, 0.1)).toBe('0,3');
    expect(formatoValor(1250.5, 0.5)).toBe('1.250,5');
  });
});

const ej = (enunciado: string, solucion: EjercicioCuaderno['solucion']): EjercicioCuaderno => ({ numero: 1, enunciado, solucion, desarrollo: '' });

describe('revisar lo que escribió', () => {
  const suma = ej('345 + 278 =', { tipo: 'entero', valor: 623 });
  const mult = ej('253 × 4 =', { tipo: 'entero', valor: 1012 });
  const div = ej('59 : 6 =', { tipo: 'division', cociente: 9, resto: 5 });
  const exacta = ej('84 : 7 =', { tipo: 'division', cociente: 12, resto: 0 });
  const frac = ej('3/8 + 2/8 =', { tipo: 'fraccion', numerador: 5, denominador: 8 });
  const estado = (e: EjercicioCuaderno, leido: string | null) => revisarEjercicio(e, leido).estado;

  it('enteros: acepta el punto de los miles y lo escrito después del =', () => {
    expect(estado(suma, '623')).toBe('bien');
    expect(estado(suma, '345 + 278 = 623')).toBe('bien');
    expect(estado(suma, '632')).toBe('mal');
    expect(estado(mult, '1.012')).toBe('bien');
    expect(estado(mult, '1012')).toBe('bien');
    expect(estado(mult, '1 012')).toBe('bien');
    expect(estado(mult, '812')).toBe('mal');
  });

  it('divisiones: revisa el cociente y el resto', () => {
    expect(estado(div, '9 resto 5')).toBe('bien');
    expect(estado(div, '9 y sobran 5')).toBe('bien');
    expect(estado(div, '9 R5')).toBe('bien');
    expect(estado(div, '9 resto 4')).toBe('mal');
    expect(estado(div, '8 resto 11')).toBe('mal');
    const sinResto = revisarEjercicio(div, '9');
    expect(sinResto.estado).toBe('mal');
    expect(sinResto.nota).toContain('sobran 5');
    expect(estado(exacta, '12')).toBe('bien');
    expect(estado(exacta, '12 resto 0')).toBe('bien');
  });

  it('fracciones: acepta la misma fracción o una equivalente', () => {
    expect(estado(frac, '5/8')).toBe('bien');
    expect(estado(frac, '5 / 8')).toBe('bien');
    expect(estado(frac, '10/16')).toBe('bien');
    expect(estado(frac, '5/16')).toBe('mal');
    expect(estado(frac, '6/8')).toBe('mal');
  });

  it('lo vacío o sin números queda en blanco', () => {
    expect(estado(suma, null)).toBe('en-blanco');
    expect(estado(suma, '.')).toBe('en-blanco');
    expect(estado(frac, '5')).toBe('en-blanco');
  });

  it('junta las casillas de cada tipo de ejercicio', () => {
    expect(unirCasillas(suma, ['623'])).toBe('623');
    expect(unirCasillas(suma, [' '])).toBeNull();
    expect(unirCasillas(div, ['9', '5'])).toBe('9 resto 5');
    expect(unirCasillas(div, ['9', ''])).toBe('9');
    expect(unirCasillas(frac, ['5', '8'])).toBe('5/8');
    expect(unirCasillas(frac, ['5', ''])).toBeNull();
  });

  it('la XP premia cada ejercicio bien y la hoja perfecta', () => {
    const hoja = armarHoja('multiplicar', semilla(3));
    const todas = revisarHoja(hoja, hoja.ejercicios.map((e) => [textoSolucion(e.solucion)]));
    expect(todas.every((r) => r.estado === 'bien')).toBe(true);
    expect(xpRevision(todas)).toBe(4 * 2 + 5);
    const dos = revisarHoja(hoja, [[textoSolucion(hoja.ejercicios[0].solucion)], [textoSolucion(hoja.ejercicios[1].solucion)], ['1'], []]);
    expect(dos.map((r) => r.estado)).toEqual(['bien', 'bien', 'mal', 'en-blanco']);
    expect(xpRevision(dos)).toBe(4);
  });

  it('las casillas de divisiones y fracciones se revisan juntas', () => {
    for (const tema of ['dividir', 'fracciones'] as const) {
      const hoja = armarHoja(tema, semilla(5));
      const casillas = hoja.ejercicios.map((e) => {
        const s = e.solucion;
        return s.tipo === 'division' ? [String(s.cociente), s.resto ? String(s.resto) : ''] : s.tipo === 'fraccion' ? [String(s.numerador), String(s.denominador)] : [];
      });
      expect(revisarHoja(hoja, casillas).every((r) => r.estado === 'bien')).toBe(true);
    }
  });
});

describe('XP de las actividades en el juego', () => {
  const base = (): EstadoJuego => ({ ...estadoInicial(T0), perfil: { apodo: '', metaDiaria: 10, creado: claveDia(new Date(T0)) } });

  it('suma XP, extiende la racha y cuenta la hoja una sola vez', () => {
    const primera = aplicarActividad(base(), { xp: 13, practica: true, hojaCuaderno: true }, T0);
    expect(primera.efectos.xpGanada).toBe(13);
    expect(primera.efectos.metaCumplidaHoy).toBe(true);
    expect(primera.efectos.rachaExtendida).toBe(true);
    expect(primera.estado.racha.actual).toBe(1);
    expect(primera.estado.contadores.cuadernos).toBe(1);
    const otraVez = aplicarActividad(primera.estado, { xp: 0, practica: false }, T0);
    expect(otraVez.estado.contadores.cuadernos).toBe(1);
    expect(otraVez.estado.xpTotal).toBe(13);
  });

  it('con 3 hojas se gana el logro Cuaderno estrella', () => {
    let e = base();
    for (let i = 0; i < 3; i++) e = aplicarActividad(e, { xp: 1, practica: true, hojaCuaderno: true }, T0).estado;
    expect(e.logros['cuaderno-3']).toBeDefined();
    expect(logroPorId('cuaderno-3')?.titulo).toBe('Cuaderno estrella');
  });
});
