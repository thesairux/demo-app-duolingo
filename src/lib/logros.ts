// Logros: insignias por hitos, cada una con su premio en gemas.
import { LECCIONES, UNIDADES } from '../content';
import type { EstadoJuego } from './estado';
import { unidadCompleta } from './progreso';
import { diasConMeta } from './semana';

export type IconoLogro = 'leccion' | 'fuego' | 'estrella' | 'corona' | 'maletin' | 'rayo' | 'trofeo' | 'libro' | 'cofre' | 'meta';

export interface Logro {
  id: string;
  titulo: string;
  descripcion: string;
  gemas: number;
  icono: IconoLogro;
  /** [actual, meta] para mostrar el avance. */
  progreso: (e: EstadoJuego) => [number, number];
}

const contar = (n: number, meta: number): [number, number] => [Math.min(n, meta), meta];
const unidadesCon = (e: EstadoJuego, minimo: number) =>
  UNIDADES.filter((u) => unidadCompleta(LECCIONES, e.lecciones, u.unidad, minimo)).length;
const leccionesHechas = (e: EstadoJuego) => Object.values(e.lecciones).filter((l) => l.coronas >= 1).length;

export const LOGROS: Logro[] = [
  { id: 'primera-leccion', titulo: 'Primera lección', descripcion: 'Completa tu primera lección.', gemas: 20, icono: 'leccion', progreso: (e) => contar(leccionesHechas(e), 1) },
  { id: 'cofre', titulo: 'Primer cofre', descripcion: 'Abre un cofre del camino.', gemas: 10, icono: 'cofre', progreso: (e) => contar(e.contadores.cofresAbiertos, 1) },
  { id: 'racha-3', titulo: 'Tres días seguidos', descripcion: 'Logra una racha de 3 días.', gemas: 20, icono: 'fuego', progreso: (e) => contar(e.racha.mejor, 3) },
  { id: 'racha-7', titulo: 'Semana completa', descripcion: 'Logra una racha de 7 días.', gemas: 50, icono: 'fuego', progreso: (e) => contar(e.racha.mejor, 7) },
  { id: 'racha-30', titulo: 'Un mes sin parar', descripcion: 'Logra una racha de 30 días.', gemas: 200, icono: 'fuego', progreso: (e) => contar(e.racha.mejor, 30) },
  { id: 'meta-7', titulo: 'Constancia', descripcion: 'Cumple tu meta diaria en 7 días distintos.', gemas: 60, icono: 'meta', progreso: (e) => contar(diasConMeta(e.xpPorDia, e.perfil?.metaDiaria ?? 20), 7) },
  { id: 'leccion-perfecta', titulo: 'Sin borrones', descripcion: 'Termina una lección sin ningún error.', gemas: 20, icono: 'estrella', progreso: (e) => contar(e.contadores.leccionesPerfectas, 1) },
  { id: 'perfectas-10', titulo: 'Cerebro de calculadora', descripcion: 'Termina 10 lecciones sin errores.', gemas: 60, icono: 'estrella', progreso: (e) => contar(e.contadores.leccionesPerfectas, 10) },
  { id: 'unidad-completa', titulo: 'Unidad completa', descripcion: 'Completa todas las lecciones de una unidad.', gemas: 40, icono: 'libro', progreso: (e) => contar(unidadesCon(e, 1), 1) },
  { id: 'unidad-perfecta', titulo: 'Unidad dominada', descripcion: 'Consigue las 3 coronas en todas las lecciones de una unidad.', gemas: 100, icono: 'corona', progreso: (e) => contar(unidadesCon(e, 3), 1) },
  { id: 'casos-25', titulo: 'Detective de problemas', descripcion: 'Resuelve bien 25 problemas.', gemas: 40, icono: 'maletin', progreso: (e) => contar(e.contadores.casosResueltos, 25) },
  { id: 'casos-100', titulo: 'Cien problemas', descripcion: 'Resuelve bien 100 problemas.', gemas: 120, icono: 'maletin', progreso: (e) => contar(e.contadores.casosResueltos, 100) },
  { id: 'xp-500', titulo: '500 XP', descripcion: 'Junta 500 XP en total.', gemas: 30, icono: 'rayo', progreso: (e) => contar(e.xpTotal, 500) },
  { id: 'xp-2000', titulo: '2.000 XP', descripcion: 'Junta 2.000 XP en total.', gemas: 100, icono: 'rayo', progreso: (e) => contar(e.xpTotal, 2000) },
  { id: 'cuaderno-3', titulo: 'Cuaderno estrella', descripcion: 'Revisa 3 hojas de ejercicios de tu cuaderno.', gemas: 30, icono: 'libro', progreso: (e) => contar(e.contadores.cuadernos, 3) },
  { id: 'desafio-15', titulo: 'Rayo mental', descripcion: 'Responde bien 15 cálculos en un desafío relámpago.', gemas: 40, icono: 'rayo', progreso: (e) => contar(e.mejorDesafio, 15) },
  { id: 'repaso-5', titulo: 'Repaso al día', descripcion: 'Completa 5 repasos.', gemas: 30, icono: 'libro', progreso: (e) => contar(e.contadores.repasos, 5) },
  { id: 'checkpoint', titulo: 'Me salté la fila', descripcion: 'Aprueba un checkpoint de unidad.', gemas: 40, icono: 'trofeo', progreso: (e) => contar(e.contadores.checkpointsAprobados, 1) },
  { id: 'legendaria', titulo: 'Leyenda de los números', descripcion: 'Supera un desafío legendario.', gemas: 50, icono: 'corona', progreso: (e) => contar(e.contadores.legendarias, 1) },
  { id: 'examen', titulo: 'Examen aprobado', descripcion: 'Aprueba un modo examen (60% o más).', gemas: 40, icono: 'trofeo', progreso: (e) => contar(e.contadores.examenesAprobados, 1) },
];

export function logroPorId(id: string): Logro | undefined {
  return LOGROS.find((l) => l.id === id);
}

/** Desbloquea los logros recién cumplidos y suma sus gemas. */
export function otorgarLogros(estado: EstadoJuego, hoy: string): { estado: EstadoJuego; nuevos: Logro[] } {
  const nuevos = LOGROS.filter((l) => {
    if (estado.logros[l.id]) return false;
    const [actual, meta] = l.progreso(estado);
    return actual >= meta;
  });
  if (nuevos.length === 0) return { estado, nuevos };
  return {
    estado: {
      ...estado,
      gemas: estado.gemas + nuevos.reduce((s, l) => s + l.gemas, 0),
      logros: { ...estado.logros, ...Object.fromEntries(nuevos.map((l) => [l.id, hoy])) },
    },
    nuevos,
  };
}
