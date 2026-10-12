// Heat map tests with node --test, no dependencies.
// app.js touches document and localStorage on load, so they are stubbed
// with minimal objects before requiring it. Only the pure logic is tested.
const { describe, it } = require("node:test");
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
const buildHeatmapData = app.buildHeatmapData;
const levelForMinutes = app.levelForMinutes;

describe("levelForMinutes", function () {
  it("applies the 5 levels at the boundaries", function () {
    assert.equal(levelForMinutes(0), 0);
    assert.equal(levelForMinutes(1), 1);
    assert.equal(levelForMinutes(29), 1);
    assert.equal(levelForMinutes(30), 2);
    assert.equal(levelForMinutes(59), 2);
    assert.equal(levelForMinutes(60), 3);
    assert.equal(levelForMinutes(119), 3);
    assert.equal(levelForMinutes(120), 4);
    assert.equal(levelForMinutes(300), 4);
  });
});

describe("buildHeatmapData", function () {
  it("returns 12 weeks of 7 days ending today", function () {
    const weeks = buildHeatmapData([], "2026-10-09");
    assert.equal(weeks.length, 12);
    weeks.forEach(function (week) { assert.equal(week.length, 7); });
    assert.equal(weeks[11][4].date, "2026-10-09"); // Friday
    assert.equal(weeks[0][0].date, "2026-07-20"); // Monday, 11 weeks back
  });

  it("sums same-day sessions before the threshold", function () {
    const sessions = [
      { fecha: "2026-10-07", tema: "A", minutos: 20 },
      { fecha: "2026-10-07", tema: "B", minutos: 15 }
    ];
    const weeks = buildHeatmapData(sessions, "2026-10-09");
    const day = weeks[11][2]; // Wednesday
    assert.equal(day.date, "2026-10-07");
    assert.equal(day.minutes, 35);
    assert.equal(day.level, 2);
  });

  it("flags the future without adding its sessions", function () {
    const sessions = [{ fecha: "2026-10-10", tema: "A", minutos: 60 }];
    const weeks = buildHeatmapData(sessions, "2026-10-09");
    const future = weeks[11][5]; // Saturday
    assert.equal(future.date, "2026-10-10");
    assert.equal(future.isFuture, true);
    assert.equal(future.minutes, 0);
    assert.equal(future.level, 0);
  });

  it("ignores invalid minutes and malformed records", function () {
    const sessions = [
      { fecha: "2026-10-08", tema: "A", minutos: "x" },
      { fecha: "2026-10-08", tema: "B", minutos: -5 },
      { fecha: "2026-10-08", tema: "C", minutos: 10 },
      { tema: "D", minutos: 50 },
      { fecha: "not-a-date", tema: "E", minutos: 50 }
    ];
    const weeks = buildHeatmapData(sessions, "2026-10-09");
    assert.equal(weeks[11][3].minutes, 10);
  });

  it("returns an empty grid without sessions", function () {
    const weeks = buildHeatmapData([], "2026-10-09");
    weeks.forEach(function (week) {
      week.forEach(function (day) {
        if (!day.isFuture) assert.equal(day.level, 0);
      });
    });
  });
});
