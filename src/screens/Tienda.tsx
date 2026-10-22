// Pestaña Tienda: ayudas para las lecciones (comodines, Doble XP, vidas, protector) y ropa para Numi.
import { useState, type CSSProperties, type ReactNode } from 'react';
import { BarraSuperior } from '../components/BarraSuperior';
import { Boton } from '../components/Boton';
import { IconoCorazon, IconoEscudo, IconoGema, IconoRayo } from '../components/Iconos';
import { Numi } from '../components/Numi';
import { useAviso } from '../hooks/useAviso';
import { useJuego } from '../hooks/useJuego';
import { useReloj } from '../hooks/useReloj';
import { useSonido } from '../hooks/useSonido';
import type { Articulo } from '../lib/estado';
import {
  ACCESORIOS,
  GORROS,
  COMODINES_POR_COMPRA,
  MAX_COMODINES,
  MAX_PROTECTORES,
  MINUTOS_DOBLE_XP,
  NOMBRE_RANURA,
  PRECIO_COMODINES,
  PRECIO_DOBLE_XP,
  PRECIO_PROTECTOR,
  PRECIO_RECARGA_VIDAS,
  PRECIO_UNA_VIDA,
  type Gorro,
  type IdAccesorio,
  type Ranura,
} from '../lib/tienda';
import { recargar, VIDAS_MAX } from '../lib/vidas';

type Categoria = 'gorros' | Ranura;
const CATEGORIAS: { id: Categoria; nombre: string }[] = [
  { id: 'gorros', nombre: 'Birretes' },
  { id: 'cara', nombre: NOMBRE_RANURA.cara },
  { id: 'cuello', nombre: NOMBRE_RANURA.cuello },
  { id: 'ropa', nombre: NOMBRE_RANURA.ropa },
  { id: 'libro', nombre: NOMBRE_RANURA.libro },
];

const coloresGorro = (c: Gorro) => {
  const [base, sombra, brillo] = GORROS[c].colores;
  return { '--nm-hat': base, '--nm-hat-d': sombra, '--nm-hat-l': brillo } as CSSProperties;
};

