// Clasificar: cada elemento se asigna a una categoría.
import { useState } from 'react';
import type { Clasificar as C } from '../../content/types';
import { mezclar } from '../../lib/azar';
import { TextoGlosario } from '../TextoGlosario';
import { CLASE_PREGUNTA, type PropsEjercicio } from './comun';

export function Clasificar({ ej, bloqueado, veredicto, onRespuesta }: PropsEjercicio<C>) {
  const [orden] = useState(() => mezclar(ej.elementos.map((_, i) => i)));
  const [asignadas, setAsignadas] = useState<(number | null)[]>(() => ej.elementos.map(() => null));

  function asignar(elemento: number, categoria: number) {
    const nuevas = asignadas.map((c, i) => (i === elemento ? categoria : c));
    setAsignadas(nuevas);
    onRespuesta(nuevas.every((c) => c !== null) ? { tipo: 'clasificacion', categorias: nuevas as number[] } : null);
  }

  return (
    <div className="grid gap-3">
      <p className={CLASE_PREGUNTA}>
        <TextoGlosario texto={ej.enunciado} />
      </p>
      {orden.map((i) => {
        const bien = asignadas[i] === ej.elementos[i].categoria;
        const marca = veredicto && asignadas[i] !== null ? (bien ? 'var(--ok)' : 'var(--bad)') : 'var(--line)';
        return (
          <div key={i} className="grid gap-2 rounded-2xl border-2 p-3" style={{ borderColor: marca }}>
            <span className="font-bold">{ej.elementos[i].texto}</span>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${ej.categorias.length}, minmax(0, 1fr))` }} role="group" aria-label={ej.elementos[i].texto}>
              {ej.categorias.map((cat, ci) => (
                <button
                  key={ci}
                  type="button"
                  disabled={bloqueado}
                  aria-pressed={asignadas[i] === ci}
                  onClick={() => asignar(i, ci)}
                  className="opcion rounded-xl px-2 py-2 text-[13.5px] font-extrabold leading-tight text-muted aria-pressed:text-select"
                  style={{ boxShadow: 'none' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
