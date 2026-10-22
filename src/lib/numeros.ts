// Cómo se escriben los números en Chile: punto para los miles y coma para los decimales.

/** 1012 → "1.012". */
export function formatoNumero(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Cifras decimales de un número: 0.25 → 2. */
export function decimales(n: number): number {
  const texto = String(n);
  return texto.includes('.') ? texto.length - texto.indexOf('.') - 1 : 0;
}

/** Escribe un valor con tantos decimales como `paso`: (0.7, 0.1) → "0,7"; (4300, 100) → "4.300". */
export function formatoValor(valor: number, paso = 1): string {
  const d = decimales(paso);
  if (d === 0) return formatoNumero(Math.round(valor));
  const [entero, fraccion] = valor.toFixed(d).split('.');
  return `${formatoNumero(Number(entero))},${fraccion}`;
}
