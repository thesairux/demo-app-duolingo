// Revisa que el banco de preguntas esté bien armado y sea sencillo. Uso: npm run validar
import { readdirSync, readFileSync } from 'node:fs';

const CARPETA = new URL('../src/content/', import.meta.url);
const TIPOS = [
  'seleccion_multiple',
  'verdadero_falso',
  'completar',
  'unir_pares',
  'ordenar',
  'caso_practico',
  'identificar_error',
  'clasificar',
  'recta_numerica',
  'reloj',
  'fraccion_visual',
  'bloques',
];
/** Máximo de palabras por campo, para que se lea en un celular sin esfuerzo. */
const MAX = { enunciado: 20, caso: 35, alternativa: 9, explicacion: 35, tarjeta: 35, ejemplo: 25, definicion: 35 };

const errores = [];
const avisar = (donde, msg) => errores.push(`${donde}: ${msg}`);
const palabras = (t) => String(t ?? '').trim().split(/\s+/).filter(Boolean).length;
const repetidos = (lista) => lista.length !== new Set(lista).size;

function largo(donde, campo, texto, max) {
  if (typeof texto !== 'string' || !texto.trim()) return avisar(donde, `falta ${campo}`);
  const n = palabras(texto);
  if (n > max) avisar(donde, `${campo} tiene ${n} palabras (máximo ${max}): «${texto}»`);
}

function fuenteValida(donde, f) {
  if (!f || typeof f.archivo !== 'string' || !f.archivo.trim()) avisar(donde, 'falta la fuente (archivo)');
}

function revisarMarca(donde, obj) {
  if (typeof obj.revisar !== 'boolean') avisar(donde, 'falta "revisar" (true o false)');
  if (obj.revisar && !obj.notaRevision) avisar(donde, 'tiene "revisar": true pero no explica el motivo en "notaRevision"');
}

