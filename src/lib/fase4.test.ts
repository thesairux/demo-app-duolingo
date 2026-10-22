import { describe, expect, it } from 'vitest';
import { GLOSARIO } from '../content';
import type { TerminoGlosario } from '../content/types';
import { marcarTerminos } from './glosario';
import { REGLAS } from './sesion';

const termino = (t: string, alias?: string[]): TerminoGlosario => ({ termino: t, alias, definicion: `def ${t}`, unidad: 1, revisar: false });
const PRUEBA = [
  termino('Unidad de mil', ['UM']),
  termino('Eje de simetría', ['simetría']),
  termino('Fracción'),
  termino('Número decimal', ['decimal', 'decimales']),
];
const marcados = (texto: string, glosario = PRUEBA) =>
  marcarTerminos(texto, glosario)
    .filter((t) => t.termino)
    .map((t) => `${t.texto}→${t.termino!.termino}`);

describe('glosario', () => {
  it('marca solo la primera aparición de cada término y conserva el texto completo', () => {
    const texto = 'La fracción tiene dos partes. Sin fracción no hay numerador.';
    const trozos = marcarTerminos(texto, PRUEBA);
    expect(trozos.map((t) => t.texto).join('')).toBe(texto);
    expect(marcados(texto)).toEqual(['fracción→Fracción']);
  });

  it('prefiere la forma más larga y reconoce alias', () => {
    expect(marcados('Dibujó el eje de simetría.')).toEqual(['eje de simetría→Eje de simetría']);
    expect(marcados('Escribe los decimales.')).toEqual(['decimales→Número decimal']);
  });

  it('no marca pedazos de otras palabras', () => {
    expect(marcados('Las simetrías del dibujo')).toEqual([]);
  });

  it('las siglas solo cuentan en mayúsculas', () => {
    expect(marcados('Según la tabla, el 4 está en la UM.')).toEqual(['UM→Unidad de mil']);
    expect(marcados('lo dice la um')).toEqual([]);
  });

  it('funciona con el glosario real del banco', () => {
    expect(GLOSARIO.length).toBeGreaterThan(15);
    expect(marcados('En 3/4, el numerador es 3 y el denominador es 4. Son las 8:00 AM y medimos el perímetro.', GLOSARIO)).toEqual([
      'numerador→Numerador',
      'denominador→Denominador',
      'AM→AM',
      'perímetro→Perímetro',
    ]);
    expect(marcados('Las unidades de mil y las centenas.', GLOSARIO)).toEqual(['unidades de mil→Unidad de mil', 'centenas→Centena']);
    expect(marcados('Comí una pizza a las 3 am.', GLOSARIO)).toEqual([]);
  });

  it('se apaga en las pruebas (examen, checkpoint y legendario) para no dar la respuesta', () => {
    expect(REGLAS.leccion.ayudas).toBe(true);
    expect(REGLAS.practica.ayudas).toBe(true);
    expect(REGLAS.examen.ayudas).toBe(false);
    expect(REGLAS.checkpoint.ayudas).toBe(false);
    expect(REGLAS.legendario.ayudas).toBe(false);
  });
});
