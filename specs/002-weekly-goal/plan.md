# Plan 002 — Objetivo semanal de estudio

Spec: `specs/002-weekly-goal/spec.md`. Constitución: HTML/CSS/JS puros sin build,
lógica pura con "hoy" como parámetro, `node --test` en verde, datos sagrados con
compatibilidad, código en inglés / interfaz en español.

## 1. Archivos y responsabilidad

- `app.js` (modifica): añade la lógica pura del objetivo (`parseGoalText`,
`sumWeekMinutes`, `buildWeeklyGoalProgress`), el almacenamiento del objetivo en una
clave nueva separada (las sesiones de `diarioDeEstudio` no se tocan) y el pintado /
eventos de la sección. Exporta las puras para tests igual que hace con el mapa de
calor. Cubre RF-1–RF-7, RNF-4, RNF-6.
- `index.html` (modifica): añade la sección del objetivo dentro de la zona de
estadísticas, debajo del total semanal existente (que se conserva tal cual): texto
de invitación, bloque de progreso (texto "X de Y min", barra con
`role="progressbar"`, mensaje exacto de cumplimiento), campo + botón de confirmar +
botón de quitar + zona de error propia. Cubre RF-1, RF-4, RF-8, RNF-1, RNF-7.
- `styles.css` (modifica): estilos de la sección y la barra (fondo con variable de
línea, relleno con el acento boli, altura ~10px, bordes redondeados), sin scroll
horizontal a 375 px. Cubre RNF-2.
- `test/weekly-goal.test.js` (crea): tests `node --test` de la lógica pura,
reutilizando el stub de `document`/`localStorage` de `test/heatmap.test.js`.
Cubre RNF-5 y la puerta en rojo.

## 2. Funciones puras (con "hoy" como parámetro)

Nombres en inglés, sin DOM ni localStorage. `today` es "AAAA-MM-DD" local.

- `parseGoalText(text)`: valida según RF-2. Recorta espacios; acepta solo
`/^[0-9]+$/` con valor > 0 y entero seguro; devuelve el número o `null`.
- `sumWeekMinutes(sessions, today)`: total de la semana lunes–domingo con
`inicio <= fecha <= hoy`, ignorando fechas ausentes/malformadas (reutilizando
`isValidDateText`), futuro y minutos no numéricos o <= 0. Es la versión pura de
`calcularMinutosSemana`, que pasa a delegar en ella.
- `buildWeeklyGoalProgress(sessions, goal, today)`: si `goal` no es entero > 0
devuelve `{ hasGoal: false, total: sumWeekMinutes(...) }`; si lo es, devuelve
`{ hasGoal: true, total, goal, achieved: total >= goal, barPercent: min(100,
floor(total * 100 / goal)) }`. El texto muestra el exceso sin topar; solo la barra
se topa.

Impuras y mínimas fuera de las puras: `loadGoal` (lee, valida con `parseGoalText`,
corrupto/ausente → `null` sin tocar sesiones), `saveGoal` / `clearGoal` (escriben la
clave nueva en `try/catch`; si falla, mantienen en memoria + error en español),
`renderGoal` y los dos manejadores (confirmar / quitar).

## 3. Algoritmo (pseudocódigo)

```
parseGoalText(text):
  t = trim(text)
  si t no casa /^[0-9]+$/ → null
  n = Number(t)
  si no es entero seguro o n <= 0 → null
  devuelve n

mondayOf(today):
  d = parseLocalDate(today)          # new Date(y, m-1, d), nunca UTC
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  devuelve fechaLocal(d)

sumWeekMinutes(sessions, today):
  monday = mondayOf(today); total = 0
  para cada s en sessions:
    si no isValidDateText(s.fecha) → saltar
    si s.fecha < monday o s.fecha > today → saltar
    m = Number(s.minutos)
    si no finito o m <= 0 → saltar
    total += m
  devuelve total

buildWeeklyGoalProgress(sessions, goal, today):
  total = sumWeekMinutes(sessions, today)
  si goal no es entero seguro > 0 → { hasGoal:false, total }
  sino → { hasGoal:true, total, goal,
           achieved: total >= goal,
           barPercent: min(100, floor(total*100/goal)) }
```

