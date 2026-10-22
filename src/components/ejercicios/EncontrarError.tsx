// Identificar el error: la afirmación viene en partes y se toca la equivocada.
import { useState } from 'react';
import type { IdentificarError } from '../../content/types';
import { TextoGlosario } from '../TextoGlosario';
import { CLASE_PREGUNTA, claseVeredicto, type PropsEjercicio } from './comun';

export function EncontrarError({ ej, bloqueado, veredicto, onRespuesta }: PropsEjercicio<IdentificarError>) {
  const [elegido, setElegido] = useState<number | null>(null);
  return (
    <div className="grid gap-4">
      <p className={CLASE_PREGUNTA}>
        <TextoGlosario texto={ej.enunciado} />
      </p>
      <p className="font-display text-[19px] leading-[1.9]">
        {ej.segmentos.map((s, i) => (
          <button
            key={i}
            type="button"
            disabled={bloqueado}
            aria-pressed={elegido === i}
            onClick={() => {
              setElegido(i);
              onRespuesta({ tipo: 'segmento', indice: i });
            }}
            className={`opcion mx-0.5 my-1 rounded-xl px-2 py-0.5 text-left ${claseVeredicto(elegido === i, veredicto)}`}
            style={{ boxShadow: 'none' }}
          >
            {s.trim()}
          </button>
        ))}
      </p>
    </div>
  );
}
