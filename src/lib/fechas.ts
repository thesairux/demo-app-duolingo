// Fechas como claves de día local ("2026-10-01"), para rachas y XP diaria.

export function claveDia(fecha: Date = new Date()): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function aUTC(clave: string): number {
  const [y, m, d] = clave.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Días calendario desde `desde` hasta `hasta` (positivo si `hasta` es posterior). */
export function diasEntre(desde: string, hasta: string): number {
  return Math.round((aUTC(hasta) - aUTC(desde)) / 86_400_000);
}

export function sumarDias(clave: string, dias: number): string {
  const fecha = new Date(aUTC(clave) + dias * 86_400_000);
  return claveDia(new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
}

/** "4:05" a partir de segundos. */
export function formatoMinutos(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
