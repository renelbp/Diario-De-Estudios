const CLAVE = "diarioDeEstudio";
const GOAL_KEY = "diarioDeEstudioGoal";
const HEAT_WEEKS = 12;
const HEAT_LIMITS = [1, 30, 60, 120];

let sesiones = cargar();
let weeklyGoal = loadGoal();

const formulario = document.getElementById("formulario");
const inputFecha = document.getElementById("fecha");
const inputTema = document.getElementById("tema");
const inputMinutos = document.getElementById("minutos");
const error = document.getElementById("error");
const lista = document.getElementById("lista");
const sinSesiones = document.getElementById("sinSesiones");
const rachaNumero = document.getElementById("rachaNumero");
const rachaTexto = document.getElementById("rachaTexto");
const mejorRacha = document.getElementById("mejorRacha");
const minutosSemana = document.getElementById("minutosSemana");
const diasMes = document.getElementById("diasMes");
const heatGrid = document.getElementById("heatGrid");
const goalInvite = document.getElementById("goalInvite");
const goalProgress = document.getElementById("goalProgress");
const goalBar = document.getElementById("goalBar");
const goalFill = document.getElementById("goalFill");
const goalAchieved = document.getElementById("goalAchieved");
const goalInput = document.getElementById("goalInput");
const goalSave = document.getElementById("goalSave");
const goalClear = document.getElementById("goalClear");
const goalError = document.getElementById("goalError");

inputFecha.value = fechaLocal(new Date());
renderizar();

goalSave.addEventListener("click", function () {
  const message = saveGoal(goalInput.value);
  if (message) {
    goalError.textContent = message;
    return;
  }
  goalError.textContent = "";
  renderGoal();
});

goalClear.addEventListener("click", function () {
  const message = clearGoal();
  goalInput.value = "";
  goalError.textContent = message || "";
  renderGoal();
});

formulario.addEventListener("submit", function (e) {
  e.preventDefault();
  error.textContent = "";

  const fecha = inputFecha.value;
  const tema = inputTema.value.trim();
  const minutos = Number(inputMinutos.value);

  if (!fecha) {
    error.textContent = "Elige una fecha.";
    return;
  }
  if (!tema) {
    error.textContent = "Escribe el tema de la sesión.";
    return;
  }
  if (!Number.isFinite(minutos) || minutos <= 0) {
    error.textContent = "Los minutos deben ser un número mayor que 0.";
    return;
  }

  sesiones.push({ fecha: fecha, tema: tema, minutos: minutos });
  guardar();
  renderizar();

  inputTema.value = "";
  inputMinutos.value = "";
  inputFecha.value = fechaLocal(new Date());
  inputTema.focus();
});

