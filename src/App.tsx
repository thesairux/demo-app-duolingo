// Navegación: bienvenida, pestañas principales, guía, sesión y resultado.
import { useState } from 'react';
import { Navegacion, type Pestana } from './components/Navegacion';
import { useJuego } from './hooks/useJuego';
import { claveDia } from './lib/fechas';
import { coronasDe } from './lib/progreso';
import { pendientes } from './lib/repaso';
import type { ModoSesion } from './lib/sesion';
import { Bienvenida } from './screens/Bienvenida';
import { Camino, type AccionCamino } from './screens/Camino';
import { Cuaderno } from './screens/Cuaderno';
import { Guia } from './screens/Guia';
import { Logros } from './screens/Logros';
import { Perfil } from './screens/Perfil';
import { Practicar } from './screens/Practicar';
import { Resultado } from './screens/Resultado';
import { Sesion, type DatosResultado } from './screens/Sesion';
import { Tienda } from './screens/Tienda';

type Ruta =
  | { pantalla: 'pestanas' }
  | { pantalla: 'guia'; leccionId: string; luegoPracticar: boolean }
  | { pantalla: 'cuaderno' }
  | { pantalla: 'sesion'; modo: ModoSesion; intento: number }
  | { pantalla: 'resultado'; datos: DatosResultado };

export function App() {
  const { estado } = useJuego();
  const [ruta, setRuta] = useState<Ruta>({ pantalla: 'pestanas' });
  const [pestana, setPestana] = useState<Pestana>('camino');

  if (!estado.perfil) return <Bienvenida />;

  const empezar = (modo: ModoSesion) => setRuta({ pantalla: 'sesion', modo, intento: Date.now() });
  const volver = () => setRuta({ pantalla: 'pestanas' });

  function accionCamino(a: AccionCamino) {
    switch (a.tipo) {
      case 'practicar':
        return setPestana('practicar');
      case 'cuaderno':
        return setRuta({ pantalla: 'cuaderno' });
      case 'guia':
        return setRuta({ pantalla: 'guia', leccionId: a.leccionId, luegoPracticar: coronasDe(estado.lecciones, a.leccionId) === 0 });
      case 'leccion':
        return empezar({ tipo: 'leccion', leccionId: a.leccionId });
      case 'repaso':
        return empezar({ tipo: 'repaso-leccion', leccionId: a.leccionId });
      case 'legendario':
        return empezar({ tipo: 'legendario', leccionId: a.leccionId });
      case 'checkpoint':
        return empezar({ tipo: 'checkpoint', unidad: a.unidad });
    }
  }

  switch (ruta.pantalla) {
    case 'guia':
      return (
        <Guia
          leccionId={ruta.leccionId}
          luegoPracticar={ruta.luegoPracticar}
          onSalir={volver}
          onTerminar={() => (ruta.luegoPracticar ? empezar({ tipo: 'leccion', leccionId: ruta.leccionId }) : volver())}
        />
      );
    case 'sesion':
      return <Sesion key={ruta.intento} modo={ruta.modo} onSalir={volver} onTerminar={(datos) => setRuta({ pantalla: 'resultado', datos })} />;
    case 'resultado':
      return <Resultado datos={ruta.datos} onContinuar={volver} />;
    case 'cuaderno':
      return (
        <Cuaderno
          onSalir={() => {
            setPestana('practicar');
            volver();
          }}
        />
      );
  }

  const hayRepaso = pendientes(estado.ejercicios, claveDia()).length > 0;
  return (
    <>
      {pestana === 'camino' && <Camino onAccion={accionCamino} />}
      {pestana === 'practicar' && <Practicar onEmpezar={empezar} onCuaderno={() => setRuta({ pantalla: 'cuaderno' })} />}
      {pestana === 'logros' && <Logros />}
      {pestana === 'tienda' && <Tienda />}
      {pestana === 'perfil' && <Perfil onPracticar={() => setPestana('practicar')} />}
      <Navegacion
        actual={pestana}
        onCambiar={(p) => {
          setPestana(p);
          window.scrollTo({ top: 0 });
        }}
        avisos={{ practicar: hayRepaso }}
      />
    </>
  );
}
