import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Run the actual timeline module without adding a second TS runtime dependency.
const source = await readFile(
  new URL("../lib/motion.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const { chapterBlend, sphereFlight } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const weights = (progress) => {
  const { from, to, mix } = chapterBlend(progress);
  const result = Array(8).fill(0);
  result[from] += 1 - mix;
  result[to] += mix;
  return result;
};

test("all seven chapter boundaries retain a complete model without a position jump", () => {
  for (let boundary = 1; boundary <= 7; boundary++) {
    const before = weights(boundary - 0.00001);
    const after = weights(boundary + 0.00001);
    assert.ok(before[boundary] > 0.999999);
    assert.equal(after[boundary], 1);
    for (let i = 0; i < 8; i++)
      assert.ok(Math.abs(before[i] - after[i]) < 1e-8);
  }
});
test("scrolling in either direction keeps chapter travel bounded and continuous", () => {
  for (let progress = -1; progress <= 9; progress += 0.002) {
    const values = weights(progress);
    assert.ok(values.every((value) => value >= -1e-12 && value <= 1 + 1e-12));
    assert.ok(Math.abs(values.reduce((a, b) => a + b, 0) - 1) < 1e-12);
    assert.ok(values.filter((value) => value > 0).length <= 2);
  }
});
test("a resting study stays fully visible before the handoff", () => {
  for (let i = 0; i < 8; i++) assert.equal(weights(i + 0.4)[i], 1);
});
test("the sphere never passes through its pedestal and lands without a jump", () => {
  for (let seconds = 0; seconds < 24; seconds += 0.01) {
    const lift = sphereFlight(seconds);
    assert.ok(lift >= 0 && lift <= 1);
    assert.ok(Math.abs(lift - sphereFlight(seconds + 0.001)) < 0.002);
  }
  for (const seam of [6.2, 8, 14.2, 16]) {
    assert.ok(sphereFlight(seam - 0.0001) < 1e-12);
    assert.ok(sphereFlight(seam + 0.0001) < 1e-12);
  }
});
