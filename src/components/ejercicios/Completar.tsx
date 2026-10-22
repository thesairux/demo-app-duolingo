// Completar el espacio: se toca una ficha del banco o, si no hay banco, se escribe.
import { useState } from 'react';
import type { Completar as C } from '../../content/types';
import { mezclar } from '../../lib/azar';
import { TextoGlosario } from '../TextoGlosario';
import { CLASE_PREGUNTA, type PropsEjercicio } from './comun';

export function Completar({ ej, bloqueado, veredicto, onRespuesta }: PropsEjercicio<C>) {
  const [banco] = useState(() => (ej.banco ? mezclar(ej.banco) : null));
  const [valor, setValor] = useState('');
  const [antes, despues = ''] = ej.enunciado.split('___');
  const colorHueco = veredicto === 'correcta' ? 'var(--ok)' : veredicto === 'incorrecta' ? 'var(--bad)' : 'var(--select)';

  function elegir(v: string) {
    setValor(v);
    onRespuesta(v.trim() ? { tipo: 'texto', valor: v } : null);
  }

  return (
    <div className="grid gap-5">
      <p className={`${CLASE_PREGUNTA} leading-[2.1]`}>
        <TextoGlosario texto={antes} />
        {banco ? (
          <button
            type="button"
            disabled={bloqueado || !valor}
            onClick={() => elegir('')}
            aria-label={valor ? `Quitar «${valor}»` : 'Espacio en blanco'}
            className="mx-1 inline-block min-w-[76px] border-b-[3px] px-2 text-center"
            style={{ borderColor: valor ? colorHueco : 'var(--line-deep)', color: colorHueco }}
          >
            {valor || ' '}
          </button>
        ) : (
          <input
            id={`completar-${ej.id}`}
            value={valor}
            disabled={bloqueado}
            onChange={(e) => elegir(e.target.value)}
            aria-label="Escribe la respuesta"
            autoComplete="off"
            className="mx-1 inline-block w-36 border-b-[3px] border-line-deep bg-transparent px-2 text-center outline-none focus:border-select"
            style={{ color: colorHueco }}
          />
        )}
        <TextoGlosario texto={despues} />
      </p>
      {banco && (
        <div className="flex flex-wrap gap-2.5">
          {banco.map((ficha) => (
            <button
              key={ficha}
              type="button"
              disabled={bloqueado || valor === ficha}
              onClick={() => elegir(ficha)}
              className="opcion rounded-xl px-4 py-2.5 text-[15px] font-bold disabled:opacity-35 disabled:shadow-none"
            >
              {ficha}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
