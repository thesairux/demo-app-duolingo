// Instalación como app (PWA). Guarda el aviso del navegador para mostrar un botón "Instalar" en Ajustes.

interface EventoInstalar extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * instalada: ya se abre como app.
 * disponible: el navegador permite instalarla con un botón.
 * ios: Safari no tiene botón; se instala desde Compartir.
 * manual: el navegador no avisó (o ya se descartó); se instala desde su menú.
 * embebida: la app está dentro de otra página (por ejemplo, un enlace compartido), donde no se puede instalar.
 */
export type EstadoInstalacion = 'instalada' | 'disponible' | 'ios' | 'manual' | 'embebida';

let aviso: EventoInstalar | null = null;
let instalada = false;
const oyentes = new Set<() => void>();
const notificar = () => oyentes.forEach((f) => f());

/** Se llama una vez al partir, antes de que el navegador dispare el aviso. */
export function escucharInstalacion(): void {
  instalada = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    aviso = e as EventoInstalar;
    notificar();
  });
  window.addEventListener('appinstalled', () => {
    instalada = true;
    aviso = null;
    notificar();
  });
}

function esIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}

function embebida(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function estadoInstalacion(): EstadoInstalacion {
  if (instalada) return 'instalada';
  if (embebida()) return 'embebida';
  if (aviso) return 'disponible';
  return esIOS() ? 'ios' : 'manual';
}

export function suscribirInstalacion(f: () => void): () => void {
  oyentes.add(f);
  return () => oyentes.delete(f);
}

/** Abre el diálogo del navegador. Devuelve true si la persona aceptó. */
export async function instalar(): Promise<boolean> {
  if (!aviso) return false;
  const evento = aviso;
  aviso = null;
  await evento.prompt();
  const { outcome } = await evento.userChoice;
  notificar();
  return outcome === 'accepted';
}
