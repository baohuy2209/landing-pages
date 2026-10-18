import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function load(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  return import(
    `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText).toString("base64")}`
  );
}
const { studySlide, studyMotion, SCENE_TRAVEL, STUDY_BEAT, sculptureSurface } =
  await load("../lib/study-motion.ts");
const { interpolate } = await load("../lib/journey.ts");
test("each study enters and exits with exactly the board's spatial transition", () => {
  for (let i = 0; i < 6; i++)
    for (let t = 0; t <= 1; t += 0.01) {
      const arrival = interpolate([[SCENE_TRAVEL], [0]], t)[0];
      const exit = interpolate([[0], [-SCENE_TRAVEL]], t)[0];
      assert.ok(Math.abs(studySlide(i, i + 1 + t) - 3.2 - arrival) < 1e-10);
      assert.ok(Math.abs(studySlide(i, i + 2 + t) - 3.2 - exit) < 1e-10);
    }
});
test("the six pieces move, stay grounded or lift, and never jump at a route boundary", () => {
  for (let i = 0; i < 6; i++) {
    const start = studyMotion(i, 0),
      moving = studyMotion(i, 2);
    assert.notDeepEqual(start, moving);
    for (let t = 0; t < 40; t += 0.01) {
      const p = studyMotion(i, t),
        next = studyMotion(i, t + 1e-5);
      assert.ok(p.y >= -1e-10);
      assert.ok(Math.abs(p.x) <= 4.4 + 1e-10 && Math.abs(p.z) <= 4.4 + 1e-10);
      for (const key of ["x", "y", "z"])
        assert.ok(Math.abs(next[key] - p[key]) < 0.001);
    }
  }
});
test("pawn only advances; the other pieces land on legal relative destinations", () => {
  let z = 0;
  for (let t = 0; t < 30; t += 0.01) {
    const p = studyMotion(0, t);
    assert.ok(p.z <= z + 1e-9);
    z = p.z;
  }
  assert.equal(z, -4.4);
  for (let i = 1; i < 6; i++)
    for (let n = 0; n < 8; n++) {
      const a = studyMotion(i, n * STUDY_BEAT),
        b = studyMotion(i, (n + 1) * STUDY_BEAT);
      const dx = Math.round(Math.abs(b.x - a.x) / 2.2),
        dz = Math.round(Math.abs(b.z - a.z) / 2.2);
      if (i === 1) assert.deepEqual([dx, dz].sort(), [1, 2]);
      if (i === 2) assert.equal(dx, dz);
      if (i === 3) assert.ok(dx === 0 || dz === 0);
      if (i === 4) assert.ok(dx === 0 || dz === 0 || dx === dz);
      if (i === 5) assert.equal(Math.max(dx, dz), 1);
    }
});
test("solid surfaces always write depth, so floor patterns cannot show through", () => {
  assert.deepEqual(sculptureSurface(false), {
    transparent: false,
    depthWrite: true,
    alphaHash: false,
  });
  assert.deepEqual(sculptureSurface(false, true), {
    transparent: false,
    depthWrite: true,
    alphaHash: true,
  });
  assert.deepEqual(sculptureSurface(true, true), {
    transparent: true,
    depthWrite: false,
    alphaHash: false,
  });
});
