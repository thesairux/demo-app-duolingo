// Quién lee la foto del cuaderno. Dentro de la demo publicada en claude.ai, Claude con la cuenta de quien la abre;
// en la app instalada, el corrector del servidor (netlify/functions/corregir.mts) si está publicado. Si no hay
// ninguno, la pantalla ofrece revisar sin foto.
import { promptLectura, validarLectura, type EjercicioALeer, type LecturaHoja } from './cuaderno';

/** Por qué no se pudo leer una foto. 'sin-permiso' no cambia en esta visita: se pasa a revisar sin foto. */
export type MotivoFallo = 'sin-permiso' | 'ocupado' | 'foto' | 'cancelado' | 'fallo';

export class FalloCorrector extends Error {
  constructor(readonly motivo: MotivoFallo) {
    super(motivo);
  }
}

export interface Corrector {
  leer(foto: Blob, ejercicios: EjercicioALeer[], signal: AbortSignal): Promise<LecturaHoja>;
}

// La parte del visor de claude.ai que usamos. La definición completa la entrega la plataforma.
interface ErrorSample {
  code: string;
}
interface Sample {
  json(input: string, opciones: { images: Blob; cache: false; signal: AbortSignal }): Promise<unknown>;
  limits(): Promise<{ images?: { mediaTypes: string[] } }>;
}
declare global {
  interface Window {
    claude?: { use(nombre: 'sample'): Promise<Sample | null> };
  }
}

const SIN_PERMISO = new Set(['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed', 'images_unavailable']);

function motivoSample(codigo: string): MotivoFallo {
  if (SIN_PERMISO.has(codigo)) return 'sin-permiso';
  if (codigo === 'rate_limited') return 'ocupado';
  if (codigo === 'image_rejected') return 'foto';
  if (codigo === 'cancelled') return 'cancelado';
  return 'fallo';
}

async function correctorClaude(): Promise<Corrector | null> {
  const sample = await window.claude?.use('sample').catch(() => null);
  if (!sample) return null;
  const limites = await sample.limits().catch(() => null);
  if (!limites?.images) return null;
  return {
    async leer(foto, ejercicios, signal) {
      try {
        // cache: false, porque una foto nueva del mismo cuaderno tiene que leerse de nuevo.
        const lectura = validarLectura(await sample.json(promptLectura(ejercicios), { images: foto, cache: false, signal }), ejercicios);
        if (!lectura) throw new FalloCorrector('fallo');
        return lectura;
      } catch (e) {
        if (e instanceof FalloCorrector) throw e;
        throw new FalloCorrector(motivoSample((e as ErrorSample)?.code ?? ''));
      }
    },
  };
}

/** Dirección del corrector del servidor. Se puede cambiar al compilar con VITE_CORRECTOR_URL. */
const URL_SERVIDOR: string = import.meta.env.VITE_CORRECTOR_URL || '/api/corregir';

async function aBase64(foto: Blob): Promise<string> {
  const bytes = new Uint8Array(await foto.arrayBuffer());
  let binario = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binario);
}

async function correctorServidor(): Promise<Corrector | null> {
  // El corrector responde {"corrector": true} a un GET. Así no se confunde con una página cualquiera que devuelva 200.
  try {
    const r = await fetch(URL_SERVIDOR, { headers: { accept: 'application/json' } });
    if (!r.ok || !(await r.json())?.corrector) return null;
  } catch {
    return null;
  }
  return {
    async leer(foto, ejercicios, signal) {
      let r: Response;
      try {
        r = await fetch(URL_SERVIDOR, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ imagen: await aBase64(foto), tipo: foto.type, ejercicios }),
          signal,
        });
      } catch {
        throw new FalloCorrector(signal.aborted ? 'cancelado' : 'fallo');
      }
      if (r.status === 429) throw new FalloCorrector('ocupado');
      if (r.status === 400 || r.status === 413) throw new FalloCorrector('foto');
      if (!r.ok) throw new FalloCorrector('fallo');
      const lectura = validarLectura(await r.json().catch(() => null), ejercicios);
      if (!lectura) throw new FalloCorrector('fallo');
      return lectura;
    },
  };
}

let buscado: Promise<Corrector | null> | null = null;

/** Busca un corrector una sola vez por visita: primero Claude en el visor de claude.ai, después el servidor. */
export function buscarCorrector(): Promise<Corrector | null> {
  buscado ??= correctorClaude().then((c) => c ?? correctorServidor());
  return buscado;
}

/** Achica la foto a 1.600 px por lado como máximo, en JPEG. Una foto de celular pesa varios MB y no hace falta tanto. */
export async function prepararFoto(archivo: File): Promise<Blob> {
  try {
    const imagen = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
    const escala = Math.min(1, 1600 / Math.max(imagen.width, imagen.height));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(imagen.width * escala);
    lienzo.height = Math.round(imagen.height * escala);
    lienzo.getContext('2d')!.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    imagen.close();
    const jpeg = await new Promise<Blob | null>((listo) => lienzo.toBlob(listo, 'image/jpeg', 0.85));
    return jpeg ?? archivo;
  } catch {
    // Si el navegador no puede abrirla (por ejemplo, HEIC en algunos equipos), se manda tal cual.
    return archivo;
  }
}
