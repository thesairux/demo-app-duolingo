// Ordenar pasos: se tocan en orden; tocar un paso ya puesto lo devuelve al banco.
import { useState } from 'react';
import type { Ordenar as O } from '../../content/types';
import { mezclar } from '../../lib/azar';
import { TextoGlosario } from '../TextoGlosario';
import { CLASE_PREGUNTA, type PropsEjercicio } from './comun';

export function Ordenar({ ej, bloqueado, veredicto, onRespuesta }: PropsEjercicio<O>) {
  const [banco] = useState(() => mezclar(ej.pasos.map((_, i) => i)));
  const [puestos, setPuestos] = useState<number[]>([]);

  function cambiar(nuevos: number[]) {
    setPuestos(nuevos);
    onRespuesta(nuevos.length === ej.pasos.length ? { tipo: 'orden', indices: nuevos } : null);
  }

  const borde = veredicto === 'correcta' ? 'var(--ok)' : veredicto === 'incorrecta' ? 'var(--bad)' : 'var(--line-deep)';

  return (
    <div className="grid gap-4">
      <p className={CLASE_PREGUNTA}>
        <TextoGlosario texto={ej.enunciado} />
      </p>
      <ol className="grid min-h-16 content-start gap-2 rounded-2xl border-2 border-dashed p-2.5" style={{ borderColor: borde }} aria-label="Tu orden">
        {puestos.length === 0 && <li className="list-none p-1 text-sm font-semibold text-muted">Toca las tarjetas en el orden correcto</li>}
        {puestos.map((i, pos) => (
          <li key={i} className="list-none">
            <button
              type="button"
              disabled={bloqueado}
              onClick={() => cambiar(puestos.filter((x) => x !== i))}
              className="opcion grid w-full grid-cols-[24px_minmax(0,1fr)] gap-1 rounded-xl px-3 py-2.5 text-left text-[15px] font-bold"
            >
              <span className="font-black tabular-nums text-select">{pos + 1}.</span>
              <span>{ej.pasos[i]}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="grid gap-2">
        {banco
          .filter((i) => !puestos.includes(i))
          .map((i) => (
            <button
              key={i}
              type="button"
              disabled={bloqueado}
              onClick={() => cambiar([...puestos, i])}
              className="opcion w-full rounded-xl px-3 py-2.5 text-left text-[15px] font-bold"
            >
              {ej.pasos[i]}
            </button>
          ))}
      </div>
    </div>
  );
}
