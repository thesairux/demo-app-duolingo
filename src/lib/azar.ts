export type Aleatorio = () => number;

/** Copia mezclada (Fisher-Yates). Acepta un generador para poder probarla. */
export function mezclar<T>(lista: readonly T[], aleatorio: Aleatorio = Math.random): T[] {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function elegir<T>(lista: readonly T[], aleatorio: Aleatorio = Math.random): T {
  return lista[Math.floor(aleatorio() * lista.length)];
}

/** Generador determinista para pruebas. */
export function semilla(valor: number): Aleatorio {
  let s = valor >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
