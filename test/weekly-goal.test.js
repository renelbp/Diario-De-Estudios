// Weekly goal tests with node --test, no dependencies.
// app.js touches document and localStorage on load, so they are stubbed
// with minimal objects before requiring it. Only the pure logic is tested.
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");

function stubElement() {
  return {
    value: "",
    textContent: "",
    innerHTML: "",
    className: "",
    style: {},
    setAttribute: function () {},
    appendChild: function () {},
    addEventListener: function () {},
    focus: function () {}
  };
}

global.document = {
  getElementById: function () { return stubElement(); },
  createElement: function () { return stubElement(); }
};
global.localStorage = {
  getItem: function () { return null; },
  setItem: function () {}
};

const app = require("../app.js");
const parseGoalText = app.parseGoalText;
const sumWeekMinutes = app.sumWeekMinutes;
const buildWeeklyGoalProgress = app.buildWeeklyGoalProgress;

describe("parseGoalText", function () {
  it("accepts digits with spaces and leading zeros", function () {
    assert.equal(parseGoalText(" 60 "), 60);
    assert.equal(parseGoalText("007"), 7);
    assert.equal(parseGoalText("120"), 120);
  });

  it("rejects empty, zero, signs, decimals, exponents and letters", function () {
    assert.equal(parseGoalText(""), null);
    assert.equal(parseGoalText("   "), null);
    assert.equal(parseGoalText("0"), null);
    assert.equal(parseGoalText("-5"), null);
    assert.equal(parseGoalText("3.0"), null);
    assert.equal(parseGoalText("3,5"), null);
    assert.equal(parseGoalText("1e2"), null);
    assert.equal(parseGoalText("+60"), null);
    assert.equal(parseGoalText("abc"), null);
    assert.equal(parseGoalText("60 min"), null);
  });
});

describe("sumWeekMinutes", function () {
  it("counts Monday but not the previous Sunday", function () {
    // 2026-10-05 is Monday, 2026-10-04 the previous Sunday, today Wednesday
    const sessions = [
      { fecha: "2026-10-05", tema: "A", minutos: 30 },
      { fecha: "2026-10-04", tema: "B", minutos: 50 }
    ];
    assert.equal(sumWeekMinutes(sessions, "2026-10-07"), 30);
  });

  it("excludes future sessions", function () {
    const sessions = [
      { fecha: "2026-10-07", tema: "A", minutos: 20 },
      { fecha: "2026-10-08", tema: "B", minutos: 40 }
    ];
    assert.equal(sumWeekMinutes(sessions, "2026-10-07"), 20);
  });

  it("ignores invalid dates and invalid minutes", function () {
    const sessions = [
      { fecha: "2026-10-06", tema: "A", minutos: 25 },
      { fecha: "not-a-date", tema: "B", minutos: 60 },
      { tema: "C", minutos: 60 },
      { fecha: "2026-10-06", tema: "D", minutos: "x" },
      { fecha: "2026-10-06", tema: "E", minutos: -10 },
      { fecha: "2026-10-06", tema: "F", minutos: 0 }
    ];
    assert.equal(sumWeekMinutes(sessions, "2026-10-07"), 25);
  });

  it("spans month boundaries within the same Monday-Sunday week", function () {
    // Monday 2026-09-28 to Sunday 2026-10-04, today Thursday 2026-10-01
    const sessions = [
      { fecha: "2026-09-28", tema: "A", minutos: 20 },
      { fecha: "2026-10-01", tema: "B", minutos: 15 },
      { fecha: "2026-09-27", tema: "C", minutos: 99 }
    ];
    assert.equal(sumWeekMinutes(sessions, "2026-10-01"), 35);
  });

  it("spans year boundaries within the same Monday-Sunday week", function () {
    // Monday 2025-12-29 to Sunday 2026-01-04, today Friday 2026-01-02
    const sessions = [
      { fecha: "2025-12-29", tema: "A", minutos: 10 },
      { fecha: "2026-01-01", tema: "B", minutos: 20 },
      { fecha: "2025-12-28", tema: "C", minutos: 99 },
      { fecha: "2026-01-03", tema: "D", minutos: 99 }
    ];
    assert.equal(sumWeekMinutes(sessions, "2026-01-02"), 30);
  });
});

