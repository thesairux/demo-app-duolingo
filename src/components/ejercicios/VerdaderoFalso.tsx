// Verdadero o falso, con un segundo paso opcional: elegir la justificación.
import { useState } from 'react';
import type { VerdaderoFalso as VF } from '../../content/types';
import { mezclar } from '../../lib/azar';
import { TextoGlosario } from '../TextoGlosario';
import { CLASE_OPCION, CLASE_PREGUNTA, claseVeredicto, type PropsEjercicio } from './comun';

export function VerdaderoFalso({ ej, bloqueado, veredicto, onRespuesta }: PropsEjercicio<VF>) {
  const [valor, setValor] = useState<boolean | null>(null);
  const [justificacion, setJustificacion] = useState<number | null>(null);
  const [ordenJust] = useState(() => (ej.justificacion ? mezclar(ej.justificacion.opciones.map((_, i) => i)) : []));

  function avisar(v: boolean | null, j: number | null) {
    if (v === null || (ej.justificacion && j === null)) onRespuesta(null);
    else onRespuesta({ tipo: 'vf', valor: v, justificacion: j ?? undefined });
  }

  return (
    <div className="grid gap-4">
      <p className={CLASE_PREGUNTA}>
        <TextoGlosario texto={ej.enunciado} />
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            disabled={bloqueado}
            aria-pressed={valor === v}
            className={`${CLASE_OPCION} py-6 text-center text-[17px] ${claseVeredicto(valor === v, veredicto)}`}
            onClick={() => {
              setValor(v);
              avisar(v, justificacion);
            }}
          >
            {v ? 'Verdadero' : 'Falso'}
          </button>
        ))}
      </div>
      {ej.justificacion && valor !== null && (
        <div className="grid gap-2.5">
          <p className="text-sm font-black uppercase tracking-wider text-muted">¿Por qué?</p>
          {ordenJust.map((i) => (
            <button
              key={i}
              type="button"
              disabled={bloqueado}
              aria-pressed={justificacion === i}
              className={`${CLASE_OPCION} ${claseVeredicto(justificacion === i, veredicto)}`}
              onClick={() => {
                setJustificacion(i);
                avisar(valor, i);
              }}
            >
              {ej.justificacion!.opciones[i]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
