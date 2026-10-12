# Spec 002 — Objetivo semanal de estudio

## Contexto y objetivo
El Diario ya muestra el total de minutos de la semana actual ("Esta semana: X min"),
pero sin referencia no motiva a cumplir una meta. El objetivo es permitir fijar
cuántos minutos se quiere estudiar cada semana y ver cuánto se lleva, para motivarse
a cumplirlo. Un solo objetivo que vale para todas las semanas; solo importa la
semana actual, sin historial de cumplimiento.

## Usuarios
- Estudiante que registra sus sesiones y quiere motivarse con una meta semanal de
minutos.

## Historias de usuario
- HU-1: Como estudiante, quiero fijar cuántos minutos quiero estudiar cada semana
para tener una meta clara.
- HU-2: Como estudiante, quiero ver cuánto llevo de mi objetivo esta semana (texto
y barra) para saber si voy bien.
- HU-3: Como estudiante, quiero saber cuándo he cumplido mi objetivo, incluso si lo
supero, para celebrarlo.
- HU-4: Como estudiante, quiero cambiar o quitar mi objetivo en cualquier momento
para adaptarlo a mi realidad.

## Requisitos funcionales
- RF-1: El sistema debe ofrecer en la sección del objetivo un campo de entrada, una
acción de confirmar y una acción de quitar, con una zona de error propia.
  - Cuando el usuario confirma un valor válido, el sistema debe guardarlo como
  objetivo vigente y mostrar el progreso actualizado al instante.
  - Cuando el usuario confirma un valor válido habiendo ya un objetivo, el sistema
  debe sustituirlo y recalcular el progreso al instante con el total de la semana
  actual.
  - Mientras no haya objetivo vigente, el sistema debe mostrar el campo y la acción
  de confirmar, y no debe mostrar la acción de quitar.
  - Mientras haya un objetivo vigente, el sistema debe mostrar el campo, la acción
  de confirmar y la acción de quitar.
  - Cuando el usuario activa la acción de quitar habiendo un objetivo vigente, el
  sistema debe eliminar el objetivo y volver al estado "sin objetivo" de RF-4 al
  instante.
  - Si el usuario activa la acción de quitar sin haber objetivo vigente, el sistema
  debe mantenerse en el estado "sin objetivo" sin mostrar errores.
  - Cuando hay un objetivo vigente al abrir la aplicación, el sistema debe
  mostrarlo junto con el progreso de la semana actual.
- RF-2: El sistema debe aceptar solo enteros mayores que 0 como objetivo, igual que
los minutos de una sesión.
  - Cuando el texto, una vez recortados los espacios en blanco de ambos extremos,
  está formado solo por dígitos del 0 al 9 y su valor numérico es mayor que 0, el
  sistema debe aceptarlo como válido (p. ej. " 60 " vale como 60; se admiten ceros
  a la izquierda como su valor numérico).
  - Si el texto vacío, o con signo, punto, coma, exponente, letras u otro símbolo
  (p. ej. "", "0", "-5", "3.0", "3,5", "1e2", "+60", "abc"), el sistema debe
  rechazarlo, mostrar un mensaje de error en español en la zona de error del
  objetivo y no debe guardar ni modificar el objetivo vigente.
  - Si ya había un objetivo vigente y el nuevo valor no es válido, el sistema debe
  conservar el objetivo anterior sin cambios.
  - Si el valor confirmado es válido e igual al objetivo vigente, el sistema debe
  aceptarlo, mantener el mismo objetivo y limpiar cualquier error visible.
  - El sistema no debe imponer un límite máximo al objetivo: cualquier entero
  mayor que 0 es válido y no debe romper el cálculo ni la vista.
