import { afterEach, describe, expect, it, vi } from 'vitest';
import { cargarEstado, CLAVE_ALMACEN } from './almacen';
import { estadoInicial } from './estado';

const T0 = new Date(2026, 9, 1, 10, 0, 0).getTime();

/** Simula un localStorage con un estado ya guardado. */
function guardado(datos: unknown) {
  const mapa = new Map([[CLAVE_ALMACEN, JSON.stringify(datos)]]);
  vi.stubGlobal('localStorage', { getItem: (k: string) => mapa.get(k) ?? null, setItem: () => {}, removeItem: () => {} });
}

afterEach(() => vi.unstubAllGlobals());

describe('almacén', () => {
  it('el sonido parte activado', () => {
    expect(estadoInicial(T0).ajustes.sonido).toBe(true);
  });

  it('al pasar de la versión 1 vuelve a activar el sonido, sin perder el progreso', () => {
    guardado({ ...estadoInicial(T0), version: 1, gemas: 42, ajustes: { sonido: false, animaciones: false } });
    const e = cargarEstado(T0);
    expect(e.version).toBe(2);
    expect(e.gemas).toBe(42);
    expect(e.ajustes).toEqual({ sonido: true, animaciones: false });
  });

  it('en la versión 2 respeta el sonido apagado', () => {
    guardado({ ...estadoInicial(T0), ajustes: { sonido: false, animaciones: true } });
    expect(cargarEstado(T0).ajustes.sonido).toBe(false);
  });
});
