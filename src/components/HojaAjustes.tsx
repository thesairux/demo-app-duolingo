// Ajustes: meta diaria, sonido, animaciones, instalar la app y reiniciar el progreso.
import { useState } from 'react';
import { useInstalacion } from '../hooks/useInstalacion';
import { useJuego } from '../hooks/useJuego';
import { METAS, type MetaDiaria } from '../lib/estado';
import { instalar } from '../lib/instalar';
import { reproducir } from '../lib/sonido';
import { Boton } from './Boton';
import { Hoja } from './Hoja';

const NOMBRE_META: Record<MetaDiaria, string> = { 10: 'Tranqui', 20: 'Normal', 30: 'Seria', 50: 'Intensa' };

function Interruptor({ id, titulo, detalle, activo, onCambiar }: { id: string; titulo: string; detalle: string; activo: boolean; onCambiar: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t-2 border-line pt-4">
      <div>
        <p id={`${id}-titulo`} className="font-extrabold">
          {titulo}
        </p>
        <p className="text-sm text-muted">{detalle}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={activo}
        aria-labelledby={`${id}-titulo`}
        onClick={onCambiar}
        className="relative h-8 w-14 flex-none rounded-full transition-colors"
        style={{ background: activo ? 'var(--ok)' : 'var(--line-deep)' }}
      >
        <span className="absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-[left]" style={{ left: activo ? 'calc(100% - 28px)' : '4px' }} />
      </button>
    </div>
  );
}

function Instalar() {
  const estado = useInstalacion();
  const texto = {
    instalada: 'Ya la estás usando como app. Funciona sin internet.',
    disponible: 'Agrégala a tu pantalla de inicio. Abre más rápido y funciona sin internet.',
    ios: 'En Safari, toca el botón Compartir y elige "Agregar a inicio". Después funciona sin internet.',
    manual: 'Abre el menú del navegador (⋮) y elige "Instalar app" o "Agregar a la pantalla de inicio". Después funciona sin internet.',
    embebida: 'Desde este enlace no se puede instalar, pero puedes jugar igual. Tu progreso queda guardado en este navegador.',
  }[estado];
  return (
    <div className="grid gap-2 border-t-2 border-line pt-4">
      <p className="font-extrabold">Instalar en tu celular</p>
      <p className="text-sm text-muted">{texto}</p>
      {estado === 'disponible' && (
        <Boton variante="suave" onClick={() => void instalar()}>
          Instalar Numi Mates
        </Boton>
      )}
    </div>
  );
}

export function HojaAjustes({ abierta, onCerrar }: { abierta: boolean; onCerrar: () => void }) {
  const { estado, cambiarMeta, alternarSonido, alternarAnimaciones, reiniciar } = useJuego();
  const [confirmar, setConfirmar] = useState(false);
  const cerrar = () => {
    setConfirmar(false);
    onCerrar();
  };

  return (
    <Hoja abierta={abierta} onCerrar={cerrar} titulo="Ajustes">
      <div className="grid max-h-[80vh] gap-5 overflow-y-auto">
        <h2 className="text-2xl font-bold">Ajustes</h2>
        <div className="grid gap-2">
          <p className="font-extrabold">Meta diaria</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {METAS.map((m) => (
              <button key={m} type="button" aria-pressed={estado.perfil?.metaDiaria === m} onClick={() => cambiarMeta(m)} className="opcion rounded-2xl px-3 py-2.5 text-center">
                <span className="block font-display text-lg font-semibold">{NOMBRE_META[m]}</span>
                <span className="text-sm font-bold text-muted">{m} XP</span>
              </button>
            ))}
          </div>
        </div>
        <Interruptor
          id="ajuste-sonido"
          titulo="Sonidos"
          detalle="Sonidos cortos al acertar, al fallar y al terminar."
          activo={estado.ajustes.sonido}
          onCambiar={() => {
            // Al activarlo suena un acierto, para que se note que funciona.
            if (!estado.ajustes.sonido) reproducir('acierto');
            alternarSonido();
          }}
        />
        <Interruptor
          id="ajuste-animaciones"
          titulo="Animaciones"
          detalle="Desactívalas si te marean o si la app anda lenta."
          activo={estado.ajustes.animaciones}
          onCambiar={alternarAnimaciones}
        />
        <Instalar />
        <div className="grid gap-2 border-t-2 border-line pt-4">
          <p className="font-extrabold">Reiniciar progreso</p>
          <p className="text-sm text-muted">Borra tus coronas, XP, racha, gemas y logros de este dispositivo. No se puede deshacer.</p>
          {confirmar ? (
            <div className="grid grid-cols-2 gap-2">
              <Boton variante="suave" onClick={() => setConfirmar(false)}>
                Cancelar
              </Boton>
              <Boton
                variante="error"
                onClick={() => {
                  reiniciar();
                  cerrar();
                }}
              >
                Sí, borrar todo
              </Boton>
            </div>
          ) : (
            <Boton variante="suave" onClick={() => setConfirmar(true)}>
              Reiniciar progreso
            </Boton>
          )}
        </div>
        <Boton ancho onClick={cerrar}>
          Listo
        </Boton>
      </div>
    </Hoja>
  );
}
