// Unir pares: se toca un elemento de cada columna. Los pares correctos quedan fijos.
import { useRef, useState } from 'react';
import type { UnirPares } from '../../content/types';
import { mezclar } from '../../lib/azar';
import { TextoGlosario } from '../TextoGlosario';
import { CLASE_PREGUNTA, type PropsEjercicio } from './comun';

type Lado = 'a' | 'b';

export function Pares({ ej, bloqueado, onRespuesta }: PropsEjercicio<UnirPares>) {
  const [ordenA] = useState(() => mezclar(ej.pares.map((_, i) => i)));
  const [ordenB] = useState(() => mezclar(ej.pares.map((_, i) => i)));
  const [sel, setSel] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });
  const [unidos, setUnidos] = useState<Set<number>>(new Set());
  const [fallo, setFallo] = useState<{ a: number; b: number } | null>(null);
  const errores = useRef(0);

  function tocar(lado: Lado, i: number) {
    const nueva = { ...sel, [lado]: sel[lado] === i ? null : i };
    if (nueva.a !== null && nueva.b !== null) {
      if (nueva.a === nueva.b) {
        const listos = new Set(unidos).add(nueva.a);
        setUnidos(listos);
        if (listos.size === ej.pares.length) onRespuesta({ tipo: 'pares', errores: errores.current });
      } else {
        errores.current += 1;
        setFallo({ a: nueva.a, b: nueva.b });
        window.setTimeout(() => setFallo(null), 500);
      }
      setSel({ a: null, b: null });
    } else {
      setSel(nueva);
    }
  }

  function boton(lado: Lado, i: number) {
    const unido = unidos.has(i);
    const errado = fallo?.[lado] === i;
    return (
      <button
        key={`${lado}-${i}`}
        type="button"
        disabled={bloqueado || unido}
        aria-pressed={sel[lado] === i}
        onClick={() => tocar(lado, i)}
        className={`opcion min-h-[60px] rounded-2xl px-3 py-2.5 text-left text-[14.5px] font-bold leading-snug ${unido ? 'acierto' : ''} ${errado ? 'error' : ''}`}
      >
        {lado === 'a' ? ej.pares[i].a : ej.pares[i].b}
      </button>
    );
  }

  return (
    <div className="grid gap-4">
      <p className={CLASE_PREGUNTA}>
        <TextoGlosario texto={ej.enunciado} />
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="grid content-start gap-2.5">{ordenA.map((i) => boton('a', i))}</div>
        <div className="grid content-start gap-2.5">{ordenB.map((i) => boton('b', i))}</div>
      </div>
      <p className="text-sm font-semibold text-muted" aria-live="polite">
        {unidos.size} de {ej.pares.length} pares unidos
      </p>
    </div>
  );
}