`calcularMinutosSemana()` existente se conserva como envoltorio impuro:
`sumWeekMinutes(sesiones, fechaLocal(new Date()))`.

## 4. Cómo se pinta

- Ubicación (RF-8): dentro de `<section class="racha">`, nuevo bloque debajo del
`<p id="minutosSemana">` existente. El total semanal no se modifica.
- Sin objetivo (RF-4): párrafo de invitación (p. ej. "Fija tu objetivo semanal para
motivarte 🎯"); campo + confirmar visibles; quitar oculto (`hidden`); sin barra ni
mensaje.
- Con objetivo (RF-1, RF-3): texto `X de Y min`, barra
`<div class="goal-bar"><div class="goal-fill" style="width: N%">` con
`role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="Y"`,
`aria-valuenow="X"`, `aria-valuetext="X de Y min"`; mensaje exacto
`¡Objetivo cumplido! 🎉` solo si `achieved`, oculto si no. Campo pre-rellenado con
Y; confirmar + quitar visibles.
- Eventos: confirmar valida con `parseGoalText`; inválido → error en español en la
zona propia y se conserva el anterior (RF-2); válido (incluido igual al vigente) →
guarda, limpia error y repinta. Quitar → borra clave, repinta a invitación. Cada
`renderizar()` repinta el objetivo con el "hoy" real, así registrar sesión
(RF-5) o cambiar de lunes recalcula solo.

## 5. Decisiones técnicas

- **Clave separada nueva para el objetivo (p. ej. `diarioDeEstudioGoal`) con número
JSON, en vez de convertir las sesiones en objeto `{ sessions, goal }`.**
Descartada la segunda: rompería la compatibilidad hacia atrás y obligaría a migrar
datos con riesgo de perder sesiones (RF-6, constitución §5).
- **Reutilizar `isValidDateText` / `parseLocalDate` / `fechaLocal` y extraer el total
semanal a `sumWeekMinutes`, en vez de duplicar el cálculo de semana.**
Descartado duplicar: dos cálculos divergerían (lunes, futuro, DST) y violarían RF-7.
- **Campo `type="text" inputmode="numeric"` en vez de `type="number"`.**
Descartado `number`: el navegador normaliza ("3.0"→3, permite "e") e impediría
rechazar lo que RF-2 exige rechazar; el texto deja validar los dígitos exactos.
- **Barra `div` con `role="progressbar"` + texto, en vez de `<progress>` nativo.**
Descartado `<progress>`: su estilo nativo es inconsistente entre navegadores y
rompe la estética de cuaderno; el `div` se tematiza con variables existentes y la
accesibilidad se cubre con ARIA + texto (RNF-7).

## 6. Estrategia de tests (`node --test`, sin paquetes)

Nuevo `test/weekly-goal.test.js` con el mismo stub de `document`/`localStorage` que
el test del mapa de calor. Casos: `parseGoalText` (" 60 "→60, "007"→7, "", "0",
"-5", "3.0", "3,5", "1e2", "+60", "abc" → `null`); progreso sin objetivo, a cero,
parcial (barPercent proporcional), exacto (achieved), con exceso (texto con X>Y,
barra 100); semana lunes–domingo (lunes cuenta, domingo anterior no), futuro
excluido, fecha malformada/ausente y minutos inválidos ignorados; cruce de mes y de
año (p. ej. semana 2025-12-29→2026-01-04); objetivo gigante sin romper. Puerta:
`node --test` debe quedar en verde antes de dar por hecha cada tarea.

## 7. Cobertura RF por parte

- Lógica pura + tests: RF-2 (validación), RF-7 (reglas de semana), RF-3 (cálculo de
cumplimiento/exceso), RNF-4, RNF-5, RNF-6.
- Almacenamiento: RF-6 (persistencia, corruptos, fallo de guardado, datos viejos).
- HTML + pintado + eventos: RF-1 (campo/confirmar/quitar), RF-4 (invitación),
RF-3 (texto/barra/mensaje), RF-5 (recálculo al registrar/cambiar/quitar), RF-8
(ubicación + total intacto), RNF-1, RNF-7.
- CSS: RNF-2 (móvil 375 px, barra legible).
