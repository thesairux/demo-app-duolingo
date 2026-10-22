// Estado del jugador que se guarda en el dispositivo, y cómo cambia con cada sesión, cofre o compra.
import { leccionesDeUnidad, UNIDADES } from '../content';
import { claveDia } from './fechas';
import { otorgarLogros, type Logro } from './logros';
import { coronasDe, type ProgresoLeccion } from './progreso';
import { RACHA_INICIAL, registrarPractica, type Racha } from './racha';
import { actualizarFicha, type FichaEjercicio } from './repaso';
import { APROBAR_CHECKPOINT, APROBAR_EXAMEN, CORONAS_MAX, ERRORES_LEGENDARIO, REGLAS, type ModoSesion } from './sesion';
import {
  ACCESORIOS,
  ATUENDO_INICIAL,
  GORROS,
  COMODINES_INICIALES,
  COMODINES_POR_COMPRA,
  GEMAS,
  gemasDeCofre,
  MAX_COMODINES,
  MAX_PROTECTORES,
  MINUTOS_DOBLE_XP,
  PRECIO_COMODINES,
  PRECIO_DOBLE_XP,
  PRECIO_PROTECTOR,
  PRECIO_RECARGA_VIDAS,
  PRECIO_UNA_VIDA,
  type Atuendo,
  type Gorro,
  type IdAccesorio,
  type Ranura,
} from './tienda';
import { recargar, VIDAS_MAX, vidasLlenas, type Vidas } from './vidas';
import type { ResumenXP } from './xp';

export type MetaDiaria = 10 | 20 | 30 | 50;
export const METAS: MetaDiaria[] = [10, 20, 30, 50];

export interface Perfil {
  apodo: string;
  metaDiaria: MetaDiaria;
  creado: string;
}

export interface RegistroExamen {
  fecha: string;
  aciertos: number;
  total: number;
  segundos: number;
  unidades: number[];
  aprobado: boolean;
}

export interface Contadores {
  casosResueltos: number;
  leccionesPerfectas: number;
  repasos: number;
  examenesAprobados: number;
  legendarias: number;
  checkpointsAprobados: number;
  cofresAbiertos: number;
  /** Hojas del cuaderno revisadas (con foto o por el propio niño). */
  cuadernos: number;
}

export interface EstadoJuego {
  /** 2: el sonido parte activado (en la versión 1 se podía haber guardado apagado). */
  version: 2;
  perfil: Perfil | null;
  xpTotal: number;
  xpPorDia: Record<string, number>;
  vidas: Vidas;
  racha: Racha;
  lecciones: Record<string, ProgresoLeccion>;
  ejercicios: Record<string, FichaEjercicio>;
  gemas: number;
  /** id del logro → día en que se desbloqueó. */
  logros: Record<string, string>;
  /** "u1", "u2"… → día en que se abrió el cofre de esa unidad. */
  cofres: Record<string, string>;
  checkpoints: Record<string, { aprobado: boolean; mejor: number }>;
  examenes: RegistroExamen[];
  contadores: Contadores;
  tienda: Tienda;
  ajustes: { sonido: boolean; animaciones: boolean };
}

export interface Tienda {
  gorro: Gorro;
  gorros: Gorro[];
  /** Accesorios comprados (el libro azul viene de regalo). */
  accesorios: IdAccesorio[];
  /** Lo que Numi tiene puesto en cada parte. */
  atuendo: Atuendo;
  /** Comodines 50/50 disponibles. */
  comodines: number;
  /** Instante (ms) hasta el que corre el Doble XP; 0 si no se compró. */
  dobleXPHasta: number;
}

export const TIENDA_INICIAL: Tienda = {
  gorro: 'amarillo',
  gorros: ['amarillo'],
  accesorios: ['libro-azul'],
  atuendo: { ...ATUENDO_INICIAL },
  comodines: COMODINES_INICIALES,
  dobleXPHasta: 0,
};

export const dobleXPActivo = (estado: EstadoJuego, ahora: number) => estado.tienda.dobleXPHasta > ahora;

export const CONTADORES_INICIALES: Contadores = {
  casosResueltos: 0,
  leccionesPerfectas: 0,
  repasos: 0,
  examenesAprobados: 0,
  legendarias: 0,
  checkpointsAprobados: 0,
  cofresAbiertos: 0,
  cuadernos: 0,
};