function ejercicio(e, u, l, ids) {
  const donde = e.id ?? `u${u}-l${l}-?`;
  if (!/^u\d+-l\d+-e\d{2}$/.test(e.id ?? '')) avisar(donde, 'el id debe ser u{unidad}-l{lección}-e{nn}');
  else if (!e.id.startsWith(`u${u}-l${l}-`)) avisar(donde, `el id no coincide con la unidad ${u} y la lección ${l}`);
  if (ids.has(e.id)) avisar(donde, 'id repetido');
  ids.add(e.id);
  if (e.unidad !== u || e.leccion !== l) avisar(donde, '"unidad" o "leccion" no coinciden con el lugar donde está');
  if (!TIPOS.includes(e.tipo)) return avisar(donde, `tipo desconocido: ${e.tipo}`);
  if (![1, 2, 3].includes(e.dificultad)) avisar(donde, 'la dificultad debe ser 1, 2 o 3');
  if (!e.concepto) avisar(donde, 'falta "concepto"');
  largo(donde, 'el enunciado', e.enunciado, MAX.enunciado);
  largo(donde, 'la explicación', e.explicacion, MAX.explicacion);
  fuenteValida(donde, e.fuente);
  revisarMarca(donde, e);
  const alternativas = (lista, nombre) => lista.forEach((t) => largo(donde, nombre, t, MAX.alternativa));

  switch (e.tipo) {
    case 'caso_practico':
      largo(donde, 'el caso', e.caso, MAX.caso);
    // falls through
    case 'seleccion_multiple':
      if (!Array.isArray(e.opciones) || e.opciones.length !== 4) return avisar(donde, 'debe tener exactamente 4 alternativas');
      if (!Number.isInteger(e.respuesta) || e.respuesta < 0 || e.respuesta > 3) avisar(donde, 'la respuesta debe ser la posición de la correcta (0 a 3)');
      if (repetidos(e.opciones)) avisar(donde, 'hay alternativas repetidas');
      alternativas(e.opciones, 'una alternativa');
      break;
    case 'verdadero_falso':
      if (typeof e.respuesta !== 'boolean') avisar(donde, 'la respuesta debe ser true o false');
      if (e.justificacion) avisar(donde, 'verdadero o falso va en un solo paso, sin justificación');
      break;
    case 'completar':
      if (e.enunciado.split('___').length !== 2) avisar(donde, 'el enunciado debe tener un solo ___');
      if (!Array.isArray(e.banco) || e.banco.length < 3 || e.banco.length > 4) return avisar(donde, 'el banco debe tener 3 o 4 fichas');
      if (!e.banco.includes(e.respuesta)) avisar(donde, 'la respuesta no está en el banco');
      if (repetidos(e.banco)) avisar(donde, 'hay fichas repetidas');
      alternativas(e.banco, 'una ficha');
      break;
    case 'unir_pares':
      if (!Array.isArray(e.pares) || e.pares.length < 3 || e.pares.length > 4) return avisar(donde, 'debe tener 3 o 4 pares');
      if (repetidos(e.pares.map((p) => p.a)) || repetidos(e.pares.map((p) => p.b))) avisar(donde, 'hay lados de pares repetidos');
      alternativas(e.pares.flatMap((p) => [p.a, p.b]), 'un par');
      break;
    case 'ordenar':
      if (!Array.isArray(e.pasos) || e.pasos.length < 3 || e.pasos.length > 4) return avisar(donde, 'debe tener 3 o 4 pasos');
      if (repetidos(e.pasos)) avisar(donde, 'hay pasos repetidos');
      alternativas(e.pasos, 'un paso');
      break;
    case 'identificar_error':
      if (!Array.isArray(e.segmentos) || e.segmentos.length < 2 || e.segmentos.length > 3) return avisar(donde, 'debe tener 2 o 3 trozos');
      if (!Number.isInteger(e.respuesta) || !e.segmentos[e.respuesta]) avisar(donde, 'la respuesta debe ser la posición del trozo equivocado');
      if (!e.correccion) avisar(donde, 'falta la corrección');
      break;
    case 'clasificar': {
      if (!Array.isArray(e.categorias) || e.categorias.length !== 2) return avisar(donde, 'debe tener 2 categorías');
      if (!Array.isArray(e.elementos) || e.elementos.length < 4 || e.elementos.length > 5) return avisar(donde, 'debe tener 4 o 5 elementos');
      if (e.elementos.some((el) => el.categoria !== 0 && el.categoria !== 1)) avisar(donde, 'cada elemento debe ir en la categoría 0 o 1');
      if (!e.categorias.every((_, i) => e.elementos.some((el) => el.categoria === i))) avisar(donde, 'una categoría quedó vacía');
      if (repetidos(e.elementos.map((el) => el.texto))) avisar(donde, 'hay elementos repetidos');
      alternativas(e.elementos.map((el) => el.texto), 'un elemento');
      break;
    }
    case 'recta_numerica': {
      const { min, max, paso, etiquetaCada, respuesta } = e;
      if (![min, max, paso, respuesta].every((n) => typeof n === 'number') || !(paso > 0) || !(max > min)) return avisar(donde, 'la recta necesita min < max, paso > 0 y respuesta');
      const rayitas = (max - min) / paso;
      if (Math.abs(rayitas - Math.round(rayitas)) > 1e-9 || rayitas < 4 || rayitas > 20) avisar(donde, `entre min y max deben caber de 4 a 20 rayitas (hay ${rayitas})`);
      const lugar = (respuesta - min) / paso;
      if (Math.abs(lugar - Math.round(lugar)) > 1e-9 || respuesta <= min || respuesta > max) avisar(donde, 'la respuesta debe caer en una rayita, después de min y hasta max');
      if (!Number.isInteger(etiquetaCada) || etiquetaCada < 1) avisar(donde, 'etiquetaCada debe ser un entero de 1 o más');
      break;
    }
    case 'reloj':
      if (!Number.isInteger(e.hora) || e.hora < 1 || e.hora > 12) avisar(donde, 'la hora debe ser de 1 a 12');
      if (!Number.isInteger(e.minutos) || e.minutos < 0 || e.minutos > 55 || e.minutos % 5) avisar(donde, 'los minutos deben ser múltiplo de 5, de 0 a 55');
      if (e.hora === 12 && e.minutos === 0) avisar(donde, 'el reloj parte en las 12:00, así que esa hora no sirve como respuesta');
      break;
    case 'fraccion_visual':
      if (!['circulo', 'barra'].includes(e.figura)) avisar(donde, 'la figura debe ser "circulo" o "barra"');
      if (!Number.isInteger(e.partes) || e.partes < 2 || e.partes > 12) avisar(donde, 'las partes deben ser de 2 a 12');
      if (!Number.isInteger(e.respuesta) || e.respuesta < 1 || e.respuesta > e.partes) avisar(donde, 'la respuesta debe ser de 1 a la cantidad de partes');
      break;
    case 'bloques':
      if (!Number.isInteger(e.respuesta) || e.respuesta < 1 || e.respuesta > 9999) avisar(donde, 'el número a armar debe ser de 1 a 9.999');
      break;
  }
}