- RF-3: El sistema debe mostrar el progreso de la semana actual cuando hay objetivo
vigente.
  - Mientras haya un objetivo vigente, el sistema debe mostrar el texto "X de Y
  min", donde X es el total semanal actual e Y el objetivo.
  - Mientras haya un objetivo vigente, el sistema debe mostrar una barra de
  progreso cuyo ancho visual es proporcional al cociente entre lo estudiado y el
  objetivo, topado al 100 % del ancho.
  - Cuando lo estudiado alcanza o supera el objetivo (X >= Y con objetivo
  vigente), el sistema debe mostrar el mensaje exacto "¡Objetivo cumplido! 🎉".
  - Mientras lo estudiado sea menor que el objetivo o no haya objetivo vigente, el
  sistema no debe mostrar el mensaje de cumplimiento.
  - Si lo estudiado supera el objetivo, el sistema debe mostrar el texto con el
  exceso tal cual (X mayor que Y) mientras la barra queda llena al 100 %, sin
  topar el texto.
- RF-4: El sistema debe mostrar un estado "sin objetivo" cuando no hay objetivo
vigente.
  - Mientras no haya objetivo vigente, el sistema debe mostrar en la sección del
  objetivo un texto en español que invita a fijarlo, sin barra, sin texto de
  progreso y sin mensaje de cumplimiento.
  - El sistema no debe suponer ningún valor por defecto cuando no hay objetivo
  vigente.
- RF-5: El sistema debe recalcular el progreso al instante ante cualquier cambio
de datos de la semana actual.
  - Cuando se registra una sesión válida de la semana actual habiendo un objetivo
  vigente, el sistema debe actualizar el texto, la barra y el mensaje de
  cumplimiento al instante.
  - Cuando se registra una sesión de una semana pasada o futura habiendo un
  objetivo vigente, el sistema no debe cambiar el progreso mostrado.
  - Cuando se cambia o se quita el objetivo, el sistema debe actualizar la vista
  al instante según RF-1.
- RF-6: El sistema debe conservar el objetivo entre recargas y cambios de semana
sin alterar las sesiones.
  - Cuando el usuario recarga la aplicación, el sistema debe mantener el objetivo
  vigente anterior.
  - Cuando empieza una nueva semana (lunes), el sistema debe mantener el mismo
  objetivo y mostrar el progreso desde cero con el total de la nueva semana.
  - El sistema debe mantener el formato de las sesiones ya guardadas sin
  cambios: los datos anteriores a esta funcionalidad (solo sesiones, sin
  objetivo) deben abrirse como estado "sin objetivo" con todas las sesiones
  intactas.
  - Si el objetivo guardado falta, está corrupto o no cumple RF-2 al cargar, el
  sistema debe tratarlo como "sin objetivo" según RF-4, sin borrar ni alterar
  las sesiones y sin mostrar errores que bloqueen la aplicación.
  - Si el guardado del objetivo falla (almacenamiento lleno o no disponible), el
  sistema debe mantener el objetivo en memoria durante la sesión, mostrar un
  mensaje de error en español y no debe perder ni alterar las sesiones.
- RF-7: El sistema debe calcular el progreso con las mismas reglas del total
semanal actual.
  - Mientras calcula el progreso, el sistema debe sumar solo las sesiones de la
  semana actual de lunes a domingo en hora local, con `inicio <= fecha <= hoy`,
  sin contar fechas futuras.
  - Si una sesión tiene fecha ausente, malformada o con otra forma, el sistema
  debe ignorarla para el progreso sin modificarla ni borrarla.
  - Si una sesión tiene minutos no numéricos o menores o iguales a 0, el sistema
  debe ignorarla para el progreso, igual que hace el total semanal.
- RF-8: La sección del objetivo debe convivir con el total semanal existente sin
sustituirlo.
  - Mientras haya o no objetivo vigente, el sistema debe seguir mostrando el
  total semanal existente ("Esta semana: X min").
  - El sistema debe ubicar la sección del objetivo junto al total semanal, en la
  misma zona de estadísticas y debajo de él, de modo que ambos sean visibles sin
  desplazamientos extra en la vista inicial.