export function estadoInicial(ahora: number): EstadoJuego {
  return {
    version: 2,
    perfil: null,
    xpTotal: 0,
    xpPorDia: {},
    vidas: vidasLlenas(ahora),
    racha: { ...RACHA_INICIAL },
    lecciones: {},
    ejercicios: {},
    gemas: 0,
    logros: {},
    cofres: {},
    checkpoints: {},
    examenes: [],
    contadores: { ...CONTADORES_INICIALES },
    tienda: { ...TIENDA_INICIAL, atuendo: { ...ATUENDO_INICIAL } },
    ajustes: { sonido: true, animaciones: true },
  };
}

export interface ResultadoSesion {
  modo: ModoSesion;
  /** false si la sesión se cortó antes de terminar (por ejemplo, sin vidas). */
  completada: boolean;
  xp: ResumenXP;
  /** Ejercicios distintos de la sesión. */
  total: number;
  /** Ejercicios acertados al primer intento. */
  aciertosPrimerIntento: number;
  aciertos: number;
  respuestas: number;
  errores: number;
  segundos: number;
  porEjercicio: Record<string, { aciertos: number; fallos: number }>;
  /** Casos prácticos acertados. */
  casosCorrectos: number;
}

export interface EfectosSesion {
  coronasAntes: number;
  coronasDespues: number;
  /** Para checkpoint, legendario y examen: si se aprobó. null en las demás. */
  aprobado: boolean | null;
  rachaExtendida: boolean;
  protectoresUsados: number;
  metaCumplidaHoy: boolean;
  xpHoy: number;
  /** XP extra por el Doble XP de la tienda (0 si no estaba activo). */
  xpDoble: number;
  vidaGanada: boolean;
  gemas: { motivo: string; gemas: number }[];
  logrosNuevos: Logro[];
}

export function precision(r: Pick<ResultadoSesion, 'aciertos' | 'respuestas'>): number {
  return r.respuestas ? Math.round((r.aciertos / r.respuestas) * 100) : 0;
}

export function precisionPrimerIntento(r: Pick<ResultadoSesion, 'aciertosPrimerIntento' | 'total'>): number {
  return r.total ? r.aciertosPrimerIntento / r.total : 0;
}

/** Si una sesión de este modo, con este resultado, se aprueba. null si el modo no se aprueba ni reprueba. */
export function aprobada(r: ResultadoSesion): boolean | null {
  switch (r.modo.tipo) {
    case 'checkpoint':
      return r.completada && precisionPrimerIntento(r) >= APROBAR_CHECKPOINT;
    case 'legendario':
      return r.completada && r.errores <= ERRORES_LEGENDARIO;
    case 'examen':
      return r.completada && precisionPrimerIntento(r) >= APROBAR_EXAMEN;
    default:
      return null;
  }
}

