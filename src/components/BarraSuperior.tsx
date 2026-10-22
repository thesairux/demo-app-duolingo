// Racha, meta diaria, gemas y vidas, siempre visibles en las secciones principales.
import { useState } from 'react';
import { useJuego } from '../hooks/useJuego';
import { useReloj } from '../hooks/useReloj';
import { claveDia, formatoMinutos } from '../lib/fechas';
import { estadoRacha } from '../lib/racha';
import { msParaProximaVida, recargar, VIDAS_MAX } from '../lib/vidas';
import { AnilloMeta } from './Barras';
import { Boton } from './Boton';
import { Hoja } from './Hoja';
import { IconoCorazon, IconoFuego, IconoFuegoApagado, IconoGema } from './Iconos';
import { Numi } from './Numi';

export function BarraSuperior({ onPracticar }: { onPracticar?: () => void }) {
  const { estado } = useJuego();
  const ahora = useReloj(1000);
  const [verVidas, setVerVidas] = useState(false);
  const hoy = claveDia(new Date(ahora));
  const racha = estadoRacha(estado.racha, hoy);
  const vidas = recargar(estado.vidas, ahora).actuales;
  const proxima = msParaProximaVida(estado.vidas, ahora);
  const meta = estado.perfil?.metaDiaria ?? 20;
  const xpHoy = estado.xpPorDia[hoy] ?? 0;
  const rachaHoy = racha.estado === 'activa-hoy';
  const minutosDoble = Math.ceil((estado.tienda.dobleXPHasta - ahora) / 60_000);

  return (
    <header className="sticky top-0 z-20 border-b-2 border-line bg-surface/95 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="mx-auto flex max-w-xl items-center justify-between gap-2 px-4 py-2.5">
        <span
          className="inline-flex items-center gap-1 text-[17px] font-black tabular-nums"
          style={{ color: rachaHoy ? 'var(--u3)' : 'var(--muted)' }}
          title={rachaHoy ? 'Racha de días: hoy ya practicaste' : 'Racha de días: practica hoy para mantenerla'}
        >
          {rachaHoy ? <IconoFuego className="llama-viva h-6 w-6" /> : <IconoFuegoApagado className="h-6 w-6" />}
          {racha.dias}
          <span className="sr-only">{racha.dias === 1 ? 'día de racha' : 'días de racha'}</span>
        </span>

        <span className="inline-flex items-center gap-1.5 text-sm font-bold" title="Meta diaria de XP">
          <AnilloMeta valor={xpHoy / meta} tamano={28} />
          <span className="tabular-nums">
            {Math.min(xpHoy, meta)}/{meta}
            <span className="sr-only"> XP de la meta diaria</span>
          </span>
          {minutosDoble > 0 && (
            <span className="rounded-full bg-amber-soft px-1.5 py-0.5 text-[11px] font-black text-amber-text" title={`Doble XP: quedan ${minutosDoble} min`}>
              ×2<span className="sr-only">. Doble XP activo, quedan {minutosDoble} minutos</span>
            </span>
          )}
        </span>

        <span className="inline-flex items-center gap-1 text-[17px] font-black tabular-nums" style={{ color: 'var(--u1)' }} title="Gemas">
          <IconoGema className="h-6 w-6" />
          {estado.gemas}
          <span className="sr-only">gemas</span>
        </span>

        <button
          type="button"
          onClick={() => setVerVidas(true)}
          className="inline-flex items-center gap-1 rounded-xl px-1 text-[17px] font-black tabular-nums text-bad"
          aria-label={`${vidas} vidas. Ver cómo recuperarlas`}
        >
          <IconoCorazon className="h-6 w-6" />
          {vidas}
        </button>
      </div>

      <Hoja abierta={verVidas} onCerrar={() => setVerVidas(false)} titulo="Vidas">
        <div className="grid gap-4">
          <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3">
            <Numi expresion={vidas === 0 ? 'preocupada' : 'feliz'} className="h-auto w-[72px]" />
            <div>
              <h2 className="text-2xl font-bold">
                {vidas} de {VIDAS_MAX} vidas
              </h2>
              <p className="text-muted">Cada error en una lección resta una vida.</p>
            </div>
          </div>
          <ul className="grid gap-2 rounded-2xl bg-surface-2 p-4 text-[15px]">
            <li>
              <strong>Repasa una lección que ya completaste</strong> o haz una práctica: al terminarla recuperas una vida. En los repasos los
              errores no restan vidas.
            </li>
            <li>
              <strong>Espera:</strong> se recupera una vida cada 30 minutos
              {proxima !== null ? `. La próxima llega en ${formatoMinutos(proxima / 1000)}.` : '. Ahora tienes todas.'}
            </li>
            <li>
              <strong>Usa gemas</strong> en la tienda para llenar tus vidas.
            </li>
          </ul>
          {onPracticar && vidas < VIDAS_MAX && (
            <Boton
              ancho
              onClick={() => {
                setVerVidas(false);
                onPracticar();
              }}
            >
              Practicar para recuperar una vida
            </Boton>
          )}
          <Boton ancho variante="suave" onClick={() => setVerVidas(false)}>
            Entendido
          </Boton>
        </div>
      </Hoja>
    </header>
  );
}
