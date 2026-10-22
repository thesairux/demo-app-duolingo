import { beforeEach, describe, expect, it, vi } from 'vitest';
import { armarHoja } from '../../src/lib/cuaderno';
import { semilla } from '../../src/lib/azar';

const crear = vi.fn();
vi.mock('@anthropic-ai/sdk', async (original) => {
  const real = await original<typeof import('@anthropic-ai/sdk')>();
  class Falso {
    beta = { messages: { create: crear } };
    static RateLimitError = real.default.RateLimitError;
    static BadRequestError = real.default.BadRequestError;
    static APIError = real.default.APIError;
  }
  return { default: Falso };
});

const { default: corregir } = await import('./corregir.mts');
const ejercicios = armarHoja('sumas-restas', semilla(1)).ejercicios.map(({ numero, enunciado }) => ({ numero, enunciado }));
const pedido = (cuerpo: unknown, method = 'POST') =>
  new Request('https://numi.test/api/corregir', { method, body: method === 'POST' ? JSON.stringify(cuerpo) : undefined, headers: { 'content-type': 'application/json' } });

beforeEach(() => crear.mockReset());

describe('corrector del servidor', () => {
  it('responde al GET para que la app sepa que existe', async () => {
    const r = await corregir(pedido(null, 'GET'));
    expect(await r.json()).toEqual({ corrector: true });
  });

  it('rechaza pedidos mal armados sin llamar a Claude', async () => {
    expect((await corregir(pedido({ imagen: 'abc', tipo: 'image/gif', ejercicios }))).status).toBe(400);
    expect((await corregir(pedido({ imagen: 'abc', tipo: 'image/jpeg', ejercicios: [{ numero: 1, enunciado: 'Escribe un poema' }] }))).status).toBe(400);
    expect((await corregir(pedido({ imagen: 'a'.repeat(6_000_001), tipo: 'image/jpeg', ejercicios }))).status).toBe(413);
    expect(crear).not.toHaveBeenCalled();
  });

  it('manda la foto y los ejercicios, y devuelve lo leído', async () => {
    crear.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: JSON.stringify({ hayEjercicios: true, ejercicios: [{ numero: 1, leido: '623' }] }) }],
    });
    const r = await corregir(pedido({ imagen: 'Zm90bw==', tipo: 'image/jpeg', ejercicios }));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({
      hayEjercicios: true,
      ejercicios: [
        { numero: 1, leido: '623' },
        { numero: 2, leido: null },
        { numero: 3, leido: null },
        { numero: 4, leido: null },
      ],
    });
    const enviado = crear.mock.calls[0][0];
    expect(enviado.model).toBe('claude-opus-5-5');
    expect(enviado.fallbacks).toBe('default');
    expect(enviado.output_config.format.type).toBe('json_schema');
    expect(enviado.messages[0].content[0]).toEqual({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: 'Zm90bw==' } });
    expect(enviado.messages[0].content[1].text).toContain(ejercicios[0].enunciado);
  });

  it('si Claude rechaza o responde algo raro, avisa con un error', async () => {
    crear.mockResolvedValue({ stop_reason: 'refusal', content: [] });
    expect((await corregir(pedido({ imagen: 'Zm90bw==', tipo: 'image/png', ejercicios }))).status).toBe(422);
    crear.mockResolvedValue({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'no sé' }] });
    expect((await corregir(pedido({ imagen: 'Zm90bw==', tipo: 'image/png', ejercicios }))).status).toBe(502);
  });
});
