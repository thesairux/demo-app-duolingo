# Temario de Numi Mates (demo)

Demo de catálogo construida sobre el motor de Lexi Laboral. El contenido es de ejemplo y sigue las Bases Curriculares de Matemática de 4° básico del Mineduc. La app no muestra las fuentes, pero cada pregunta y tarjeta guarda internamente el objetivo de aprendizaje (OA) del que sale.

## Unidad 1 — Los números grandes

Leer, escribir, armar y comparar números hasta el 10.000. Así entiendes cuánto vale cada cifra.

| # | Lección | Objetivo | OA | Tarjetas del resumen |
|---|---|---|---|---|
| 1 | Leer y escribir números | Leer y escribir números de 4 cifras, y llegar hasta el 10.000. | OA 1 | Los números de 4 cifras, Cómo se leen, El 10.000 |
| 2 | Valor posicional | Saber cuánto vale cada cifra según el lugar donde está. | OA 1 | Cada lugar tiene un valor, Una cifra, distintos valores, Descomponer un número |
| 3 | Comparar y ordenar | Saber qué número es mayor o menor, y ordenarlos. | OA 1 | Mayor o menor, Los signos > y <, Ordenar |

## Unidad 2 — Multiplicar y dividir

Tablas, multiplicaciones y divisiones para repartir. Y problemas con dinero de la vida diaria.

| # | Lección | Objetivo | OA | Tarjetas del resumen |
|---|---|---|---|---|
| 1 | Multiplicar | Multiplicar números de hasta 3 cifras por un número de 1 cifra. | OA 4 y OA 5 | Multiplicar es sumar repetido, El 0, el 1 y el 10, Números más grandes |
| 2 | Dividir | Repartir en partes iguales y saber qué hacer con lo que sobra. | OA 4 y OA 6 | Dividir es repartir, Multiplicar y dividir son amigos, Cuando sobra |
| 3 | Problemas con dinero (nodo de problemas) | Elegir la operación correcta para resolver problemas con pesos chilenos. | OA 3 y OA 7 | Lee con calma, ¿Qué operación uso?, El vuelto |

## Unidad 3 — Fracciones y decimales

Partes de un entero: fracciones para repartir la pizza y decimales para medir. Comparar y sumar partes.

| # | Lección | Objetivo | OA | Tarjetas del resumen |
|---|---|---|---|---|
| 1 | ¿Qué es una fracción? | Entender qué indican el numerador y el denominador de una fracción. | OA 8 | Partes iguales, Arriba y abajo, Cómo se leen |
| 2 | Comparar y sumar fracciones | Comparar fracciones, y sumar o restar las que tienen igual denominador. | OA 8 y OA 9 | Igual denominador, Igual numerador, Sumar y restar |
| 3 | Décimos y centésimos | Leer y escribir números decimales con décimos y centésimos. | OA 11 y OA 12 | El décimo, El centésimo, La coma decimal |

## Unidad 4 — Medición y geometría

La hora, las medidas, el perímetro y el área. Y también los ángulos y la simetría de las figuras.

| # | Lección | Objetivo | OA | Tarjetas del resumen |
|---|---|---|---|---|
| 1 | La hora y el tiempo | Leer la hora en distintos relojes y pasar de una unidad de tiempo a otra. | OA 20 y OA 21 | Equivalencias, AM y PM, El reloj de 24 horas |
| 2 | Medir: perímetro y área | Usar metros, centímetros y milímetros, y calcular el perímetro y el área de un rectángulo. | OA 22 y OA 23 | m, cm y mm, El perímetro, El área |
| 3 | Ángulos y simetría | Reconocer ángulos rectos, agudos y obtusos, y figuras simétricas. | OA 17 y OA 19 | Los ángulos, El transportador, Simetría |

Cada lección tiene 10 preguntas (5 fáciles, 3 medias y 2 problemas de la vida real) y 3 tarjetas de resumen. En total hay 120 preguntas y 27 palabras en el glosario.

## Objetivos de aprendizaje usados

