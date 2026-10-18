import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(
  new URL("../lib/story.ts", import.meta.url),
  "utf8",
);
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { nightAt, windowLight, wolfAt, roundResult } = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
);
test("one distribution only; cards remain face down after the night begins", () => {
  let rising = 0,
    previous = 0;
  for (let p = 0; p <= 9; p += 0.01) {
    const n = nightAt(p),
      height = n.deal * (1 - n.fold);
    if (height > 0.01 && previous <= 0.01) rising++;
    if (p >= 3) assert.equal(height, 0);
    previous = height;
  }
  assert.equal(rising, 1);
});
test("night victim and voted player stay out through sunrise", () => {
  for (let p = 6; p <= 9; p += 0.01) assert.equal(windowLight(p, 0, 0, 4), 0);
  for (let p = 8; p <= 9; p += 0.01) assert.equal(windowLight(p, 4, 0, 4), 0);
  assert.equal(windowLight(9, 1, 0, 4), 1);
});
test("scrolling backwards restores the same scene and all events are continuous", () => {
  const forward = Array.from({ length: 901 }, (_, i) => nightAt(i / 100));
  for (let i = 900; i >= 0; i--) assert.deepEqual(nightAt(i / 100), forward[i]);
  for (let i = 1; i < forward.length; i++)
    for (const k of Object.keys(forward[i]))
      assert.ok(Math.abs(forward[i][k] - forward[i - 1][k]) < 0.06, k);
});
test("sunrise never reverses into another night", () => {
  let previous = 0;
  for (let p = 5; p <= 10; p += 0.01) {
    const n = nightAt(p);
    assert.ok(n.dawn >= previous);
    previous = n.dawn;
  }
  assert.equal(nightAt(9).sunrise, 1);
});

test("the wolf enters once and leaves continuously, without reversing or teleporting", () => {
  assert.equal(wolfAt(3).visible, false);
  assert.equal(wolfAt(4).visible, true);
  assert.equal(wolfAt(5.2).visible, false);
  assert.ok(wolfAt(3).x < -40);
  assert.ok(wolfAt(5.2).x > 40);
  let previous = wolfAt(0);
  for (let p = 0.001; p < 9; p += 0.001) {
    const next = wolfAt(p);
    assert.ok(next.x >= previous.x);
    assert.ok(
      Math.hypot(
        next.x - previous.x,
        next.y - previous.y,
        next.z - previous.z,
      ) < 0.2,
    );
    assert.ok(next.y >= -0.75 && next.y <= 0);
    previous = next;
  }
});
test("the verdict accounts for the night victim and either an innocent or a wolf", () => {
  for (const victim of [0, 2, 5]) {
    assert.deepEqual(roundResult(victim, 1), { remaining: 6, wolves: 2 });
    for (const accused of [4, 6])
      assert.deepEqual(roundResult(victim, accused), {
        remaining: 6,
        wolves: 1,
      });
  }
});
