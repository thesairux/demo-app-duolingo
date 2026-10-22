// Pestaña Perfil: estadísticas, tu semana contra la anterior, temas débiles y ajustes.
import { useMemo, useState } from 'react';
import { BarraSuperior } from '../components/BarraSuperior';
import { Boton } from '../components/Boton';
import { GraficoPrecision, GraficoXPDiaria } from '../components/Graficos';
import { HojaAjustes } from '../components/HojaAjustes';
import { Numi } from '../components/Numi';
import { LECCIONES, UNIDADES } from '../content';
import { useJuego } from '../hooks/useJuego';
import { claveDia } from '../lib/fechas';
import { LOGROS } from '../lib/logros';
import { precisionPorUnidad, temasDebiles } from '../lib/repaso';
import { CORONAS_MAX } from '../lib/sesion';
import { ultimosDias, xpSemanal } from '../lib/semana';

export function Perfil({ onPracticar }: { onPracticar: () => void }) {
  const { estado } = useJuego();
  const [ajustes, setAjustes] = useState(false);
  const hoy = claveDia();
  const meta = estado.perfil?.metaDiaria ?? 20;
  const semana = xpSemanal(estado.xpPorDia, hoy);
  const dias = ultimosDias(estado.xpPorDia, hoy, 14);
  const coronas = Object.values(estado.lecciones).reduce((s, l) => s + l.coronas, 0);
  const completadas = Object.values(estado.lecciones).filter((l) => l.coronas >= 1).length;
  const legendarias = Object.values(estado.lecciones).filter((l) => l.legendaria).length;
  const logros = Object.keys(estado.logros).length;

  const precision = useMemo(() => {
    const datos = precisionPorUnidad(estado.ejercicios);
    return UNIDADES.filter((u) => datos[u.unidad]).map((u) => {
      const d = datos[u.unidad];
      const respuestas = d.aciertos + d.fallos;
      return { unidad: u.unidad, titulo: u.titulo, respuestas, precision: Math.round((d.aciertos / respuestas) * 100) };
    });
  }, [estado.ejercicios]);
  const debiles = useMemo(() => temasDebiles(estado.ejercicios, 5), [estado.ejercicios]);

  const diferencia = semana.estaSemana - semana.semanaPasada;
  const mensajeSemana =
    semana.semanaPasada === 0 && semana.estaSemana === 0
      ? 'Esta semana todavía no sumas XP. ¡Una lección y partimos!'
      : diferencia > 0
        ? `¡Vas ${diferencia} XP arriba de tu semana pasada!`
        : diferencia === 0
          ? 'Vas igual que la semana pasada. Una lección más y la superas.'
          : `Te faltan ${-diferencia} XP para superar tu semana pasada.`;

  const tiles: [string, string][] = [
    ['Racha', `${estado.racha.actual} ${estado.racha.actual === 1 ? 'día' : 'días'}`],
    ['Mejor racha', `${estado.racha.mejor}`],
    ['XP total', `${estado.xpTotal}`],
    ['Lecciones', `${completadas}/${LECCIONES.length}`],
    ['Coronas', `${coronas}/${LECCIONES.length * CORONAS_MAX}`],
    ['Legendarias', `${legendarias}`],
    ['Logros', `${logros}/${LOGROS.length}`],
    ['Exámenes', `${estado.examenes.length}`],
  ];

  return (
    <div className="min-h-full">
      <BarraSuperior />
      <main className="mx-auto grid max-w-xl gap-6 px-4 pb-28 pt-5">
        <section className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-4">
          <Numi expresion="feliz" className="h-auto w-24" />
          <div className="grid gap-1">
            <h1 className="text-3xl font-bold">{estado.perfil?.apodo || 'Tu perfil'}</h1>
            <p className="text-sm text-muted">Aprendiendo desde el {estado.perfil?.creado}</p>
            <Boton variante="suave" className="w-fit px-4! py-2! text-[13px]!" onClick={() => setAjustes(true)}>
              Ajustes
            </Boton>
          </div>
        </section>

        <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {tiles.map(([k, v]) => (
            <div key={k} className="grid gap-0.5 rounded-2xl border-2 border-line bg-surface px-3 py-2.5">
              <dt className="text-[11.5px] font-extrabold uppercase tracking-[.08em] text-muted">{k}</dt>
              <dd className="text-xl font-black">{v}</dd>
            </div>
          ))}
        </dl>

        <section className="grid gap-3 rounded-[22px] border-2 border-line bg-surface p-4" aria-labelledby="t-semana">
          <h2 id="t-semana" className="text-xl font-bold">
            Tu semana contra la anterior
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-surface-2 px-3 py-2.5">
              <p className="text-xs font-extrabold uppercase tracking-[.08em] text-muted">Esta semana</p>
              <p className="text-2xl font-black">{semana.estaSemana} XP</p>
            </div>
            <div className="rounded-2xl bg-surface-2 px-3 py-2.5">
              <p className="text-xs font-extrabold uppercase tracking-[.08em] text-muted">Semana pasada</p>
              <p className="text-2xl font-black">{semana.semanaPasada} XP</p>
            </div>
          </div>
          <p className="font-bold">Numi: {mensajeSemana}</p>
        </section>

        <section className="grid gap-3 rounded-[22px] border-2 border-line bg-surface p-4" aria-labelledby="t-xp">
          <h2 id="t-xp" className="text-xl font-bold">
            XP de los últimos 14 días
          </h2>
          <GraficoXPDiaria dias={dias} meta={meta} />
        </section>

        <section className="grid gap-3 rounded-[22px] border-2 border-line bg-surface p-4" aria-labelledby="t-precision">
          <h2 id="t-precision" className="text-xl font-bold">
            Precisión por unidad
          </h2>
          {precision.length ? <GraficoPrecision filas={precision} /> : <p className="text-muted">Aparecerá cuando completes tu primera lección.</p>}
        </section>

        <section className="grid gap-3 rounded-[22px] border-2 border-line bg-surface p-4" aria-labelledby="t-debiles">
          <h2 id="t-debiles" className="text-xl font-bold">
            Temas débiles
          </h2>
          {debiles.length ? (
            <>
              <ul className="grid gap-2">
                {debiles.map((t) => (
                  <li key={t.leccionId} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-xs font-black uppercase tracking-[.08em] text-muted">Unidad {t.unidad}</span>
                      <span className="font-bold">{t.leccionTitulo}</span>
                    </span>
                    <span className="flex-none text-right">
                      <span className="block font-black tabular-nums">{t.precision}%</span>
                      <span className="text-xs text-muted">{t.intentos} respuestas</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Boton ancho onClick={onPracticar}>
                Reforzar en Practicar
              </Boton>
            </>
          ) : (
            <p className="text-muted">Todavía no hay temas débiles. ¡Sigue así!</p>
          )}
        </section>
      </main>
      <HojaAjustes abierta={ajustes} onCerrar={() => setAjustes(false)} />
    </div>
  );
}