describe("buildWeeklyGoalProgress", function () {
  it("reports no goal without a valid target", function () {
    const sessions = [{ fecha: "2026-10-07", tema: "A", minutos: 30 }];
    assert.deepEqual(buildWeeklyGoalProgress(sessions, null, "2026-10-07"),
      { hasGoal: false, total: 30 });
    assert.deepEqual(buildWeeklyGoalProgress(sessions, 0, "2026-10-07"),
      { hasGoal: false, total: 30 });
    assert.deepEqual(buildWeeklyGoalProgress(sessions, undefined, "2026-10-07"),
      { hasGoal: false, total: 30 });
  });

  it("reports zero progress with a goal and no sessions", function () {
    assert.deepEqual(buildWeeklyGoalProgress([], 60, "2026-10-07"),
      { hasGoal: true, total: 0, goal: 60, achieved: false, barPercent: 0 });
  });

  it("reports partial progress proportionally", function () {
    const sessions = [{ fecha: "2026-10-07", tema: "A", minutos: 30 }];
    assert.deepEqual(buildWeeklyGoalProgress(sessions, 60, "2026-10-07"),
      { hasGoal: true, total: 30, goal: 60, achieved: false, barPercent: 50 });
  });

  it("reports achieved on an exact match", function () {
    const sessions = [{ fecha: "2026-10-07", tema: "A", minutos: 60 }];
    assert.deepEqual(buildWeeklyGoalProgress(sessions, 60, "2026-10-07"),
      { hasGoal: true, total: 60, goal: 60, achieved: true, barPercent: 100 });
  });

  it("keeps the excess in the total but caps the bar at 100", function () {
    const sessions = [
      { fecha: "2026-10-06", tema: "A", minutos: 50 },
      { fecha: "2026-10-07", tema: "B", minutos: 40 }
    ];
    assert.deepEqual(buildWeeklyGoalProgress(sessions, 60, "2026-10-07"),
      { hasGoal: true, total: 90, goal: 60, achieved: true, barPercent: 100 });
  });

  it("handles a huge goal without breaking", function () {
    const sessions = [{ fecha: "2026-10-07", tema: "A", minutos: 30 }];
    const progress = buildWeeklyGoalProgress(sessions, Number.MAX_SAFE_INTEGER, "2026-10-07");
    assert.equal(progress.hasGoal, true);
    assert.equal(progress.total, 30);
    assert.equal(progress.achieved, false);
    assert.equal(progress.barPercent, 0);
  });
});