const archivos = readdirSync(CARPETA).filter((f) => /^unidad-\d+\.json$/.test(f));
const ids = new Set();
let preguntas = 0;
let lecciones = 0;

for (const archivo of archivos) {
  const u = JSON.parse(readFileSync(new URL(archivo, CARPETA), 'utf8'));
  const donde = archivo;
  if (`unidad-${u.unidad}.json` !== archivo) avisar(donde, `"unidad" es ${u.unidad}, pero el archivo se llama ${archivo}`);
  if (!u.titulo || !u.descripcion) avisar(donde, 'falta el título o la descripción');
  if (!Array.isArray(u.lecciones) || u.lecciones.length === 0) {
    avisar(donde, 'no tiene lecciones');
    continue;
  }
  if (!Number.isInteger(u.cofreDespuesDe) || u.cofreDespuesDe < 1 || u.cofreDespuesDe > u.lecciones.length) {
    avisar(donde, `"cofreDespuesDe" debe ser un número de lección entre 1 y ${u.lecciones.length}`);
  }
  u.lecciones.forEach((l, i) => {
    const dl = l.id ?? `${archivo} lección ${i + 1}`;
    lecciones += 1;
    if (l.id !== `u${u.unidad}-l${i + 1}` || l.numero !== i + 1) avisar(dl, `el id debe ser u${u.unidad}-l${i + 1} y el número ${i + 1}`);
    if (!l.titulo || !l.objetivo) avisar(dl, 'falta el título o el objetivo');
    if (!['leccion', 'caso_practico'].includes(l.tipoNodo)) avisar(dl, 'tipoNodo debe ser "leccion" o "caso_practico"');
    if (!Array.isArray(l.guia) || l.guia.length < 2 || l.guia.length > 6) avisar(dl, 'la guía debe tener de 2 a 6 tarjetas');
    (l.guia ?? []).forEach((t, k) => {
      const dt = `${dl} tarjeta ${k + 1}`;
      if (!t.titulo) avisar(dt, 'falta el título');
      largo(dt, 'el texto', t.texto, MAX.tarjeta);
      if (t.ejemplo !== undefined) largo(dt, 'el ejemplo', t.ejemplo, MAX.ejemplo);
      if (!Array.isArray(t.fuentes) || t.fuentes.length === 0) avisar(dt, 'falta la fuente');
      else t.fuentes.forEach((f) => fuenteValida(dt, f));
      revisarMarca(dt, t);
    });
    const ejercicios = l.ejercicios ?? [];
    if (ejercicios.length < 10) avisar(dl, `tiene ${ejercicios.length} preguntas (mínimo 10)`);
    if (ejercicios.filter((e) => e.dificultad === 1).length < 5) avisar(dl, 'necesita al menos 5 preguntas fáciles (dificultad 1)');
    ejercicios.forEach((e) => ejercicio(e, u.unidad, i + 1, ids));
    preguntas += ejercicios.length;
  });
}

const glosario = JSON.parse(readFileSync(new URL('glosario.json', CARPETA), 'utf8'));
const formas = new Set();
for (const t of glosario) {
  const donde = `glosario «${t.termino}»`;
  if (!t.termino) avisar(donde, 'falta el término');
  largo(donde, 'la definición', t.definicion, MAX.definicion);
  if (!Number.isInteger(t.unidad)) avisar(donde, 'falta la unidad');
  revisarMarca(donde, t);
  for (const forma of [t.termino, ...(t.alias ?? [])]) {
    const clave = String(forma).toLowerCase();
    if (formas.has(clave)) avisar(donde, `la forma «${forma}» ya está en otro término`);
    formas.add(clave);
  }
}

if (errores.length) {
  console.error(`✗ ${errores.length} ${errores.length === 1 ? 'problema' : 'problemas'}:\n`);
  for (const e of errores) console.error(`  · ${e}`);
  process.exit(1);
}
console.log(`✓ Contenido en orden: ${archivos.length} unidades, ${lecciones} lecciones, ${preguntas} preguntas y ${glosario.length} palabras en el glosario.`);