## Requisitos no funcionales
- RNF-1: Todos los textos visibles (invitación, error, progreso, mensaje de
cumplimiento) deben estar en español.
- RNF-2: La sección del objetivo debe verse bien en móvil (375 px) sin scroll
horizontal, con el campo, las acciones y la barra utilizables y legibles.
- RNF-3: Los cálculos de semana deben cumplir las reglas del proyecto: hora local,
semana de lunes a domingo, futuro excluido.
- RNF-4: El cálculo del progreso debe ser una función pura, separada de la
interfaz y del almacenamiento: recibe las sesiones, el objetivo y el "hoy" local
("AAAA-MM-DD") como parámetros y devuelve el total y el estado de cumplimiento,
sin leer ni escribir la interfaz ni el almacenamiento.
- RNF-5: La lógica nueva debe verificarse con `node --test`, sin instalar
paquetes.
- RNF-6: El código nuevo debe estar en inglés; la interfaz y la documentación en
español.
- RNF-7: La barra de progreso debe exponer su estado como texto accesible además
del color (el texto "X de Y min" y el mensaje de cumplimiento deben ser legibles
sin depender del color).

## Casos límite
- Varias sesiones el mismo día se suman antes de comparar con el objetivo.
- Sesión registrada a las 00:30: cuenta en su fecha local, como el resto del
proyecto.
- Día del cambio de hora (último domingo de marzo y de octubre): la semana sigue
siendo de lunes a domingo en fecha local; el cómputo por fecha no pierde ni duplica
días.
- Semana a caballo entre dos meses o entre diciembre y enero: el progreso no se
corta, sigue la regla lunes–domingo.
- Cambio de semana: al llegar el lunes, el progreso vuelve a 0 de forma automática
manteniendo el mismo objetivo.
- Objetivo con espacios (" 60 ") se acepta como 60; "3.0", "3,5", "+60" o "1e2"
se rechazan con error en español.
- Confirmar el mismo valor vigente es válido y no cambia nada; quitar sin objetivo
no hace nada ni muestra error.
- Objetivo muy grande: se guarda igual; la barra muestra un progreso mínimo sin
errores ni desbordes.
- Sesiones futuras o con fecha inválida: no suman al progreso y no se modifican.
- Quitar el objetivo y fijar uno nuevo después: vuelve a mostrarse el progreso con
el total de la semana actual, sin pérdida de sesiones.
- Sesión de una semana pasada con objetivo vigente: no cambia el progreso actual.
- Objetivo guardado corrupto o datos viejos sin objetivo: se abre como "sin
objetivo" con las sesiones intactas.
- Fallo de guardado del objetivo: se avisa en español y la sesión en curso sigue
funcionando con las sesiones intactas.

## Fuera de alcance
- Objetivos distintos por semana o historial de semanas cumplidas.
- Recordatorios, avisos o celebraciones más allá del mensaje de cumplimiento.
- Cambiar el total semanal existente o las reglas de racha, mes y mapa de calor.
- Editar o borrar sesiones desde el objetivo.
- Estadísticas diarias, mensuales o por tema ligadas al objetivo.

## Criterios de finalización
- Fijar un objetivo válido muestra "X de Y min" con barra; registrar una sesión de
la semana actual actualiza texto, barra y mensaje al instante; registrar una de
semana pasada o futura no cambia el progreso; todo sin errores en consola.
- Un valor no válido ("", "0", "3.0", "abc") muestra error en español y conserva el
objetivo anterior.
- Al alcanzar el objetivo aparece exactamente "¡Objetivo cumplido! 🎉"; al
superarlo, el texto muestra el exceso y la barra queda llena al 100 %.
- Quitar el objetivo vuelve a la invitación; recargar mantiene el objetivo; el
lunes el progreso reinicia con el mismo objetivo.
- Datos viejos (solo sesiones) abren como "sin objetivo" con sesiones intactas;
objetivo corrupto no bloquea ni borra sesiones.
- La vista móvil a 375 px no tiene scroll horizontal.
- `node --test` en verde (prohibido avanzar en rojo, según la constitución).

## Dudas abiertas
- Ninguna: todas las decisiones indicadas por QA están tomadas arriba.
