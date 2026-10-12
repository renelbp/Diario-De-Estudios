# Spec 001 — Mapa de calor de estudio

## Contexto y objetivo
El Diario muestra racha, mejor racha y totales, pero no la constancia visual en el
tiempo. El objetivo es un mapa de calor tipo GitHub con los días estudiados de las
últimas 12 semanas, donde a más minutos estudiados, más intenso el color del día,
para motivar de un vistazo. Solo lectura: no modifica datos.

## Usuarios
- Estudiante que registra sus sesiones y quiere ver su constancia de un vistazo.

## Historias de usuario
- HU-1: Como estudiante, quiero ver mis últimas 12 semanas en una cuadrícula por
días para apreciar mi constancia.
- HU-2: Como estudiante, quiero que los días con más minutos se vean más intensos
para distinguir el esfuerzo de un vistazo.
- HU-3: Como estudiante daltónico o con lector de pantalla, quiero saber qué
representa cada día sin depender solo del color.

## Requisitos funcionales
- RF-1: El sistema debe mostrar 12 columnas semanales de lunes a domingo: la
primera es la más antigua (izquierda) y la última es la semana actual
(derecha), aunque esté en curso.
  - Cuando la semana actual está en curso, el sistema debe mostrar los días
  futuros en gris neutro, distinto del color de día vacío.
  - Si un día futuro tiene sesiones registradas, el sistema debe mantenerlo en
  gris neutro e ignorar sus minutos.
- RF-2: El sistema debe pintar cada día pasado según los minutos totales de ese
día (sumando sus sesiones) con 5 niveles fijos: 0, 1–29, 30–59, 60–119 y 120 o
más minutos.
  - Si un día pasado no tiene sesiones, el sistema debe pintarlo con el nivel
  vacío.
  - Si una sesión tiene minutos no numéricos o menores o iguales a 0, el sistema
  debe ignorarla para el mapa sin mostrar errores.
  - Si un registro tiene fecha ausente, malformada o con otra forma, el sistema
  debe ignorarlo para el mapa sin modificarlo ni borrarlo.
- RF-3: El sistema debe mostrar una leyenda que explique los 5 niveles de color
más el gris de día futuro.
- RF-4: Cada día debe exponer su fecha y sus minutos como texto accesible
(nombre accesible), además del color; la cuadrícula debe llevar una etiqueta
de grupo que resuma el periodo mostrado.
- RF-5: Si no hay ninguna sesión registrada, el sistema debe mostrar la
cuadrícula vacía con su leyenda, sin errores.

## Requisitos no funcionales
- RNF-1: Los textos visibles deben estar en español.
- RNF-2: Debe verse bien en móvil (375 px) sin scroll horizontal.
- RNF-3: Los cálculos de fechas deben cumplir la constitución (hora local, días
únicos, futuro excluido). La función de datos debe ser pura: recibe las
sesiones y el hoy ("AAAA-MM-DD" local) y devuelve 12 semanas × 7 días con
{fecha, minutos, nivel, esFutura}; los umbrales son una constante. Todo ello
se verifica con `node --test`.
- RNF-4: El contraste del gris neutro y del nivel vacío debe distinguirse del
resto también sin percibir el color exacto (apoyado por la leyenda y el texto
de RF-4).

## Casos límite
- Varias sesiones el mismo día se suman antes de aplicar el umbral.
- Semana a caballo entre dos meses o entre diciembre y enero: las columnas son
continuas, sin cortes.
- Sesión registrada a las 00:30 o el día del cambio de hora: cuenta en su fecha
local, como el resto del proyecto.
- Cambio de semana: al llegar el lunes, la ventana se desplaza sola; ese día la
semana actual muestra 1 día pasado y 6 futuros en gris, y es aceptable.
- Lector de pantalla: recorrer 84 celdas nombradas es aceptable; la etiqueta de
grupo de RF-4 resume el periodo.

## Fuera de alcance
- Pulsar un día para ver o editar sus sesiones.
- Cambiar el número de semanas o los umbrales desde la interfaz.
- Colores personalizables o modo oscuro.

## Criterios de finalización
- Los 5 RF se verifican en Chrome real con sesiones de prueba (huecos sin
estudio, sesión futura, cruce de mes y de año) sin errores en consola.
- La vista móvil a 375 px no tiene scroll horizontal.
- `node --test` en verde (prohibido avanzar en rojo, según la constitución).

## Dudas abiertas
- Ninguna: las decisiones (12 semanas, umbrales fijos con estos cortes, futuro en
gris, solo lectura) están tomadas arriba.
