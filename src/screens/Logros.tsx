// Pestaña Logros: insignias desbloqueadas y por desbloquear, con su avance.
import { BarraSuperior } from '../components/BarraSuperior';
import { IconoGema } from '../components/Iconos';
import { IconoLogro } from '../components/IconoLogro';
import { useJuego } from '../hooks/useJuego';
import { LOGROS } from '../lib/logros';

export function Logros() {
  const { estado } = useJuego();
  const hechos = LOGROS.filter((l) => estado.logros[l.id]).length;
  const ordenados = [...LOGROS].sort((a, b) => Number(!!estado.logros[b.id]) - Number(!!estado.logros[a.id]));

  return (
    <div className="min-h-full">
      <BarraSuperior />
      <main className="mx-auto grid max-w-xl gap-5 px-4 pb-28 pt-5">
        <div className="grid gap-1">
          <h1 className="text-3xl font-bold">Logros</h1>
          <p className="text-muted">
            Llevas {hechos} de {LOGROS.length}. Cada logro te da gemas.
          </p>
        </div>
        <ul className="grid gap-3">
          {ordenados.map((l) => {
            const fecha = estado.logros[l.id];
            const [actual, meta] = l.progreso(estado);
            return (
              <li key={l.id} className={`grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3 rounded-[20px] border-2 bg-surface p-3.5 ${fecha ? 'border-amber' : 'border-line'}`}>
                <IconoLogro icono={l.icono} activo={!!fecha} tamano={56} />
                <div className="grid gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className={`font-display text-lg font-semibold leading-tight ${fecha ? '' : 'text-muted'}`}>{l.titulo}</h2>
                      <p className="text-sm text-muted">{l.descripcion}</p>
                    </div>
                    <span className="inline-flex flex-none items-center gap-1 text-sm font-black tabular-nums" style={{ color: 'var(--u1)' }}>
                      <IconoGema className="h-4 w-4" />
                      {l.gemas}
                    </span>
                  </div>
                  {fecha ? (
                    <p className="text-xs font-extrabold text-ok-text">Desbloqueado el {fecha}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={meta} aria-valuenow={actual} aria-label={`Avance de ${l.titulo}`}>
                        <div className="h-full rounded-full bg-amber" style={{ width: `${(actual / meta) * 100}%` }} />
                      </div>
                      <span className="text-xs font-extrabold tabular-nums text-muted">
                        {actual}/{meta}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
