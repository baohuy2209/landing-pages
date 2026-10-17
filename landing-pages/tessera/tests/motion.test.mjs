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
const { chapterBlend, springStep } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const weights = (progress) => {
  const { from, to, mix } = chapterBlend(progress);
  const result = Array(8).fill(0);
  result[from] += 1 - mix;
  result[to] += mix;
  return result;
};

test("all seven chapter boundaries retain a complete model without a visibility jump", () => {
  for (let boundary = 1; boundary <= 7; boundary++) {
    const before = weights(boundary - 0.00001);
    const after = weights(boundary + 0.00001);
    assert.ok(before[boundary] > 0.999999);
    assert.equal(after[boundary], 1);
    for (let i = 0; i < 8; i++)
      assert.ok(Math.abs(before[i] - after[i]) < 1e-8);
  }
});
test("scrolling in either direction never produces an empty or overbright frame", () => {
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
test("drag release converges at 24, 30, 60 and 120 fps without a large bounce", () => {
  for (const fps of [24, 30, 60, 120]) {
    const spring = { value: 0, velocity: 0, target: -0.55 };
    for (let i = 0; i < fps * 3; i++) {
      springStep(spring, 1 / fps);
      assert.ok(spring.value <= 0.001 && spring.value >= -0.56);
    }
    assert.ok(Math.abs(spring.value + 0.55) < 0.0001);
    spring.target = 0.8;
    for (let i = 0; i < fps * 3; i++) springStep(spring, 1 / fps);
    assert.ok(Math.abs(spring.value - 0.8) < 0.0001);
  }
});
test("resuming a suspended tab cannot launch a model out of frame", () => {
  const spring = { value: 0, velocity: 0, target: 0.8 };
  springStep(spring, 30);
  assert.ok(spring.value >= 0 && spring.value < 0.3);
});
