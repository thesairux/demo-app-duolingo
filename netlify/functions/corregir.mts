// Corrector del cuaderno para la app publicada en Netlify: recibe la foto, le pide a Claude que lea las respuestas
// y devuelve lo leído. La corrección la hace la app (src/lib/cuaderno.ts), no Claude.
// Necesita la variable de entorno ANTHROPIC_API_KEY en Netlify.
import Anthropic from '@anthropic-ai/sdk';
import { ejerciciosValidos, ESQUEMA_LECTURA, promptLectura, validarLectura } from '../../src/lib/cuaderno';

const client = new Anthropic();
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'] as const;
/** Unos 4,5 MB de imagen. La app achica las fotos a 1.600 px, así que normalmente pesan mucho menos. */
const MAX_BASE64 = 6_000_000;

const json = (cuerpo: unknown, status = 200) => Response.json(cuerpo, { status });

export default async (req: Request): Promise<Response> => {
  // La app pregunta con un GET si el corrector existe antes de ofrecer la foto.
  if (req.method === 'GET') return json({ corrector: true });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  const cuerpo = (await req.json().catch(() => null)) as { imagen?: unknown; tipo?: unknown; ejercicios?: unknown } | null;
  const tipo = TIPOS.find((t) => t === cuerpo?.tipo);
  const imagen = cuerpo?.imagen;
  if (!tipo || typeof imagen !== 'string' || !imagen || !ejerciciosValidos(cuerpo?.ejercicios)) return json({ error: 'Pedido inválido' }, 400);
  if (imagen.length > MAX_BASE64) return json({ error: 'La foto es muy grande' }, 413);
  const ejercicios = cuerpo.ejercicios;

  try {
    const respuesta = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      // Si los filtros de seguridad rechazan el pedido, la API lo reintenta sola con el modelo que corresponda.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: ESQUEMA_LECTURA } },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: tipo, data: imagen } },
            { type: 'text', text: promptLectura(ejercicios) },
          ],
        },
      ],
    });
    if (respuesta.stop_reason === 'refusal') return json({ error: 'No se pudo leer la foto' }, 422);
    const texto = respuesta.content.find((b) => b.type === 'text')?.text ?? '';
    let valor: unknown = null;
    try {
      valor = JSON.parse(texto);
    } catch {
      // Queda en null y se responde como lectura inválida.
    }
    const lectura = validarLectura(valor, ejercicios);
    return lectura ? json(lectura) : json({ error: 'Lectura inválida' }, 502);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: 'Demasiadas revisiones, intenta en unos minutos' }, 429);
    if (error instanceof Anthropic.BadRequestError) return json({ error: 'La foto no sirvió' }, 400);
    if (error instanceof Anthropic.APIError) return json({ error: 'El corrector no respondió' }, 502);
    throw error;
  }
};

export const config = { path: '/api/corregir' };
