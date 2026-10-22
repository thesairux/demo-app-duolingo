import { useSyncExternalStore } from 'react';
import { estadoInstalacion, suscribirInstalacion, type EstadoInstalacion } from '../lib/instalar';

export function useInstalacion(): EstadoInstalacion {
  return useSyncExternalStore(suscribirInstalacion, estadoInstalacion);
}