export function Tienda() {
  const { estado, comprar, quitarAccesorio } = useJuego();
  const { avisar, elemento: aviso } = useAviso();
  const ahora = useReloj(5000);
  const vidas = recargar(estado.vidas, ahora).actuales;
  const sonar = useSonido();
  const [categoria, setCategoria] = useState<Categoria>('gorros');
  const { tienda } = estado;
  const minutosDoble = Math.ceil((tienda.dobleXPHasta - ahora) / 60_000);

  function intentar(articulo: Articulo, exito: string) {
    const gasta =
      articulo.tipo === 'gorro' ? !tienda.gorros.includes(articulo.gorro) : articulo.tipo === 'accesorio' ? !tienda.accesorios.includes(articulo.id) : true;
    const error = comprar(articulo);
    if (!error && gasta) sonar('moneda');
    avisar(error ?? exito);
  }

  return (
    <div className="min-h-full">
      <BarraSuperior />
      {aviso}
      <main className="mx-auto grid max-w-xl gap-6 px-4 pb-28 pt-5">
        <div className="grid gap-1">
          <h1 className="text-3xl font-bold">Tienda</h1>
          <p className="text-muted">
            Tienes{' '}
            <span className="inline-flex items-center gap-1 align-middle font-black" style={{ color: 'var(--u1)' }}>
              <IconoGema className="h-5 w-5" />
              {estado.gemas} gemas
            </span>
            . Las ganas al terminar lecciones, cumplir tu meta diaria, abrir cofres, conseguir logros y aprobar checkpoints y exámenes.
          </p>
        </div>

        <section className="grid gap-3" aria-labelledby="t-ayudas">
          <h2 id="t-ayudas" className="text-2xl font-bold">
            Ayudas
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TarjetaArticulo
              icono={<span className="grid h-10 w-10 place-items-center rounded-full bg-select-soft text-[13px] font-black text-select">50/50</span>}
              titulo="Comodín 50/50"
              detalle={`Esconde dos alternativas incorrectas en una pregunta. Vienen ${COMODINES_POR_COMPRA}. Tienes ${tienda.comodines} de ${MAX_COMODINES}.`}
              precio={PRECIO_COMODINES}
              deshabilitado={tienda.comodines + COMODINES_POR_COMPRA > MAX_COMODINES}
              onComprar={() => intentar({ tipo: 'comodines' }, `¡Listo! Ahora tienes ${tienda.comodines + COMODINES_POR_COMPRA} comodines.`)}
            />
            <TarjetaArticulo
              icono={<IconoRayo className="h-9 w-9" />}
              titulo="Doble XP"
              detalle={minutosDoble > 0 ? `¡Activo! Quedan ${minutosDoble} min.` : `Durante ${MINUTOS_DOBLE_XP} minutos ganas el doble de XP en todo lo que juegues.`}
              precio={PRECIO_DOBLE_XP}
              deshabilitado={minutosDoble > 0}
              onComprar={() => intentar({ tipo: 'doble-xp' }, `¡Doble XP activado por ${MINUTOS_DOBLE_XP} minutos!`)}
            />
            <TarjetaArticulo
              icono={<IconoCorazon className="h-9 w-9" />}
              titulo="Una vida"
              detalle={vidas >= VIDAS_MAX ? 'Tus vidas están llenas.' : `Suma una vida al tiro. Ahora tienes ${vidas}.`}
              precio={PRECIO_UNA_VIDA}
              deshabilitado={vidas >= VIDAS_MAX}
              onComprar={() => intentar({ tipo: 'una-vida' }, '¡Una vida más!')}
            />
            <TarjetaArticulo
              icono={<IconoCorazon className="h-9 w-9" />}
              titulo="Recargar vidas"
              detalle={vidas >= VIDAS_MAX ? 'Tus vidas están llenas.' : `Vuelves a tener ${VIDAS_MAX} vidas. Ahora tienes ${vidas}.`}
              precio={PRECIO_RECARGA_VIDAS}
              deshabilitado={vidas >= VIDAS_MAX}
              onComprar={() => intentar({ tipo: 'recarga-vidas' }, '¡Vidas recargadas!')}
            />
            <TarjetaArticulo
              icono={<IconoEscudo className="h-9 w-9" />}
              titulo="Protector de racha"
              detalle={`Si un día no practicas, protege tu racha. Tienes ${estado.racha.protectores} de ${MAX_PROTECTORES}.`}
              precio={PRECIO_PROTECTOR}
              deshabilitado={estado.racha.protectores >= MAX_PROTECTORES}
              onComprar={() => intentar({ tipo: 'protector' }, '¡Protector listo! Tu racha está más segura.')}
            />
          </div>
        </section>

        <section className="grid gap-3" aria-labelledby="t-numi">
          <h2 id="t-numi" className="text-2xl font-bold">
            Viste a Numi
          </h2>
          <div className="grid grid-cols-[104px_minmax(0,1fr)] items-center gap-4 rounded-[22px] border-2 border-line bg-surface p-4">
            <Numi expresion="celebrando" className="h-auto w-[104px]" etiqueta="Numi con su ropa actual" />
            <div className="grid gap-1.5">
              <p className="font-display text-lg font-semibold">Así se ve Numi hoy</p>
              <ul className="grid gap-1 text-sm text-muted">
                <li>{GORROS[tienda.gorro].nombre}</li>
                {(['cara', 'cuello', 'ropa', 'libro'] as Ranura[]).map((r) => {
                  const id = tienda.atuendo[r];
                  return id ? <li key={r}>{ACCESORIOS[id].nombre}</li> : null;
                })}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Categorías de ropa">
            {CATEGORIAS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={categoria === c.id}
                onClick={() => setCategoria(c.id)}
                className="opcion rounded-full px-4 py-1.5 text-sm font-extrabold"
              >
                {c.nombre}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categoria === 'gorros'
              ? (Object.keys(GORROS) as Gorro[]).map((c) => {
                  const datos = GORROS[c];
                  const tiene = tienda.gorros.includes(c);
                  return (
                    <TarjetaRopa
                      key={c}
                      vista={
                        <span style={coloresGorro(c)}>
                          <Numi expresion="feliz" className="h-auto w-24" />
                        </span>
                      }
                      nombre={datos.nombre}
                      precio={datos.precio}
                      estado={tienda.gorro === c ? 'puesto' : tiene ? 'tiene' : 'no-tiene'}
                      onPoner={() => intentar({ tipo: 'gorro', gorro: c }, tiene ? `Numi ahora usa el ${datos.nombre.toLowerCase()}.` : `¡Compraste el ${datos.nombre.toLowerCase()}!`)}
                    />
                  );
                })
              : (Object.keys(ACCESORIOS) as IdAccesorio[])
                  .filter((id) => ACCESORIOS[id].ranura === categoria)
                  .map((id) => {
                    const datos = ACCESORIOS[id];
                    const tiene = tienda.accesorios.includes(id);
                    const puesto = tienda.atuendo[datos.ranura] === id;
                    return (
                      <TarjetaRopa
                        key={id}
                        vista={<Numi expresion="feliz" className="h-auto w-24" atuendo={{ [datos.ranura]: id }} />}
                        nombre={datos.nombre}
                        precio={datos.precio}
                        estado={puesto ? 'puesto' : tiene ? 'tiene' : 'no-tiene'}
                        onPoner={() => intentar({ tipo: 'accesorio', id }, tiene ? `Numi se puso: ${datos.nombre.toLowerCase()}.` : `¡Compraste: ${datos.nombre.toLowerCase()}!`)}
                        onQuitar={datos.ranura === 'libro' ? undefined : () => quitarAccesorio(datos.ranura)}
                      />
                    );
                  })}
          </div>
        </section>
      </main>
    </div>
  );
}

