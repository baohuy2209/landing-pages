import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(
  new URL("../lib/motion.ts", import.meta.url),
  "utf8",
);
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { beginMove, motionAt } = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
);
test("an opening move lifts off and lands without a position jump", () => {
  const move = beginMove([0, 0, 0], [2, 1], 3);
  assert.deepEqual(motionAt(move, 3), [0, 0, 0]);
  const end = motionAt(move, 4);
  assert.ok(Math.abs(end[1]) < 1e-10);
  assert.equal(end[0], 2);
  assert.equal(end[2], 1);
  assert.ok(motionAt(move, 3.36)[1] > 0.2);
  for (const time of [3, 3.72]) {
    const a = motionAt(move, time - 1e-6),
      b = motionAt(move, time + 1e-6);
    a.forEach((v, i) => assert.ok(Math.abs(v - b[i]) < 1e-8));
  }
});
test("rapid next, previous and reset preserve the pose already in flight", () => {
  const first = beginMove([1, 0, 2], [3, 5], 0),
    pose = motionAt(first, 0.24),
    reverse = beginMove(pose, [1, 2], 0.24);
  assert.deepEqual(motionAt(reverse, 0.24), pose);
  const nextPose = motionAt(reverse, 0.32),
    reset = beginMove(nextPose, [1, 2], 0.32);
  assert.deepEqual(motionAt(reset, 0.32), nextPose);
  assert.ok(Math.abs(motionAt(reset, 2)[1]) < 1e-10);
});
test("unchanged pieces remain grounded", () => {
  const m = beginMove([2, 0, 3], [2, 3], 0);
  for (let t = 0; t < 2; t += 0.01) assert.deepEqual(motionAt(m, t), [2, 0, 3]);
});
