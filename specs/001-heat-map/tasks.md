# Tasks 001 — Mapa de calor de estudio

- [x] T1: Lógica pura en `app.js` (constantes, `levelForMinutes`,
`buildHeatmapData`, reutilizar formateador local). RF: RF-1, RF-2.
Hecho cuando: `node --check app.js` pasa y la página abre igual que antes.
- [x] T2: Tests en `test/heatmap.test.js` (bordes, forma 12×7, suma, futuro,
inválidos, vacío) con `node --test` sin dependencias. RF: RF-1, RF-2, RF-5.
Hecho cuando: `node --test` muestra todos en verde.
- [x] T3: Sección y leyenda en `index.html` (cuadrícula vacía + 6 entradas).
RF: RF-1, RF-3, RF-4, RF-5.
Hecho cuando: la página muestra el titular, la cuadrícula vacía y la leyenda.
- [x] T4: Estilos en `styles.css` (rejilla 12 columnas, 5 niveles, gris futuro,
leyenda, 375 px sin scroll). RF: RF-1, RF-2, RF-3.
Hecho cuando: captura a 375 px sin scroll horizontal y colores correctos.
- [x] T5: Pintado en `app.js` (función de pintado + llamada en `renderizar()` +
guardia de exportación) con texto accesible por día y etiqueta de grupo.
RF: RF-1, RF-2, RF-4, RF-5.
Hecho cuando: en Chrome las celdas muestran niveles, títulos y etiquetas
correctos y `node --test` sigue en verde.
- [x] T6: Verificación final en Chrome real (huecos, sesión futura, cruce de
mes y año, consola limpia, móvil 375 px) y actualizar `MEMORY.md`.
RF: RF-1–RF-5.
Hecho cuando: los 5 RF comprobados sin errores y la memoria actualizada.
