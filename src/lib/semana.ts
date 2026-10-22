// XP por semana (de lunes a domingo) y por día, para el perfil.
import { diasEntre, sumarDias } from './fechas';

/** Lunes de la semana de `dia` (clave local). */
export function lunesDe(dia: string): string {
  const [y, m, d] = dia.split('-').map(Number);
  const diaSemana = (new Date(y, m - 1, d).getDay() + 6) % 7; // lunes = 0
  return sumarDias(dia, -diaSemana);
}

function sumaEntre(xpPorDia: Record<string, number>, desde: string, hasta: string): number {
  return Object.entries(xpPorDia)
    .filter(([dia]) => diasEntre(desde, dia) >= 0 && diasEntre(dia, hasta) >= 0)
    .reduce((total, [, xp]) => total + xp, 0);
}

/** XP de esta semana (hasta hoy) y de la semana pasada completa. */
export function xpSemanal(xpPorDia: Record<string, number>, hoy: string): { estaSemana: number; semanaPasada: number } {
  const lunes = lunesDe(hoy);
  return {
    estaSemana: sumaEntre(xpPorDia, lunes, hoy),
    semanaPasada: sumaEntre(xpPorDia, sumarDias(lunes, -7), sumarDias(lunes, -1)),
  };
}

/** Los últimos `dias` días, del más antiguo a hoy. */
export function ultimosDias(xpPorDia: Record<string, number>, hoy: string, dias = 14): { dia: string; xp: number }[] {
  return Array.from({ length: dias }, (_, i) => {
    const dia = sumarDias(hoy, i - dias + 1);
    return { dia, xp: xpPorDia[dia] ?? 0 };
  });
}

/** Días en que se cumplió una meta de XP. */
export function diasConMeta(xpPorDia: Record<string, number>, meta: number): number {
  return Object.values(xpPorDia).filter((xp) => xp >= meta).length;
}
