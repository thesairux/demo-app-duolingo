# Numi Mates · Demo

Demo de catálogo: una app con mecánicas de juego (estilo Duolingo) para practicar la **Matemática de 4° básico**. Los niños y niñas de 9 y 10 años juegan desde el celular o el computador con la ayuda de Numi, una castora con birrete y un libro de números.

Está construida sobre el mismo motor que [Lexi Laboral](https://github.com/thesairux/lexi-laboral): solo cambian la marca, la mascota y el contenido. Por eso sirve para mostrar que **el mismo juego se adapta a cualquier asignatura, curso o tema**.

- 4 unidades, 12 lecciones y 120 preguntas basadas en las Bases Curriculares de Matemática de 4° básico (Mineduc).
- Antes de cada lección, un resumen rápido de 3 tarjetas.
- Cada nivel tiene solo 5 preguntas, para que den ganas de terminarlo.
- 8 tipos de pregunta, coronas, vidas, racha, gemas, tienda, logros, repaso inteligente y modo examen.
- **Resuelve en tu cuaderno:** hojas de 4 ejercicios para hacer con lápiz. El niño le saca una foto a su cuaderno, Claude lee lo que escribió y la app corrige cada ejercicio y muestra cómo se hace el que quedó mal.

## Cómo correrla

Necesitas [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
npm run dev
```

Después abre la dirección que aparece en la terminal (normalmente http://localhost:5173).

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Abre la app en modo desarrollo |
| `npm run build` | Revisa los tipos y genera la versión final en `dist/` |
| `npm run preview` | Muestra la versión final (con instalación y uso sin internet) |
| `npm test` | Corre las pruebas de la lógica del juego y del banco de preguntas |
| `npm run validar` | Revisa que el banco de preguntas esté bien armado y sea sencillo |
| `npm run iconos` | Vuelve a generar los íconos de `public/` (necesita [Playwright](https://playwright.dev) con Chromium) |

## Publicarla gratis

1. Corre `npm run build`. La carpeta lista para subir es `dist/`.
2. Entra a **app.netlify.com/drop**, crea una cuenta gratis y arrastra la carpeta `dist` completa.
3. Netlify te da un enlace del tipo `https://nombre.netlify.app`, que puedes cambiar en **Project configuration → General → Change project name**.
4. Para actualizarla, corre `npm run build` de nuevo y arrastra otra vez la carpeta `dist` en **Deploys**.

Las rutas son relativas, así que `dist/` también funciona dentro de una subcarpeta de cualquier hosting. La app es una PWA: desde el celular se puede instalar en la pantalla de inicio y funciona sin internet después de abrirla una vez.

Publicada así (arrastrando `dist`), todo funciona menos la revisión con foto del cuaderno: en su lugar aparece «Revisar yo mismo». Para activarla, mira la sección siguiente.

## Resuelve en tu cuaderno (revisión con foto)

Está en **Practicar → Resuelve en tu cuaderno** y en un acceso directo arriba del camino.

1. El niño elige un tema: sumas y restas hasta 1.000, multiplicaciones por 1 cifra, divisiones (algunas con resto), fracciones con igual denominador o de todo un poco.
2. La app arma al azar 4 ejercicios. El niño los copia en su cuaderno, los resuelve y encierra cada resultado en un círculo.
3. Toca **Sacar foto al cuaderno**: en el celular se abre la cámara. También puede elegir una foto guardada.
4. Claude **solo lee** lo que escribió en cada ejercicio. La corrección la hace la app comparando con la respuesta exacta, así que no hay errores de cálculo. Los que quedaron mal muestran cómo se resuelven; los que no se pudieron leer piden otra foto.
5. Gana 2 XP por ejercicio bien y 5 más si la hoja sale perfecta. Volver a sacar foto después de corregir solo suma lo que mejoró. Revisar 3 hojas da el logro «Cuaderno estrella».

Si no hay quién lea la foto, la pantalla ofrece **Revisar yo mismo**: muestra las respuestas y cómo se hacen, y el niño marca cuáles le salieron igual (1 XP cada una).

Quién lee la foto depende de dónde se abra la app:

| Dónde | Cómo se lee la foto |
|---|---|
| Demo publicada en claude.ai | Con Claude, usando la cuenta de quien abre la demo. La primera vez pide permiso. |
| Tu sitio en Netlify, conectado al repositorio | Con el corrector `netlify/functions/corregir.mts`, que llama a la API de Claude con tu clave. |
| Netlify Drop, `npm run preview` u otro hosting | No hay corrector: solo «Revisar yo mismo». |

Para activar el corrector en tu sitio:

1. Crea una clave en [console.anthropic.com](https://console.anthropic.com) (API keys).
2. Sube este proyecto a un repositorio de GitHub y, en Netlify, usa **Add new project → Import an existing project** con ese repositorio. `netlify.toml` ya trae el comando de compilación, la carpeta `dist` y la carpeta de funciones.
3. En **Project configuration → Environment variables**, agrega `ANTHROPIC_API_KEY` con tu clave y vuelve a publicar.

La app detecta sola el corrector en `/api/corregir` (si lo publicas en otra dirección, compila con `VITE_CORRECTOR_URL=...`). Usa el modelo `claude-opus-5-5`, con respuesta en formato JSON fijo y con reintento automático en otro modelo si los filtros de seguridad rechazan una foto (`fallbacks: "default"`). Cada foto revisada es una llamada a la API que se cobra en tu cuenta de Anthropic. La dirección del corrector es pública: cualquiera que tenga el enlace de la app puede usarla, así que conviene fijar un límite de gasto en la consola de Anthropic. El corrector solo acepta enunciados con números y signos, y fotos de hasta unos 4,5 MB.

## Qué hay en cada carpeta

| Carpeta | Contenido |
|---|---|
| `src/content/` | Preguntas: `unidad-1.json` a `unidad-4.json`, `glosario.json` y el formato en `types.ts` |
| `src/lib/` | Lógica del juego: XP, vidas, racha, sesiones, repaso espaciado, logros, tienda, sonidos y progreso |
| `src/hooks/` | Estado del jugador (guardado en el dispositivo) y utilidades |
| `src/components/` | Numi y su ropa, botones, barra superior, nodos del camino, confeti, gráficos, glosario y los 8 tipos de ejercicio |
| `src/screens/` | Pantallas: bienvenida, camino, resumen, sesión, resultado, practicar, logros, tienda y perfil |
| `public/` | Íconos de la app y `manifest.webmanifest` (instalación como app) |
| `scripts/` | `validar-contenido.mjs`, `iconos.mjs` y la plantilla del service worker (`sw.js`) |
| `netlify/functions/` | `corregir.mts`: el corrector que lee las fotos del cuaderno con la API de Claude |
| `TEMARIO.md` | Temario, objetivos de aprendizaje y decisiones del proyecto |

## Reglas del juego

- **Resumen antes de practicar:** cada lección parte con 3 tarjetas cortas. Se pueden volver a ver desde el camino.
- **Niveles de 5 preguntas.** Lo que fallas se repite al final del nivel.
- **Coronas:** cada lección tiene 3 niveles: "Lo básico" (solo preguntas fáciles), "Un poco más" y "Problemas de la vida real". Ganar la primera corona desbloquea la lección siguiente.
- **XP:** 1 por acierto y 1 extra desde el tercer acierto seguido. Al terminar un nivel se suman 5 por completarlo, 5 si no hubo errores y 3 si fue rápido.
- **Vidas:** 5. Se pierde una por error en lecciones, checkpoints y desafíos legendarios. Se recupera una cada 30 minutos y una por cada repaso terminado.
- **Racha y meta diaria:** la racha suma un día por cada día con al menos una lección; la meta diaria es de 10, 20, 30 o 50 XP.
- **Desafío legendario:** con 3 coronas, 5 preguntas difíciles con máximo 1 error. Si lo superas, el nodo queda dorado.
- **Checkpoint:** al final de cada unidad, 8 preguntas de todas sus lecciones. Con 70 % se aprueba la unidad completa.
- **Practicar y modo examen:** repaso inteligente de lo que cuesta, y exámenes de 5, 10 o 15 preguntas que se aprueban con 60 %.
- **Glosario:** las palabras clave (numerador, perímetro, centena…) aparecen subrayadas; al tocarlas se ve su definición.
- **Gemas y tienda:** las gemas se ganan al terminar lecciones, con la meta diaria, los logros, los checkpoints y los cofres. En la tienda hay comodines 50/50, Doble XP, vidas, protector de racha, birretes de colores y ropa para Numi. No hay compras con dinero real.

En **Perfil → Ajustes** se cambia la meta diaria, se silencian los sonidos, se apagan las animaciones y se reinicia el progreso.

### Privacidad

Todo se guarda solo en el navegador de cada dispositivo (`localStorage`). No hay cuentas, anuncios ni compras. Solo se pide un apodo opcional.

La única excepción es la revisión con foto: la foto del cuaderno se envía a Claude para leer las respuestas. La app no la guarda ni la manda a ningún otro lado, y antes de sacarla le recuerda al niño que no salgan caras ni nombres.

## Adaptarla a otra asignatura

Para hacer una versión nueva para otro cliente o tema, basta con cambiar:

1. **El contenido:** los archivos `src/content/unidad-N.json` y `glosario.json` (la app lee sola cualquier `unidad-N.json`).
2. **La marca:** el nombre en `index.html`, `public/manifest.webmanifest`, `src/screens/Bienvenida.tsx` y el pie del camino en `src/screens/Camino.tsx`; las frases de la mascota en `src/lib/frases.ts` y los nombres de los logros en `src/lib/logros.ts`.
3. **La mascota y los colores:** el dibujo en `src/components/Numi.tsx`, la paleta en `src/index.css` y los íconos con `npm run iconos`.

Después corre `npm run validar`, `npm test` y `npm run build`.

## Cómo agregar o editar contenido

### Editar una pregunta

Busca su `id` (por ejemplo `u2-l1-e07`: unidad 2, lección 1, pregunta 7) en `src/content/unidad-2.json`, cambia el texto y corre `npm run validar`.

### Reglas para que las preguntas sean sencillas

`npm run validar` revisa todas estas reglas y avisa qué pregunta no las cumple:

- Pregunta de 20 palabras como máximo, problema de 35, alternativa de 9, explicación de 35 y tarjeta de resumen de 35.
- Siempre 4 alternativas, con una sola correcta y las demás claramente equivocadas.
- Completar con 3 o 4 fichas, verdadero o falso en un solo paso, 3 o 4 pares, 3 o 4 tarjetas para ordenar, 2 o 3 trozos en "encuentra el error" y 2 categorías con 4 o 5 elementos para clasificar.
- Cada lección tiene al menos 10 preguntas, con al menos 5 fáciles (dificultad 1), y de 2 a 6 tarjetas de resumen.
- Los números se escriben como en Chile: punto para los miles (4.325) y coma para los decimales (0,25).

Además, `npm test` comprueba que la respuesta correcta de cada pregunta se corrija como correcta.

### Formato de una unidad y una lección

```json
{
  "unidad": 3,
  "titulo": "Fracciones y decimales",
  "descripcion": "Una frase sobre lo que se aprende",
  "fueraDelMaterial": false,
  "cofreDespuesDe": 2,
  "lecciones": [
    {
      "id": "u3-l1",
      "numero": 1,
      "titulo": "¿Qué es una fracción?",
      "objetivo": "Qué vas a poder hacer al terminar",
      "tipoNodo": "leccion",
      "guia": [ ... de 2 a 6 tarjetas de resumen ... ],
      "ejercicios": [ ... al menos 10 preguntas ... ]
    }
  ]
}
```

`cofreDespuesDe` es el número de la lección después de la cual aparece el cofre de gemas. `tipoNodo: "caso_practico"` dibuja la lección como un nodo especial de problemas (en la demo, "Problemas con dinero").

Cada tarjeta del resumen tiene este formato:

```json
{
  "titulo": "Partes iguales",
  "texto": "Una fracción indica partes iguales de un entero.",
  "ejemplo": "🍕 Una pizza en 4 trozos iguales: cada trozo es 1/4.",
  "fuentes": [{ "archivo": "Bases Curriculares Matemática 4° básico (Mineduc)", "seccion": "OA 8" }],
  "revisar": false
}
```

### Campos de toda pregunta

| Campo | Qué es |
|---|---|
| `id` | `u{unidad}-l{lección}-e{nn}`, sin repetirse. Ejemplo: `u1-l3-e04` |
| `unidad`, `leccion` | Números que coinciden con el `id` |
| `tipo` | Uno de los 8 tipos de abajo |
| `dificultad` | 1 = fácil · 2 = media · 3 = problema de la vida real |
| `concepto` | Etiqueta corta del tema (ej. `"fracciones"`); el repaso agrupa por concepto |
| `enunciado` | La pregunta |
| `explicacion` | Lo que se muestra después de responder: la respuesta y por qué |
| `fuente` | De dónde sale (`archivo` y `seccion`, por ejemplo el OA). **No se muestra en la app** |
| `revisar` | `true` si hay que confirmar algo; en ese caso se agrega `notaRevision` |

### Los 8 tipos de pregunta

Los ejemplos son preguntas reales del banco, sin los campos comunes. La app desordena las alternativas, las fichas, los pares y las tarjetas al mostrarlos.

**Selección múltiple**: siempre 4 alternativas; `respuesta` es la posición de la correcta (0 a 3).

```json
{ "tipo": "seleccion_multiple",
  "enunciado": "¿Cuánto es 213 × 3?",
  "opciones": ["639", "693", "216", "609"],
  "respuesta": 0 }
```

**Problema (caso práctico)**: igual que la selección múltiple, más una historia breve en `caso`.

```json
{ "tipo": "caso_practico",
  "caso": "Para el paseo de curso van 4 buses. En cada bus viajan 38 personas.",
  "enunciado": "¿Cuántas personas van al paseo?",
  "opciones": ["152", "42", "122", "132"],
  "respuesta": 0 }
```

**Verdadero o falso**: `respuesta` es `true` o `false`.

```json
{ "tipo": "verdadero_falso",
  "enunciado": "Cualquier número multiplicado por 0 da 0.",
  "respuesta": true }
```

**Completar**: el enunciado lleva un solo `___` y `banco` trae 3 o 4 fichas para tocar.

```json
{ "tipo": "completar",
  "enunciado": "6.800 ___ 6.080",
  "respuesta": ">",
  "banco": [">", "<", "="] }
```

**Unir pares**: 3 o 4 pares.

```json
{ "tipo": "unir_pares",
  "enunciado": "Une cada fracción con cómo se lee.",
  "pares": [
    { "a": "1/3", "b": "Un tercio" },
    { "a": "3/4", "b": "Tres cuartos" },
    { "a": "2/5", "b": "Dos quintos" }
  ] }
```

**Ordenar**: 3 o 4 tarjetas, escritas en el orden correcto.

```json
{ "tipo": "ordenar",
  "enunciado": "Ordena de menor a mayor.",
  "pasos": ["1/6", "1/5", "1/3", "1/2"] }
```

**Encuentra el error**: la frase va dividida en 2 o 3 `segmentos`; `respuesta` es el equivocado y `correccion`, cómo debería decir.

```json
{ "tipo": "identificar_error",
  "enunciado": "Toca la parte que está equivocada.",
  "segmentos": ["El número 2,35 tiene 2 enteros, ", "3 décimos ", "y 5 décimos."],
  "respuesta": 2,
  "correccion": "y 5 centésimos." }
```

**Clasificar**: 2 categorías y 4 o 5 elementos; `categoria` es la posición de su categoría.

```json
{ "tipo": "clasificar",
  "enunciado": "Clasifica cada ángulo.",
  "categorias": ["Agudo", "Obtuso"],
  "elementos": [
    { "texto": "30°", "categoria": 0 },
    { "texto": "120°", "categoria": 1 },
    { "texto": "75°", "categoria": 0 },
    { "texto": "150°", "categoria": 1 }
  ] }
```

### Glosario

`src/content/glosario.json` tiene las palabras que se pueden tocar en las preguntas y los resúmenes: `termino`, `alias` (otras formas en que aparece), `definicion`, `unidad`, `fuente` y `revisar`. Las siglas (como AM y PM) solo se marcan escritas en mayúsculas.