function cargar() {
  const datos = localStorage.getItem(CLAVE);
  if (!datos) return [];
  try {
    const parsed = JSON.parse(datos);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function guardar() {
  localStorage.setItem(CLAVE, JSON.stringify(sesiones));
}

// Weekly goal storage in a separate key; sessions are never touched here.
// A missing, corrupt or invalid stored goal means "no goal" (null).
function loadGoal() {
  let raw = null;
  try {
    raw = localStorage.getItem(GOAL_KEY);
  } catch {
    return null;
  }
  if (raw === null || raw === undefined) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed === "number") {
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
  }
  if (typeof parsed === "string") {
    return parseGoalText(parsed);
  }
  return null;
}

// Stores raw text as the goal after validating it. Returns null on success
// or an error message in Spanish; an invalid value keeps the previous goal.
function saveGoal(text) {
  const value = typeof text === "number" ? text : parseGoalText(text);
  if (!Number.isSafeInteger(value) || value <= 0) {
    return "El objetivo debe ser un número entero mayor que 0.";
  }
  weeklyGoal = value;
  try {
    localStorage.setItem(GOAL_KEY, JSON.stringify(value));
  } catch {
    return "No se ha podido guardar el objetivo, pero se mantiene en esta sesión.";
  }
  return null;
}

// Removes the goal and goes back to "no goal". Sessions are never touched.
function clearGoal() {
  weeklyGoal = null;
  try {
    localStorage.removeItem(GOAL_KEY);
  } catch {
    return "No se ha podido quitar el objetivo guardado, pero se quita en esta sesión.";
  }
  return null;
}

function getWeeklyGoal() {
  return weeklyGoal;
}

// Fecha local en formato "YYYY-MM-DD" (sin usar UTC)
function fechaLocal(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function calcularRacha() {
  const dias = new Set(sesiones.map(function (s) { return s.fecha; }));
  const hoy = new Date();

  let inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  if (!dias.has(fechaLocal(inicio))) {
    // Si hoy aún no estudié, la racha sigue viva desde ayer
    const ayer = new Date(inicio);
    ayer.setDate(ayer.getDate() - 1);
    if (dias.has(fechaLocal(ayer))) {
      inicio = ayer;
    } else {
      return 0;
    }
  }

  let racha = 0;
  const dia = new Date(inicio);
  while (dias.has(fechaLocal(dia))) {
    racha++;
    dia.setDate(dia.getDate() - 1);
  }
  return racha;
}

function calcularMejorRacha() {
  const hoy = fechaLocal(new Date());
  // Días únicos hasta hoy (las fechas futuras no suman)
  const dias = Array.from(new Set(sesiones.map(function (s) { return s.fecha; })))
    .filter(function (fecha) { return fecha <= hoy; })
    .sort();

  let maxima = 0;
  let actual = 0;
  let anterior = null;
  dias.forEach(function (fecha) {
    if (anterior !== null && esDiaSiguiente(anterior, fecha)) {
      actual++;
    } else {
      actual = 1;
    }
    if (actual > maxima) maxima = actual;
    anterior = fecha;
  });
  return maxima;
}

// ¿Es "siguiente" el día justo después de "anterior"? (todo en hora local)
function esDiaSiguiente(anterior, siguiente) {
  const partes = anterior.split("-");
  const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  fecha.setDate(fecha.getDate() + 1);
  return fechaLocal(fecha) === siguiente;
}

function calcularMinutosSemana() {
  return sumWeekMinutes(sesiones, fechaLocal(new Date()));
}

function calcularDiasMes() {
  const hoy = fechaLocal(new Date());
  const prefijoMes = hoy.slice(0, 7);
  // Días únicos de este mes hasta hoy (las fechas futuras no suman)
  const dias = new Set();
  sesiones.forEach(function (s) {
    if (s.fecha.slice(0, 7) === prefijoMes && s.fecha <= hoy) {
      dias.add(s.fecha);
    }
  });
  return dias.size;
}

// Heat map data: 12 weeks (Monday-Sunday) ending in the current week.
// Pure: no DOM, no localStorage. Sessions use the stored shape.
// today is "AAAA-MM-DD" in local time.
function levelForMinutes(minutes) {
  let level = 0;
  for (let i = 0; i < HEAT_LIMITS.length; i++) {
    if (minutes >= HEAT_LIMITS[i]) level = i + 1;
  }
  return level;
}

function isValidDateText(text) {
  if (typeof text !== "string") return false;
  const parts = text.split("-");
  if (parts.length !== 3) return false;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  // Round-trip check rejects overflow like month 13 or day 40
  const date = new Date(y, m - 1, d);
  return fechaLocal(date) === text;
}

function buildHeatmapData(sessions, today) {
  const totals = {};
  sessions.forEach(function (s) {
    if (!isValidDateText(s.fecha) || s.fecha > today) return;
    const minutes = Number(s.minutos);
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    totals[s.fecha] = (totals[s.fecha] || 0) + minutes;
  });

  // First Monday of the window, all in local time
  const start = parseLocalDate(today);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (HEAT_WEEKS - 1) * 7);

  const weeks = [];
  const day = new Date(start);
  for (let w = 0; w < HEAT_WEEKS; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = fechaLocal(day);
      const minutes = totals[date] || 0;
      week.push({
        date: date,
        minutes: minutes,
        level: levelForMinutes(minutes),
        isFuture: date > today
      });
      day.setDate(day.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

// "AAAA-MM-DD" to local Date. Never new Date("AAAA-MM-DD"): it parses as UTC.
function parseLocalDate(text) {
  const parts = text.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

// Weekly goal, pure: no DOM, no localStorage. today is "AAAA-MM-DD" local time.
function parseGoalText(text) {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!/^[0-9]+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value) || value <= 0) return null;
  return value;
}

function sumWeekMinutes(sessions, today) {
  if (!Array.isArray(sessions)) return 0;
  const monday = parseLocalDate(today);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const mondayStr = fechaLocal(monday);

  let total = 0;
  sessions.forEach(function (s) {
    if (!s || !isValidDateText(s.fecha)) return;
    if (s.fecha < mondayStr || s.fecha > today) return;
    const minutes = Number(s.minutos);
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    total += minutes;
  });
  return total;
}

function buildWeeklyGoalProgress(sessions, goal, today) {
  const total = sumWeekMinutes(sessions, today);
  if (!Number.isSafeInteger(goal) || goal <= 0) {
    return { hasGoal: false, total: total };
  }
  return {
    hasGoal: true,
    total: total,
    goal: goal,
    achieved: total >= goal,
    barPercent: Math.min(100, Math.floor(total * 100 / goal))
  };
}

function formatoFecha(fechaStr) {
  const partes = fechaStr.split("-");
  const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function renderHeatmap() {
  const today = fechaLocal(new Date());
  const weeks = buildHeatmapData(sesiones, today);
  heatGrid.innerHTML = "";
  weeks.forEach(function (week) {
    const column = document.createElement("li");
    column.className = "heat-col";
    week.forEach(function (day) {
      const cell = document.createElement("span");
      cell.className = "heat-cell heat-" + day.level + (day.isFuture ? " heat-future" : "");
      const label = formatoFecha(day.date) + ": " +
        (day.isFuture ? "día futuro" : day.minutes === 0 ? "sin estudio" : day.minutes + " min");
      cell.title = label;
      cell.setAttribute("aria-label", label);
      column.appendChild(cell);
    });
    heatGrid.appendChild(column);
  });
}

function renderGoal() {
  const progress = buildWeeklyGoalProgress(sesiones, weeklyGoal, fechaLocal(new Date()));
  if (!progress.hasGoal) {
    goalInvite.hidden = false;
    goalProgress.hidden = true;
    goalBar.hidden = true;
    goalAchieved.hidden = true;
    goalClear.hidden = true;
    return;
  }
  const text = progress.total + " de " + progress.goal + " min";
  goalInvite.hidden = true;
  goalProgress.hidden = false;
  goalProgress.textContent = text;
  goalBar.hidden = false;
  goalBar.setAttribute("aria-valuemax", String(progress.goal));
  goalBar.setAttribute("aria-valuenow", String(progress.total));
  goalBar.setAttribute("aria-valuetext", text);
  goalFill.style.width = progress.barPercent + "%";
  goalAchieved.hidden = !progress.achieved;
  goalClear.hidden = false;
  goalInput.value = String(progress.goal);
}

function renderizar() {
  const racha = calcularRacha();
  rachaNumero.textContent = racha + " 🔥";
  rachaTexto.textContent = racha === 1 ? "día de racha" : "días de racha";

  const mejor = calcularMejorRacha();
  mejorRacha.textContent = "Mejor racha: " + mejor + (mejor === 1 ? " día 🏆" : " días 🏆");

  const minutos = calcularMinutosSemana();
  minutosSemana.textContent = "Esta semana: " + minutos + " min ⏱️";

  const diasEsteMes = calcularDiasMes();
  diasMes.textContent = "Este mes: " + diasEsteMes + (diasEsteMes === 1 ? " día 📅" : " días 📅");

  renderHeatmap();
  renderGoal();

  // Más recientes primero; si hay varias del mismo día, las últimas añadidas arriba
  const ordenadas = sesiones
    .map(function (s, i) { return { s: s, i: i }; })
    .sort(function (a, b) {
      if (a.s.fecha !== b.s.fecha) return a.s.fecha < b.s.fecha ? 1 : -1;
      return b.i - a.i;
    });

  lista.innerHTML = "";
  sinSesiones.style.display = ordenadas.length === 0 ? "block" : "none";

  ordenadas.forEach(function (item) {
    const li = document.createElement("li");

    const tema = document.createElement("span");
    tema.className = "tema";
    tema.textContent = item.s.tema;

    const detalle = document.createElement("span");
    detalle.className = "detalle";
    detalle.textContent = item.s.minutos + " min, " + formatoFecha(item.s.fecha);

    li.appendChild(tema);
    li.appendChild(detalle);
    lista.appendChild(li);
  });
}

// Exposes the pure logic to node --test. In the browser "module" does not
// exist, so these lines do nothing there.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    GOAL_KEY: GOAL_KEY,
    buildHeatmapData: buildHeatmapData,
    clearGoal: clearGoal,
    getWeeklyGoal: getWeeklyGoal,
    levelForMinutes: levelForMinutes,
    loadGoal: loadGoal,
    parseGoalText: parseGoalText,
    saveGoal: saveGoal,
    sumWeekMinutes: sumWeekMinutes,
    buildWeeklyGoalProgress: buildWeeklyGoalProgress
  };
}
