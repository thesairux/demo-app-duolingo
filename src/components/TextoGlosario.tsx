// Texto con los términos del glosario subrayados. Al tocar uno se abre su definición.
import { useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { GLOSARIO } from '../content';
import type { TerminoGlosario } from '../content/types';
import { marcarTerminos } from '../lib/glosario';
import { Boton } from './Boton';
import { GlosarioActivo } from './glosarioActivo';
import { Hoja } from './Hoja';

export function TextoGlosario({ texto }: { texto: string }) {
  const activo = useContext(GlosarioActivo);
  const trozos = useMemo(() => (activo ? marcarTerminos(texto, GLOSARIO) : [{ texto }]), [texto, activo]);
  const [abierto, setAbierto] = useState<TerminoGlosario | null>(null);

  return (
    <>
      {trozos.map((t, i) =>
        t.termino ? (
          // Un <span> y no un <button>: así un término largo puede partirse entre dos líneas.
          <span
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => setAbierto(t.termino!)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setAbierto(t.termino!);
              }
            }}
            className="cursor-help rounded-sm underline decoration-select decoration-dotted decoration-2 underline-offset-[5px]"
            aria-haspopup="dialog"
            title="Ver qué significa"
          >
            {t.texto}
          </span>
        ) : (
          <span key={i}>{t.texto}</span>
        ),
      )}
      {/* En un portal: el texto suele estar dentro de un <p>, que no puede contener la hoja. */}
      {createPortal(
        <Hoja abierta={!!abierto} onCerrar={() => setAbierto(null)} titulo={abierto ? `Glosario: ${abierto.termino}` : 'Glosario'}>
          {abierto && (
            <div className="grid gap-3 text-left text-base font-normal normal-case tracking-normal text-ink">
              <p className="text-[12.5px] font-black uppercase tracking-[.1em] text-muted">Glosario</p>
              <h2 className="text-2xl font-bold">{abierto.termino}</h2>
              <p className="text-[17px] leading-relaxed">{abierto.definicion}</p>
              <Boton ancho onClick={() => setAbierto(null)}>
                Entendido
              </Boton>
            </div>
          )}
        </Hoja>,
        document.body,
      )}
    </>
  );
}