/** Aplica el resultado de cualquier sesión. Función pura: devuelve un estado nuevo y sus efectos. */
export function aplicarSesion(estado: EstadoJuego, r: ResultadoSesion, ahora: number): { estado: EstadoJuego; efectos: EfectosSesion } {
  const hoy = claveDia(new Date(ahora));
  const meta = estado.perfil?.metaDiaria ?? 20;
  const xpAntes = estado.xpPorDia[hoy] ?? 0;
  const xpDoble = dobleXPActivo(estado, ahora) ? r.xp.total : 0;
  const xpGanada = r.xp.total + xpDoble;
  const xpHoy = xpAntes + xpGanada;
  const gemas: EfectosSesion['gemas'] = [];
  const contadores = { ...estado.contadores, casosResueltos: estado.contadores.casosResueltos + r.casosCorrectos };
  let lecciones = estado.lecciones;
  let vidas = recargar(estado.vidas, ahora);
  let checkpoints = estado.checkpoints;
  let examenes = estado.examenes;
  let vidaGanada = false;
  let coronasAntes = 0;
  let coronasDespues = 0;
  const aprobado = aprobada(r);

  const ejercicios = { ...estado.ejercicios };
  for (const [id, intento] of Object.entries(r.porEjercicio)) {
    ejercicios[id] = actualizarFicha(ejercicios[id], intento, hoy, ahora);
  }

  const modo = r.modo;
  if (modo.tipo === 'leccion' || modo.tipo === 'legendario' || modo.tipo === 'repaso-leccion') {
    const previo = estado.lecciones[modo.leccionId] ?? { coronas: 0, completadas: 0, mejorPrecision: 0 };
    coronasAntes = coronasDespues = previo.coronas;
    if (modo.tipo === 'leccion' && r.completada) {
      coronasDespues = Math.min(CORONAS_MAX, previo.coronas + 1);
      lecciones = {
        ...lecciones,
        [modo.leccionId]: { ...previo, coronas: coronasDespues, completadas: previo.completadas + 1, mejorPrecision: Math.max(previo.mejorPrecision, precision(r)) },
      };
      gemas.push({ motivo: 'Lección completada', gemas: GEMAS.leccion });
      if (r.errores === 0) {
        contadores.leccionesPerfectas += 1;
        gemas.push({ motivo: 'Lección sin errores', gemas: GEMAS.leccionPerfecta });
      }
    }
    if (modo.tipo === 'legendario' && aprobado && !previo.legendaria) {
      lecciones = { ...lecciones, [modo.leccionId]: { ...previo, legendaria: true } };
      contadores.legendarias += 1;
      gemas.push({ motivo: 'Desafío legendario', gemas: GEMAS.legendaria });
    }
  }

  if (modo.tipo === 'checkpoint') {
    const clave = `u${modo.unidad}`;
    const previo = estado.checkpoints[clave] ?? { aprobado: false, mejor: 0 };
    const pct = Math.round(precisionPrimerIntento(r) * 100);
    checkpoints = { ...checkpoints, [clave]: { aprobado: previo.aprobado || !!aprobado, mejor: Math.max(previo.mejor, r.completada ? pct : 0) } };
    if (aprobado) {
      // Aprobar el checkpoint da al menos una corona en cada lección de la unidad.
      lecciones = { ...lecciones };
      for (const l of leccionesDeUnidad(modo.unidad)) {
        const p = lecciones[l.leccion.id] ?? { coronas: 0, completadas: 0, mejorPrecision: 0 };
        if (p.coronas < 1) lecciones[l.leccion.id] = { ...p, coronas: 1 };
      }
      if (!previo.aprobado) {
        contadores.checkpointsAprobados += 1;
        gemas.push({ motivo: 'Checkpoint aprobado', gemas: GEMAS.checkpoint });
      }
    }
  }

  if (modo.tipo === 'examen' && r.completada) {
    examenes = [
      ...estado.examenes,
      { fecha: hoy, aciertos: r.aciertosPrimerIntento, total: r.total, segundos: Math.round(r.segundos), unidades: modo.unidades, aprobado: !!aprobado },
    ].slice(-20);
    if (aprobado) {
      contadores.examenesAprobados += 1;
      gemas.push({ motivo: 'Examen aprobado', gemas: GEMAS.examenAprobado });
    }
  }

  if (REGLAS[modo.tipo].daVida && r.completada) {
    contadores.repasos += 1;
    if (vidas.actuales < VIDAS_MAX) {
      vidas = { actuales: vidas.actuales + 1, desde: vidas.actuales + 1 >= VIDAS_MAX ? ahora : vidas.desde };
      vidaGanada = true;
    }
  }

  const metaCumplidaHoy = xpAntes < meta && xpHoy >= meta;
  if (metaCumplidaHoy) gemas.push({ motivo: 'Meta diaria cumplida', gemas: GEMAS.metaDiaria });

  const practica = r.completada ? registrarPractica(estado.racha, hoy) : { racha: estado.racha, extendida: false, protectoresUsados: 0 };

  const intermedio: EstadoJuego = {
    ...estado,
    xpTotal: estado.xpTotal + xpGanada,
    xpPorDia: { ...estado.xpPorDia, [hoy]: xpHoy },
    vidas,
    racha: practica.racha,
    lecciones,
    ejercicios,
    checkpoints,
    examenes,
    contadores,
    gemas: estado.gemas + gemas.reduce((s, g) => s + g.gemas, 0),
  };
  const { estado: final, nuevos } = otorgarLogros(intermedio, hoy);
  for (const l of nuevos) gemas.push({ motivo: `Logro: ${l.titulo}`, gemas: l.gemas });

  return {
    estado: final,
    efectos: {
      coronasAntes,
      coronasDespues,
      aprobado,
      rachaExtendida: practica.extendida,
      protectoresUsados: practica.protectoresUsados,
      metaCumplidaHoy,
      xpHoy,
      xpDoble,
      vidaGanada,
      gemas,
      logrosNuevos: nuevos,
    },
  };
}

