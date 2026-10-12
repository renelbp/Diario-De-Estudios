# Plan 001 — Mapa de calor de estudio

## Archivos (qué se crea o modifica y para qué)
- `index.html` (modifica): nueva sección con la cuadrícula vacía y la leyenda
estática de 6 entradas. Cubre RF-1, RF-3, RF-4, RF-5.
- `styles.css` (modifica): rejilla de 12 columnas, 5 niveles de color, gris de
futuro y leyenda; debe caber a 375 px sin scroll. Cubre RF-1, RF-2, RF-3,
RNF-2, RNF-4.
- `app.js` (modifica): lógica pura + pintado + llamada en `renderizar()` +
guardia de exportación para tests. Cubre RF-1, RF-2, RF-4, RF-5, RNF-3.
- `test/heatmap.test.js` (crea): tests con `node --test`, sin dependencias.
Cubre RNF-3 y la puerta de la constitución 4.

## Funciones puras de lógica (con "hoy" como parámetro)
- `levelForMinutes(minutes)` → nivel 0–4 según los umbrales de RF-2.
- `buildHeatmapData(sessions, today)` → 12 semanas × 7 días con
`{date, minutes, level, isFuture}`; `today` es "AAAA-MM-DD" en hora local.
- Reutilizan el formateador local existente para obtener el hoy; nunca
`toISOString()` ni `new Date("AAAA-MM-DD")` (constitución 5).

## Algoritmo en pseudocódigo
- Sumar minutos por fecha en una pasada, ignorando minutos no válidos,
fechas ausentes o malformadas y fechas posteriores a hoy.
- Calcular el lunes de la semana actual en hora local y retroceder 11
semanas: ese lunes es la primera celda.
- Recorrer 84 días seguidos con un solo objeto fecha (avance con
`setDate(+1)`); por día: minutos acumulados o 0, nivel según umbrales,
`esFutura` si la fecha es posterior a hoy.

## Cómo se pinta en la interfaz
- Una función de pintado pide los datos con las sesiones y el hoy, vacía la
cuadrícula y crea 12 columnas con 7 celdas cada una.
- Cada celda lleva clase de nivel (`heat-0`…`heat-4`) o `heat-future`, más su
fecha y minutos en español como texto accesible (RF-4) usando el formateador
de fechas existente; la cuadrícula lleva etiqueta de grupo con el periodo.
- La leyenda es HTML estático (no depende de JS) e incluye el gris futuro.
- Sin sesiones (RF-5), la misma función pinta 84 celdas vacías con leyenda.

## Decisiones técnicas (y alternativa descartada)
1. Ventana con una sola fecha mutable + `setDate(+1)`; descartado restar
milisegundos (se rompe en el cambio de hora) o crear 84 fechas (innecesario).
2. Suma por día en una pasada O(n) antes de la rejilla; descartado filtrar
sesiones dentro del bucle de 84 días (coste O(n·84)).
3. Comparar fechas como texto "AAAA-MM-DD" (el orden alfabético es
cronológico); descartado convertir cada día a fecha para comparar.
4. Leyenda estática en HTML; descartado generarla por JS (complejidad sin
beneficio, y debe verse incluso si algo falla).
5. Celdas no interactivas (sin clic): el clic-detalle está fuera de alcance;
descartado usar botones (84 paradas de teclado innecesarias).
6. Nombres nuevos en inglés y textos en español (constitución 6); la forma
guardada `{fecha, tema, minutos}` no se toca (constitución 5).
7. Guardia `typeof module` para exponer la lógica a los tests sin afectar al
navegador por `file://` (constitución 1 y 4).

## Estrategia de tests (`node --test`, sin instalar nada)
- `app.js` toca `document` y `localStorage` al cargarse: el test los simula
con objetos mínimos antes de importarlo y solo prueba la lógica pura.
- Casos: bordes de nivel (0, 1, 29, 30, 59, 60, 119, 120, 300); forma 12×7
con anclas (primer lunes y hoy); suma del mismo día; futuro gris sin sumar;
minutos inválidos; fecha malformada u otra forma; cero sesiones.
- Puerta: con un solo test en rojo se para (constitución 4); después,
verificación en Chrome real según los criterios de la spec.

## Cobertura de RF
- RF-1 (12 columnas lun–dom, futuro en gris): algoritmo + pintado + estilos.
- RF-2 (niveles, suma, inválidos ignorados): `levelForMinutes`,
`buildHeatmapData` + tests de bordes, suma e inválidos.
- RF-3 (leyenda con gris): HTML estático + estilos.
- RF-4 (texto accesible + etiqueta de grupo): pintado + verificación manual
con lector/Inspector en Chrome.
- RF-5 (vacío sin errores): misma función sin sesiones + test de cero
sesiones + Chrome con almacenamiento limpio.