| OA | Qué dice (resumido) |
|---|---|
| OA 1 | Representar y describir números del 0 al 10.000: leer, escribir, comparar, ordenar, valor posicional y recta numérica |
| OA 3 | Adición y sustracción de números hasta 1.000 en problemas |
| OA 4 | Propiedades del 0 y del 1 en la multiplicación, y del 1 en la división |
| OA 5 | Multiplicación de números de tres dígitos por números de un dígito |
| OA 6 | División con dividendos de dos dígitos y divisores de un dígito |
| OA 7 | Problemas cotidianos con dinero, eligiendo la operación apropiada |
| OA 8 | Fracciones como parte de un todo; comparar fracciones con igual numerador o igual denominador |
| OA 9 | Adiciones y sustracciones de fracciones con igual denominador |
| OA 11 y OA 12 | Decimales: décimos y centésimos; sumarlos y restarlos |
| OA 17 | Línea (eje) de simetría |
| OA 19 | Ángulos: medirlos con transportador y compararlos con el ángulo recto |
| OA 20 y OA 21 | Hora en relojes análogos y digitales (AM, PM y 24 horas) y conversiones de tiempo |
| OA 22 y OA 23 | Longitud en m, cm y mm; área de rectángulos y cuadrados en cm² y m² |

Quedan fuera de esta demo, y se pueden agregar como unidades nuevas: patrones y ecuaciones (OA 13 y 14), ubicación en cuadrículas (OA 15), vistas de cuerpos 3D (OA 16), transformaciones (OA 18), volumen (OA 24) y datos y probabilidades (OA 25 a 27).

## Resuelve en tu cuaderno

Hojas de 4 ejercicios que se generan al azar cada vez (`src/lib/cuaderno.ts`), para resolver con lápiz y revisar con una foto.

| Tema | Ejercicios | OA |
|---|---|---|
| Sumas y restas | 2 sumas y 2 restas con resultados hasta 1.000 | OA 3 |
| Multiplicaciones | 2 de 2 cifras × 1 cifra y 2 de 3 cifras × 1 cifra | OA 5 |
| Divisiones | Dividendo de 2 cifras y divisor de 1 cifra: 2 exactas y 2 con resto | OA 6 |
| Fracciones | 2 sumas y 2 restas con igual denominador (4, 5, 6, 8, 10 o 12) | OA 9 |
| De todo un poco | Una suma o resta, una multiplicación, una división y una fracción | OA 3, 5, 6 y 9 |

Claude solo transcribe el resultado que escribió el niño; la app lo compara con la respuesta calculada. Se aceptan el punto de los miles (1.012), el resto escrito de varias formas («9 resto 5», «9 y sobran 5») y las fracciones equivalentes (10/16 por 5/8).

## Decisiones del proyecto

- **Mismo motor, otra piel.** La lógica del juego (coronas, vidas, racha, repaso, examen, tienda y logros) es la de Lexi Laboral sin cambios. Solo cambian la marca, la mascota, las frases, los nombres de los logros y de la tienda, y el banco de preguntas.
- **Mascota:** Numi, una castora con birrete y un libro con «123 +÷». En la tienda se cambian los colores del birrete y la ropa.
- **Formato corto:** 4 unidades de 3 lecciones, con un cofre después de la lección 2 y un checkpoint al final de cada unidad. La lección «Problemas con dinero» se dibuja como nodo especial.
- **Escritura chilena:** punto para los miles (4.325), coma decimal (0,25), dinero en pesos ($1.000) y el signo «:» para dividir.
- **Lenguaje para 9 y 10 años:** frases cortas, contextos del colegio y la casa (once, paseo de curso, diario mural) y apoyos visuales con emojis cuando ayudan (🟦🟦🟦⬜).
- **Sin datos personales:** solo un apodo opcional; todo se guarda en el navegador. La foto del cuaderno se envía a Claude solo para leer las respuestas.
- **Claude lee, la app corrige:** en la revisión con foto, Claude no decide si un ejercicio está bien; solo dice qué número escribió el niño. Así la corrección es exacta y se puede probar.
