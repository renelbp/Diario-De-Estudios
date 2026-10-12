# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual, mejor racha,
total semanal, días del mes, mapa de calor y lista de sesiones.
- Datos en localStorage, clave `diarioDeEstudio` con forma `{ fecha, tema, minutos }`.
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Mejor racha calculada al vuelo, no guardada: evita migración y desincronización.
- Total semanal lunes-domingo calculado al vuelo, en minutos simples y sin futuro.
- Días del mes (mes natural, días únicos) calculados al vuelo y sin futuro.
- Mapa de calor 12 semanas (spec 001 hecha): función pura con hoy como parámetro,
tests `node --test` en verde, código nuevo en inglés.
- AGENTS.md alineado al código (era el que describía otra clave y otros nombres).
- Diseño de cuaderno: papel, tinta y acento boli; cifra de racha con círculo a boli.
- Spec 002 T2 hecha: objetivo en clave `diarioDeEstudioGoal` (número JSON);
`loadGoal`/`saveGoal`/`clearGoal`/`getWeeklyGoal` en app.js, sin tocar render ni DOM;
`saveGoal`/`clearGoal` devuelven `null` o error en español; tests de persistencia en
test/weekly-goal.test.js (`node --test` 26/26).
## Aprendizajes y errores a evitar
- Las fechas se comparan y construyen en hora local; nunca `toISOString()` ni
`new Date("AAAA-MM-DD")`.
## Próximos pasos
- Spec 002 hecha (T1–T6): objetivo semanal con barra, persistencia en
`diarioDeEstudioGoal`, tests `node --test` 26/26 y verificación en Chrome real. 