// Encuentra términos del glosario dentro de un texto para que se puedan tocar.
import type { TerminoGlosario } from '../content/types';

export type Trozo = { texto: string; termino?: TerminoGlosario };

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Siglas como "CT" o "DT": solo cuentan escritas igual, para no marcar palabras comunes. */
const esSigla = (s: string) => s.length <= 5 && s === s.toUpperCase() && /\p{Lu}/u.test(s);

interface Indice {
  patron: RegExp;
  porForma: Map<string, { termino: TerminoGlosario; forma: string }>;
}

const cache = new WeakMap<TerminoGlosario[], Indice>();

function indice(glosario: TerminoGlosario[]): Indice {
  const guardado = cache.get(glosario);
  if (guardado) return guardado;
  const porForma = new Map<string, { termino: TerminoGlosario; forma: string }>();
  for (const termino of glosario) {
    for (const forma of [termino.termino, ...(termino.alias ?? [])]) {
      const clave = forma.toLowerCase();
      if (!porForma.has(clave)) porForma.set(clave, { termino, forma });
    }
  }
  // Las formas largas primero, para que "Contrato a plazo fijo" gane sobre "plazo fijo".
  const formas = [...porForma.values()].map((v) => v.forma).sort((a, b) => b.length - a.length);
  const patron = new RegExp(`(?<![\\p{L}\\p{N}])(${formas.map(escapar).join('|')})(?![\\p{L}\\p{N}])`, 'giu');
  const nuevo = { patron, porForma };
  cache.set(glosario, nuevo);
  return nuevo;
}

/**
 * Divide el texto en trozos y marca la primera aparición de cada término.
 * Las siglas solo se reconocen en mayúsculas.
 */
export function marcarTerminos(texto: string, glosario: TerminoGlosario[]): Trozo[] {
  if (!texto || glosario.length === 0) return [{ texto }];
  const { patron, porForma } = indice(glosario);
  const trozos: Trozo[] = [];
  const usados = new Set<TerminoGlosario>();
  let desde = 0;
  for (const m of texto.matchAll(patron)) {
    const hallado = porForma.get(m[0].toLowerCase());
    if (!hallado || usados.has(hallado.termino)) continue;
    if (esSigla(hallado.forma) && m[0] !== hallado.forma) continue;
    usados.add(hallado.termino);
    if (m.index > desde) trozos.push({ texto: texto.slice(desde, m.index) });
    trozos.push({ texto: m[0], termino: hallado.termino });
    desde = m.index + m[0].length;
  }
  if (desde < texto.length) trozos.push({ texto: texto.slice(desde) });
  return trozos;
}