export interface EfectosCuaderno {
  xpGanada: number;
  xpHoy: number;
  metaCumplidaHoy: boolean;
  rachaExtendida: boolean;
  gemas: { motivo: string; gemas: number }[];
  logrosNuevos: Logro[];
}

/**
 * Suma lo ganado con una hoja del cuaderno. `nuevaHoja` es true la primera vez que se revisa esa hoja:
 * solo entonces cuenta para la racha y para el logro, así revisarla de nuevo no se aprovecha dos veces.
 */
export function aplicarCuaderno(estado: EstadoJuego, r: { xp: number; nuevaHoja: boolean }, ahora: number): { estado: EstadoJuego; efectos: EfectosCuaderno } {
  const hoy = claveDia(new Date(ahora));
  const meta = estado.perfil?.metaDiaria ?? 20;
  const xpAntes = estado.xpPorDia[hoy] ?? 0;
  const xpGanada = r.xp + (dobleXPActivo(estado, ahora) ? r.xp : 0);
  const xpHoy = xpAntes + xpGanada;
  const metaCumplidaHoy = xpAntes < meta && xpHoy >= meta;
  const gemas: EfectosCuaderno['gemas'] = metaCumplidaHoy ? [{ motivo: 'Meta diaria cumplida', gemas: GEMAS.metaDiaria }] : [];
  const practica = r.nuevaHoja ? registrarPractica(estado.racha, hoy) : { racha: estado.racha, extendida: false };
  const intermedio: EstadoJuego = {
    ...estado,
    xpTotal: estado.xpTotal + xpGanada,
    xpPorDia: { ...estado.xpPorDia, [hoy]: xpHoy },
    racha: practica.racha,
    gemas: estado.gemas + gemas.reduce((s, g) => s + g.gemas, 0),
    contadores: { ...estado.contadores, cuadernos: estado.contadores.cuadernos + (r.nuevaHoja ? 1 : 0) },
  };
  const { estado: final, nuevos } = otorgarLogros(intermedio, hoy);
  for (const l of nuevos) gemas.push({ motivo: `Logro: ${l.titulo}`, gemas: l.gemas });
  return { estado: final, efectos: { xpGanada, xpHoy, metaCumplidaHoy, rachaExtendida: practica.extendida, gemas, logrosNuevos: nuevos } };
}

/** Un cofre se puede abrir cuando la lección anterior a él tiene al menos una corona. */
export function cofreDisponible(estado: EstadoJuego, unidad: number): boolean {
  const u = UNIDADES.find((x) => x.unidad === unidad);
  if (!u || estado.cofres[`u${unidad}`]) return false;
  const leccion = u.lecciones[u.cofreDespuesDe - 1];
  return !!leccion && coronasDe(estado.lecciones, leccion.id) >= 1;
}

export function abrirCofre(
  estado: EstadoJuego,
  unidad: number,
  ahora: number,
  aleatorio: () => number = Math.random,
): { estado: EstadoJuego; gemas: number; logrosNuevos: Logro[] } {
  if (!cofreDisponible(estado, unidad)) return { estado, gemas: 0, logrosNuevos: [] };
  const hoy = claveDia(new Date(ahora));
  const gemas = gemasDeCofre(aleatorio);
  const conCofre: EstadoJuego = {
    ...estado,
    gemas: estado.gemas + gemas,
    cofres: { ...estado.cofres, [`u${unidad}`]: hoy },
    contadores: { ...estado.contadores, cofresAbiertos: estado.contadores.cofresAbiertos + 1 },
  };
  const { estado: final, nuevos } = otorgarLogros(conCofre, hoy);
  return { estado: final, gemas, logrosNuevos: nuevos };
}

export type Articulo =
  | { tipo: 'recarga-vidas' }
  | { tipo: 'una-vida' }
  | { tipo: 'protector' }
  | { tipo: 'comodines' }
  | { tipo: 'doble-xp' }
  | { tipo: 'gorro'; gorro: Gorro }
  | { tipo: 'accesorio'; id: IdAccesorio };