interface PropsArticulo {
  icono: ReactNode;
  titulo: string;
  detalle: string;
  precio: number;
  deshabilitado: boolean;
  onComprar: () => void;
}

function TarjetaArticulo({ icono, titulo, detalle, precio, deshabilitado, onComprar }: PropsArticulo) {
  return (
    <section className="grid grid-cols-[48px_minmax(0,1fr)] items-start gap-3 rounded-[20px] border-2 border-line bg-surface p-4">
      <span className="grid place-items-center pt-1">{icono}</span>
      <div className="grid gap-2">
        <div>
          <h3 className="font-display text-xl font-semibold">{titulo}</h3>
          <p className="text-sm text-muted">{detalle}</p>
        </div>
        <Boton className="w-fit px-4! py-2.5! text-[13px]!" disabled={deshabilitado} onClick={onComprar} aria-label={`Comprar ${titulo} por ${precio} gemas`}>
          <IconoGema className="h-4 w-4" />
          {precio}
        </Boton>
      </div>
    </section>
  );
}

interface PropsRopa {
  vista: ReactNode;
  nombre: string;
  precio: number;
  estado: 'puesto' | 'tiene' | 'no-tiene';
  onPoner: () => void;
  onQuitar?: () => void;
}

function TarjetaRopa({ vista, nombre, precio, estado, onPoner, onQuitar }: PropsRopa) {
  const boton = 'w-full px-3! py-2! text-[13px]!';
  return (
    <div className={`grid justify-items-center gap-2 rounded-[20px] border-2 bg-surface p-3 text-center ${estado === 'puesto' ? 'border-select' : 'border-line'}`}>
      {vista}
      <p className="font-display text-lg font-semibold leading-tight">{nombre}</p>
      {estado === 'puesto' ? (
        onQuitar ? (
          <Boton variante="suave" className={boton} onClick={onQuitar}>
            Quitárselo
          </Boton>
        ) : (
          <p className="py-2 text-sm font-extrabold text-select">Lo tiene puesto</p>
        )
      ) : estado === 'tiene' ? (
        <Boton variante="suave" className={boton} onClick={onPoner}>
          Ponérselo
        </Boton>
      ) : (
        <Boton className={boton} onClick={onPoner} aria-label={`Comprar ${nombre} por ${precio} gemas`}>
          <IconoGema className="h-4 w-4" />
          {precio}
        </Boton>
      )}
    </div>
  );
}
