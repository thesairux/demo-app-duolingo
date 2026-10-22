// Muestra el ejercicio que corresponda según su tipo, con su etiqueta arriba.
import type { Ejercicio, TipoEjercicio } from '../../content/types';
import { Clasificar } from './Clasificar';
import { Completar } from './Completar';
import { EncontrarError } from './EncontrarError';
import { Opciones } from './Opciones';
import { Ordenar } from './Ordenar';
import { Pares } from './Pares';
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
  }
}