describe("weekly goal persistence", function () {
  const GOAL_KEY = app.GOAL_KEY;
  const SESSIONS_KEY = "diarioDeEstudio";
  const savedSessions = JSON.stringify([{ fecha: "2026-10-07", tema: "A", minutos: 30 }]);
  let originalStorage;

  // Minimal localStorage fake with an inspectable store.
  function makeStorage(initial, failures) {
    const store = Object.assign({}, initial);
    failures = failures || {};
    return {
      store: store,
      getItem: function (key) {
        if (failures.get) throw new Error("no disponible");
        return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
      },
      setItem: function (key, value) {
        if (failures.set) throw new Error("lleno");
        store[key] = String(value);
      },
      removeItem: function (key) {
        if (failures.remove) throw new Error("no disponible");
        delete store[key];
      }
    };
  }

  function useStorage(storage) {
    global.localStorage = storage;
  }

  function resetGoal() {
    useStorage(makeStorage({}));
    app.clearGoal();
  }

  before(function () {
    originalStorage = global.localStorage;
  });

  after(function () {
    global.localStorage = originalStorage;
  });

  it("loads null when the goal is missing, corrupt or invalid, keeping sessions intact", function () {
    const raws = [
      undefined, // missing key: old session-only data
      "{no-json", // corrupt JSON
      '"abc"', '"0"', '"-5"', '"3.0"', // invalid strings
      "0", "-5", "3.5", "null", "[60]", '{"goal":60}' // invalid numbers/other JSON
    ];
    raws.forEach(function (raw) {
      const initial = {};
      initial[SESSIONS_KEY] = savedSessions;
      if (raw !== undefined) initial[GOAL_KEY] = raw;
      const storage = makeStorage(initial);
      useStorage(storage);
      assert.equal(app.loadGoal(), null);
      assert.equal(storage.store[SESSIONS_KEY], savedSessions);
    });
  });

  it("loads a valid stored goal", function () {
    const cases = [["120", 120], ["60", 60], ['" 90 "', 90]];
    cases.forEach(function (pair) {
      const initial = {};
      initial[SESSIONS_KEY] = savedSessions;
      initial[GOAL_KEY] = pair[0];
      useStorage(makeStorage(initial));
      assert.equal(app.loadGoal(), pair[1]);
    });
  });

  it("saves a valid goal and keeps sessions intact", function () {
    resetGoal();
    const initial = {};
    initial[SESSIONS_KEY] = savedSessions;
    const storage = makeStorage(initial);
    useStorage(storage);
    assert.equal(app.saveGoal(" 90 "), null);
    assert.equal(app.getWeeklyGoal(), 90);
    assert.equal(storage.store[GOAL_KEY], "90");
    assert.equal(storage.store[SESSIONS_KEY], savedSessions);
  });

  it("rejects invalid text, keeps the previous goal and explains in Spanish", function () {
    resetGoal();
    const initial = {};
    initial[SESSIONS_KEY] = savedSessions;
    const storage = makeStorage(initial);
    useStorage(storage);
    assert.equal(app.saveGoal("60"), null);
    ["", "0", "-5", "3.0", "3,5", "1e2", "+60", "abc"].forEach(function (text) {
      const message = app.saveGoal(text);
      assert.ok(typeof message === "string" && message.indexOf("objetivo") !== -1);
      assert.equal(app.getWeeklyGoal(), 60);
    });
    assert.equal(storage.store[GOAL_KEY], "60");
    assert.equal(storage.store[SESSIONS_KEY], savedSessions);
  });

  it("keeps the goal in memory with a Spanish warning when saving fails", function () {
    resetGoal();
    const initial = {};
    initial[SESSIONS_KEY] = savedSessions;
    const storage = makeStorage(initial, { set: true });
    useStorage(storage);
    const message = app.saveGoal("45");
    assert.ok(typeof message === "string" && message.indexOf("objetivo") !== -1);
    assert.equal(app.getWeeklyGoal(), 45);
    assert.equal(storage.store[SESSIONS_KEY], savedSessions);
    assert.ok(!Object.prototype.hasOwnProperty.call(storage.store, GOAL_KEY));
  });

  it("clears the goal back to no goal and keeps sessions intact", function () {
    resetGoal();
    const initial = {};
    initial[SESSIONS_KEY] = savedSessions;
    const storage = makeStorage(initial);
    useStorage(storage);
    assert.equal(app.saveGoal("60"), null);
    assert.equal(app.clearGoal(), null);
    assert.equal(app.getWeeklyGoal(), null);
    assert.equal(app.loadGoal(), null);
    assert.equal(storage.store[SESSIONS_KEY], savedSessions);
  });

  it("still clears memory with a Spanish warning when removal fails", function () {
    resetGoal();
    useStorage(makeStorage({}));
    assert.equal(app.saveGoal("60"), null);
    const initial = {};
    initial[GOAL_KEY] = "60";
    initial[SESSIONS_KEY] = savedSessions;
    const storage = makeStorage(initial, { remove: true });
    useStorage(storage);
    const message = app.clearGoal();
    assert.ok(typeof message === "string" && message.indexOf("objetivo") !== -1);
    assert.equal(app.getWeeklyGoal(), null);
    assert.equal(storage.store[SESSIONS_KEY], savedSessions);
  });
});
