// Sonidos cortos sintetizados con Web Audio: no hay archivos de audio que descargar.

export type Sonido = 'acierto' | 'error' | 'fin' | 'fallo' | 'logro' | 'moneda';

interface Nota {
  /** Frecuencia en Hz. */
  f: number;
  /** Inicio, en segundos desde que parte el sonido. */
  t: number;
  /** Duración en segundos. */
  d: number;
}

interface Receta {
  onda: OscillatorType;
  volumen: number;
  notas: Nota[];
}

// Notas (Hz) usadas abajo.
const DO5 = 523.25, MI5 = 659.25, SOL5 = 783.99, LA5 = 880, SI5 = 987.77, DO6 = 1046.5, RE6 = 1174.66, MI6 = 1318.51, SOL6 = 1567.98;
const DO4 = 261.63, MI4 = 329.63, SOL3 = 196, MIB3 = 155.56;

const RECETAS: Record<Sonido, Receta> = {
  // Dos notas que suben, rápidas y brillantes.
  acierto: { onda: 'triangle', volumen: 0.22, notas: [{ f: MI5, t: 0, d: 0.09 }, { f: LA5, t: 0.08, d: 0.16 }] },
  // Dos notas graves que bajan, suaves para no asustar.
  error: { onda: 'triangle', volumen: 0.2, notas: [{ f: SOL3, t: 0, d: 0.13 }, { f: MIB3, t: 0.12, d: 0.22 }] },
  // Arpegio de fin de lección.
  fin: {
    onda: 'triangle',
    volumen: 0.2,
    notas: [{ f: DO5, t: 0, d: 0.12 }, { f: MI5, t: 0.11, d: 0.12 }, { f: SOL5, t: 0.22, d: 0.12 }, { f: DO6, t: 0.33, d: 0.4 }, { f: MI6, t: 0.33, d: 0.4 }],
  },
  // Sesión no aprobada: baja con calma.
  fallo: { onda: 'triangle', volumen: 0.18, notas: [{ f: MI4, t: 0, d: 0.18 }, { f: DO4, t: 0.17, d: 0.34 }] },
  // Logro nuevo: destellos agudos.
  logro: { onda: 'sine', volumen: 0.2, notas: [{ f: SOL5, t: 0, d: 0.08 }, { f: SI5, t: 0.07, d: 0.08 }, { f: RE6, t: 0.14, d: 0.08 }, { f: SOL6, t: 0.21, d: 0.3 }] },
  // Gemas: cofre o compra.
  moneda: { onda: 'square', volumen: 0.07, notas: [{ f: SI5, t: 0, d: 0.07 }, { f: MI6, t: 0.07, d: 0.28 }] },
};

let contexto: AudioContext | null = null;

function obtenerContexto(): AudioContext | null {
  if (contexto) return contexto;
  const Clase = typeof window === 'undefined' ? undefined : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  if (!Clase) return null;
  contexto = new Clase();
  return contexto;
}

/** Reproduce un sonido. Si el navegador no tiene Web Audio, no hace nada. */
export function reproducir(sonido: Sonido): void {
  const ctx = obtenerContexto();
  if (!ctx) return;
  // Los navegadores suspenden el audio hasta que la persona toca algo; los sonidos siempre parten de un toque.
  if (ctx.state === 'suspended') void ctx.resume();
  const { onda, volumen, notas } = RECETAS[sonido];
  const inicio = ctx.currentTime + 0.01;
  for (const { f, t, d } of notas) {
    const osc = ctx.createOscillator();
    const gan = ctx.createGain();
    osc.type = onda;
    osc.frequency.value = f;
    // Ataque corto y caída exponencial: evita clics y suena más amable.
    gan.gain.setValueAtTime(0.0001, inicio + t);
    gan.gain.exponentialRampToValueAtTime(volumen, inicio + t + 0.015);
    gan.gain.exponentialRampToValueAtTime(0.0001, inicio + t + d);
    osc.connect(gan).connect(ctx.destination);
    osc.start(inicio + t);
    osc.stop(inicio + t + d + 0.02);
  }
}
