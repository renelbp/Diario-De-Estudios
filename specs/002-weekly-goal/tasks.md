# Tasks 002 — Objetivo semanal de estudio

Orden de dependencia. Cada tarea dura 20–30 min. `node --test` en verde antes de
pasar a la siguiente (constitución §4).

- [x] **T1 — Lógica pura + tests en verde (RF-2, RF-3-cálculo, RF-7, RNF-4, RNF-5, RNF-6)**
  - Añadir en `app.js` `parseGoalText`, `sumWeekMinutes`, `buildWeeklyGoalProgress`
  (inglés, puras, `today` "AAAA-MM-DD" local, reutilizando `isValidDateText` /
  `parseLocalDate` / `fechaLocal`); hacer que `calcularMinutosSemana` delegue en
  `sumWeekMinutes`; exportar las tres junto a las del mapa de calor.
  - Crear `test/weekly-goal.test.js` (mismo stub que `heatmap.test.js`): dígitos
  (" 60 "→60, "007"→7; "", "0", "-5", "3.0", "3,5", "1e2", "+60", "abc"→null),
  progreso (sin objetivo, cero, parcial, exacto, exceso con barra 100), semana
  (lunes sí / domingo anterior no, futuro fuera, fecha inválida y minutos
  inválidos ignorados, cruce de mes y de año, objetivo gigante).
  - Hecho cuando: `node --test` en verde y las puras no tocan DOM ni
  localStorage.

- [x] **T2 — Persistencia compatible del objetivo (RF-6)**
  - Clave nueva separada para el objetivo (sesiones intactas); `loadGoal` valida y
  trata ausente/corrupto/inválido como `null`; `saveGoal`/`clearGoal` en
  `try/catch` (fallo → memoria + error en español, sesiones intactas); datos
  viejos abren como "sin objetivo".
  - Hecho cuando: recargar mantiene el objetivo, el corrupto abre como "sin
  objetivo" con sesiones intactas, y las sesiones guardadas antes siguen
  idénticas.

- [x] **T3 — Estructura HTML de la sección (RF-1, RF-4, RF-8, RNF-1, RNF-7)**
  - Bloque en la zona de estadísticas debajo del total semanal (que no se toca):
  invitación, texto "X de Y min", barra `div` con `role="progressbar"` y
  `aria-valuemin/max/now/valuetext`, mensaje exacto `¡Objetivo cumplido! 🎉`
  (oculto si no toca), campo `type="text" inputmode="numeric"`, confirmar,
  quitar (oculto sin objetivo), zona de error propia; textos en español.
  - Hecho cuando: sin objetivo solo se ve invitación + campo + confirmar; con
  objetivo se ven texto, barra, campo, confirmar y quitar.

- [x] **T4 — Estilos de barra y sección (RNF-2)**
  - Estilos cuaderno (fondo línea, relleno boli, ~10px, redondeado) con variables
  existentes; campo/botones reutilizan estilos del formulario; a 375 px sin
  scroll horizontal y todo legible.
  - Hecho cuando: a 375 px no hay scroll horizontal y la barra se distingue con y
  sin color (apoyada en el texto).

- [x] **T5 — Cableado: pintar, confirmar, quitar y recálculo (RF-1, RF-3-vista, RF-5)**
  - `renderGoal` dentro de `renderizar()`: invitación vs progreso según haya
  objetivo; `barPercent` topado y texto con exceso; mensaje solo si
  `achieved`; confirmar (inválido → error español y conserva anterior; válido o
  igual → guarda, limpia error, repinta); quitar (→ invitación al instante;
  sin objetivo → nada sin error); registrar sesión de la semana actual repinta al
  instante, pasada/futura no cambia el progreso.
  - Hecho cuando: fijar/cambiar/quitar y registrar sesión actualizan texto, barra
  y mensaje al instante sin errores en consola.

- [x] **T6 — Verificación final (Criterios de finalización)**
  - `node --test` verde; prueba manual en Chrome real: válido/inválido, cumplir y
  superar (texto con exceso + barra 100%), quitar → invitación, recarga mantiene,
  lunes reinicia con mismo objetivo, datos viejos y corrupto intactos, móvil
  375 px, consola limpia.
  - Hecho cuando: todos los Criterios de la spec se cumplen y `node --test`
  sigue en verde.