/** Compra (o equipa, si ya se tiene) un artículo de la tienda. */
export function comprar(estado: EstadoJuego, articulo: Articulo, ahora: number): { estado: EstadoJuego; error?: string } {
  const sinGemas = (precio: number) => (estado.gemas < precio ? `Te faltan ${precio - estado.gemas} gemas.` : undefined);
  switch (articulo.tipo) {
    case 'recarga-vidas': {
      if (recargar(estado.vidas, ahora).actuales >= VIDAS_MAX) return { estado, error: 'Tus vidas ya están llenas.' };
      const error = sinGemas(PRECIO_RECARGA_VIDAS);
      if (error) return { estado, error };
      return { estado: { ...estado, gemas: estado.gemas - PRECIO_RECARGA_VIDAS, vidas: vidasLlenas(ahora) } };
    }
    case 'una-vida': {
      const v = recargar(estado.vidas, ahora);
      if (v.actuales >= VIDAS_MAX) return { estado, error: 'Tus vidas ya están llenas.' };
      const error = sinGemas(PRECIO_UNA_VIDA);
      if (error) return { estado, error };
      const actuales = v.actuales + 1;
      return { estado: { ...estado, gemas: estado.gemas - PRECIO_UNA_VIDA, vidas: { actuales, desde: actuales >= VIDAS_MAX ? ahora : v.desde } } };
    }
    case 'comodines': {
      if (estado.tienda.comodines + COMODINES_POR_COMPRA > MAX_COMODINES) return { estado, error: `Puedes tener hasta ${MAX_COMODINES} comodines.` };
      const error = sinGemas(PRECIO_COMODINES);
      if (error) return { estado, error };
      return {
        estado: { ...estado, gemas: estado.gemas - PRECIO_COMODINES, tienda: { ...estado.tienda, comodines: estado.tienda.comodines + COMODINES_POR_COMPRA } },
      };
    }
    case 'doble-xp': {
      if (dobleXPActivo(estado, ahora)) return { estado, error: 'Tu Doble XP ya está activo.' };
      const error = sinGemas(PRECIO_DOBLE_XP);
      if (error) return { estado, error };
      return {
        estado: { ...estado, gemas: estado.gemas - PRECIO_DOBLE_XP, tienda: { ...estado.tienda, dobleXPHasta: ahora + MINUTOS_DOBLE_XP * 60_000 } },
      };
    }
    case 'protector': {
      if (estado.racha.protectores >= MAX_PROTECTORES) return { estado, error: `Puedes tener hasta ${MAX_PROTECTORES} protectores.` };
      const error = sinGemas(PRECIO_PROTECTOR);
      if (error) return { estado, error };
      return { estado: { ...estado, gemas: estado.gemas - PRECIO_PROTECTOR, racha: { ...estado.racha, protectores: estado.racha.protectores + 1 } } };
    }
    case 'gorro': {
      if (estado.tienda.gorros.includes(articulo.gorro)) return { estado: { ...estado, tienda: { ...estado.tienda, gorro: articulo.gorro } } };
      const precio = GORROS[articulo.gorro].precio;
      const error = sinGemas(precio);
      if (error) return { estado, error };
      return {
        estado: { ...estado, gemas: estado.gemas - precio, tienda: { ...estado.tienda, gorro: articulo.gorro, gorros: [...estado.tienda.gorros, articulo.gorro] } },
      };
    }
    case 'accesorio': {
      const datos = ACCESORIOS[articulo.id];
      const atuendo = { ...estado.tienda.atuendo, [datos.ranura]: articulo.id };
      if (estado.tienda.accesorios.includes(articulo.id)) return { estado: { ...estado, tienda: { ...estado.tienda, atuendo } } };
      const error = sinGemas(datos.precio);
      if (error) return { estado, error };
      return {
        estado: { ...estado, gemas: estado.gemas - datos.precio, tienda: { ...estado.tienda, atuendo, accesorios: [...estado.tienda.accesorios, articulo.id] } },
      };
    }
  }
}

/** Le saca a Numi lo que tenga en esa parte. El libro no se puede sacar. */
export function quitarAccesorio(estado: EstadoJuego, ranura: Ranura): EstadoJuego {
  if (ranura === 'libro') return estado;
  return { ...estado, tienda: { ...estado.tienda, atuendo: { ...estado.tienda.atuendo, [ranura]: null } } };
}

/** Gasta un comodín 50/50. Devuelve el mismo estado si no quedan. */
export function usarComodin(estado: EstadoJuego): { estado: EstadoJuego; ok: boolean } {
  if (estado.tienda.comodines <= 0) return { estado, ok: false };
  return { estado: { ...estado, tienda: { ...estado.tienda, comodines: estado.tienda.comodines - 1 } }, ok: true };
}
