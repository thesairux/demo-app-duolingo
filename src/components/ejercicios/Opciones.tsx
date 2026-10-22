// Selección múltiple y problema (caso práctico).
import { useState } from 'react';
import type { CasoPractico, SeleccionMultiple } from '../../content/types';
import { mezclar } from '../../lib/azar';
import { Numi } from '../Numi';
import { TextoGlosario } from '../TextoGlosario';
import { CLASE_OPCION, CLASE_PREGUNTA, claseVeredicto, type PropsEjercicio } from './comun';

export function Opciones({ ej, bloqueado, veredicto, onRespuesta, ocultas = [] }: PropsEjercicio<SeleccionMultiple | CasoPractico>) {
  const [orden] = useState(() => mezclar(ej.opciones.map((_, i) => i)));
  const [elegida, setElegida] = useState<number | null>(null);

  return (
    <div className="grid gap-4">
      {ej.tipo === 'caso_practico' && (
        <div className="grid grid-cols-[64px_minmax(0,1fr)] items-start gap-3 rounded-2xl bg-surface-2 p-3">
          <Numi expresion="pensando" className="h-auto w-16" />
          <p className="font-semibold">
            <TextoGlosario texto={ej.caso} />
          </p>
        </div>
      )}
      <p className={CLASE_PREGUNTA}>
        <TextoGlosario texto={ej.enunciado} />
      </p>
      <div className="grid gap-2.5">
        {orden.filter((i) => !ocultas.includes(i)).map((i) => (
          <button
            key={i}
            type="button"
            disabled={bloqueado}
            aria-pressed={elegida === i}
            className={`${CLASE_OPCION} ${claseVeredicto(elegida === i, veredicto)}`}
            onClick={() => {
              setElegida(i);
              onRespuesta({ tipo: 'opcion', indice: i });
            }}
          >
            {ej.opciones[i]}
          </button>
        ))}
      </div>
    </div>
  );
}
