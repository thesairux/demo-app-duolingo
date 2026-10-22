// Guarda el estado en localStorage. Si el navegador lo bloquea, la app sigue funcionando sin guardar.
import { estadoInicial, type EstadoJuego } from './estado';
import { claveDia } from './fechas';
import type { FichaEjercicio } from './repaso';

export const CLAVE_ALMACEN = 'numi-mates:estado';

export function cargarEstado(ahora: number): EstadoJuego {
  const base = estadoInicial(ahora);
  try {
    const crudo = localStorage.getItem(CLAVE_ALMACEN);
    if (!crudo) return base;
    const leido = JSON.parse(crudo) as Partial<EstadoJuego>;
    const version = (leido as { version?: number }).version;
    if (version !== 1 && version !== 2) return base;
    // Mezcla con los valores por defecto por si faltan campos de versiones anteriores.
    const hoy = claveDia(new Date(ahora));
    const ejercicios = Object.fromEntries(
      Object.entries(leido.ejercicios ?? {}).map(([id, f]): [string, FichaEjercicio] => [
        id,
        { aciertos: 0, fallos: 0, ultimo: 0, caja: 0, proxima: hoy, ...(f as Partial<FichaEjercicio>) },
      ]),
    );
    return {
      ...base,
      ...leido,
      ejercicios,
      vidas: { ...base.vidas, ...leido.vidas },
      racha: { ...base.racha, ...leido.racha },
      contadores: { ...base.contadores, ...leido.contadores },
      tienda: {
        ...base.tienda,
        ...leido.tienda,
        atuendo: { ...base.tienda.atuendo, ...leido.tienda?.atuendo },
        accesorios: [...new Set([...base.tienda.accesorios, ...(leido.tienda?.accesorios ?? [])])],
      },
      // Al pasar de la versión 1, el sonido vuelve a quedar activado.
      ajustes: { ...base.ajustes, ...leido.ajustes, ...(version === 1 ? { sonido: true } : {}) },
      version: 2,
    };
  } catch {
    return base;
  }
}

export function guardarEstado(estado: EstadoJuego): void {
  try {
    localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(estado));
  } catch {
    // Almacenamiento lleno o bloqueado: se sigue sin guardar.
  }
}

export function borrarEstado(): void {
  try {
    localStorage.removeItem(CLAVE_ALMACEN);
  } catch {
    // Nada que hacer.
  }
}
