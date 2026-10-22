// Muestra el ejercicio que corresponda según su tipo, con su etiqueta arriba.
import type { Ejercicio, TipoEjercicio } from '../../content/types';
import { Bloques } from './Bloques';
import { Clasificar } from './Clasificar';
import { Completar } from './Completar';
import { EncontrarError } from './EncontrarError';
import { FraccionVisual } from './FraccionVisual';
import { Opciones } from './Opciones';
import { Ordenar } from './Ordenar';
import { Pares } from './Pares';
import { RectaNumerica } from './RectaNumerica';
import { Reloj } from './Reloj';
import { VerdaderoFalso } from './VerdaderoFalso';
import type { PropsEjercicio } from './comun';

export const NOMBRE_TIPO: Record<TipoEjercicio, string> = {
  seleccion_multiple: 'Elige la respuesta',
  caso_practico: 'Problema',
  completar: 'Completa',
  verdadero_falso: '¿Verdadero o falso?',
  unir_pares: 'Une los pares',
  ordenar: 'Ordena',
  identificar_error: 'Encuentra el error',
  clasificar: 'Clasifica',
  recta_numerica: 'Ubica en la recta',
  reloj: 'Mueve los punteros',
  fraccion_visual: 'Pinta la fracción',
  bloques: 'Arma con bloques',
};

export function VistaEjercicio(props: PropsEjercicio<Ejercicio>) {
  const { ej } = props;
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12.5px] font-black uppercase tracking-[.09em]" style={{ color: `var(--u${ej.unidad})` }}>
          {NOMBRE_TIPO[ej.tipo]}
        </span>
      </div>
      {cuerpo(props)}
    </div>
  );
}

function cuerpo(props: PropsEjercicio<Ejercicio>) {
  const { ej } = props;
  switch (ej.tipo) {
    case 'seleccion_multiple':
    case 'caso_practico':
      return <Opciones {...props} ej={ej} />;
    case 'verdadero_falso':
      return <VerdaderoFalso {...props} ej={ej} />;
    case 'completar':
      return <Completar {...props} ej={ej} />;
    case 'unir_pares':
      return <Pares {...props} ej={ej} />;
    case 'ordenar':
      return <Ordenar {...props} ej={ej} />;
    case 'identificar_error':
      return <EncontrarError {...props} ej={ej} />;
    case 'clasificar':
      return <Clasificar {...props} ej={ej} />;
    case 'recta_numerica':
      return <RectaNumerica {...props} ej={ej} />;
    case 'reloj':
      return <Reloj {...props} ej={ej} />;
    case 'fraccion_visual':
      return <FraccionVisual {...props} ej={ej} />;
    case 'bloques':
      return <Bloques {...props} ej={ej} />;
  }
}
