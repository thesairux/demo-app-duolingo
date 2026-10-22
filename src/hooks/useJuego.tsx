// Estado del jugador compartido por toda la app, guardado en el dispositivo.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { borrarEstado, cargarEstado, guardarEstado } from '../lib/almacen';
import {
  abrirCofre as abrirCofreLib,
  aplicarCuaderno,
  aplicarSesion,
  comprar as comprarLib,
  estadoInicial,
  quitarAccesorio as quitarAccesorioLib,
  usarComodin as usarComodinLib,
  type Articulo,
  type EfectosCuaderno,
  type EfectosSesion,
  type EstadoJuego,
  type MetaDiaria,
  type ResultadoSesion,
} from '../lib/estado';
import { claveDia } from '../lib/fechas';
import type { Logro } from '../lib/logros';
import { GORROS, type Ranura } from '../lib/tienda';
import { perderVida as perderVidaLib } from '../lib/vidas';

interface ContextoJuego {
  estado: EstadoJuego;
  crearPerfil: (apodo: string, metaDiaria: MetaDiaria) => void;
  cambiarMeta: (metaDiaria: MetaDiaria) => void;
  perderVida: () => number;
  terminarSesion: (resultado: ResultadoSesion) => EfectosSesion;
  /** Suma la XP de una hoja del cuaderno revisada. */
  terminarCuaderno: (xp: number, nuevaHoja: boolean) => EfectosCuaderno;
  abrirCofre: (unidad: number) => { gemas: number; logrosNuevos: Logro[] };
  comprar: (articulo: Articulo) => string | undefined;
  quitarAccesorio: (ranura: Ranura) => void;
  /** Gasta un comodín 50/50; false si no quedan. */
  usarComodin: () => boolean;
  alternarSonido: () => void;
  alternarAnimaciones: () => void;
  reiniciar: () => void;
}

const Contexto = createContext<ContextoJuego | null>(null);

export function ProveedorJuego({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoJuego>(() => cargarEstado(Date.now()));
  const ref = useRef(estado);
  ref.current = estado;

  useEffect(() => {
    guardarEstado(estado);
  }, [estado]);

  // El color del birrete de Numi depende del que esté equipado en la tienda.
  useEffect(() => {
    const [base, sombra, brillo] = GORROS[estado.tienda.gorro].colores;
    const raiz = document.documentElement.style;
    raiz.setProperty('--nm-hat', base);
    raiz.setProperty('--nm-hat-d', sombra);
    raiz.setProperty('--nm-hat-l', brillo);
  }, [estado.tienda.gorro]);

  // Con las animaciones apagadas, el CSS detiene también las animaciones de Numi, el confeti y los pulsos.
  useEffect(() => {
    document.documentElement.dataset.animaciones = estado.ajustes.animaciones ? 'si' : 'no';
  }, [estado.ajustes.animaciones]);

  const actualizar = useCallback((nuevo: EstadoJuego) => {
    ref.current = nuevo;
    setEstado(nuevo);
  }, []);

  const crearPerfil = useCallback(
    (apodo: string, metaDiaria: MetaDiaria) => actualizar({ ...ref.current, perfil: { apodo: apodo.trim(), metaDiaria, creado: claveDia() } }),
    [actualizar],
  );

  const cambiarMeta = useCallback(
    (metaDiaria: MetaDiaria) => {
      const perfil = ref.current.perfil;
      if (perfil) actualizar({ ...ref.current, perfil: { ...perfil, metaDiaria } });
    },
    [actualizar],
  );

  const perderVida = useCallback(() => {
    const vidas = perderVidaLib(ref.current.vidas, Date.now());
    actualizar({ ...ref.current, vidas });
    return vidas.actuales;
  }, [actualizar]);

  const terminarSesion = useCallback(
    (resultado: ResultadoSesion) => {
      const { estado: nuevo, efectos } = aplicarSesion(ref.current, resultado, Date.now());
      actualizar(nuevo);
      return efectos;
    },
    [actualizar],
  );

  const terminarCuaderno = useCallback(
    (xp: number, nuevaHoja: boolean) => {
      const { estado: nuevo, efectos } = aplicarCuaderno(ref.current, { xp, nuevaHoja }, Date.now());
      actualizar(nuevo);
      return efectos;
    },
    [actualizar],
  );

  const abrirCofre = useCallback(
    (unidad: number) => {
      const r = abrirCofreLib(ref.current, unidad, Date.now());
      actualizar(r.estado);
      return { gemas: r.gemas, logrosNuevos: r.logrosNuevos };
    },
    [actualizar],
  );

  const comprar = useCallback(
    (articulo: Articulo) => {
      const r = comprarLib(ref.current, articulo, Date.now());
      if (!r.error) actualizar(r.estado);
      return r.error;
    },
    [actualizar],
  );

  const quitarAccesorio = useCallback((ranura: Ranura) => actualizar(quitarAccesorioLib(ref.current, ranura)), [actualizar]);

  const usarComodin = useCallback(() => {
    const r = usarComodinLib(ref.current);
    if (r.ok) actualizar(r.estado);
    return r.ok;
  }, [actualizar]);

  const alternarSonido = useCallback(
    () => actualizar({ ...ref.current, ajustes: { ...ref.current.ajustes, sonido: !ref.current.ajustes.sonido } }),
    [actualizar],
  );

  const alternarAnimaciones = useCallback(
    () => actualizar({ ...ref.current, ajustes: { ...ref.current.ajustes, animaciones: !ref.current.ajustes.animaciones } }),
    [actualizar],
  );

  const reiniciar = useCallback(() => {
    borrarEstado();
    actualizar(estadoInicial(Date.now()));
  }, [actualizar]);

  const valor = useMemo(
    () => ({
      estado,
      crearPerfil,
      cambiarMeta,
      perderVida,
      terminarSesion,
      terminarCuaderno,
      abrirCofre,
      comprar,
      quitarAccesorio,
      usarComodin,
      alternarSonido,
      alternarAnimaciones,
      reiniciar,
    }),
    [estado, crearPerfil, cambiarMeta, perderVida, terminarSesion, terminarCuaderno, abrirCofre, comprar, quitarAccesorio, usarComodin, alternarSonido, alternarAnimaciones, reiniciar],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useJuego(): ContextoJuego {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useJuego debe usarse dentro de <ProveedorJuego>');
  return ctx;
}
