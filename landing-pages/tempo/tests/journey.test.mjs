import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(
  new URL("../lib/journey.ts", import.meta.url),
  "utf8",
);
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { interpolate, phase } = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
);
test("all chapter boundaries are continuous in both scroll directions", () => {
  const keys = Array.from({ length: 10 }, (_, i) => [
    i * 13,
    Math.sin(i) * 8,
    -i,
  ]);
  for (let i = 1; i < 10; i++) {
    const a = interpolate(keys, i - 1e-6),
      b = interpolate(keys, i + 1e-6);
    a.forEach((v, j) => assert.ok(Math.abs(v - b[j]) < 1e-8));
  }
});
test("overscroll remains bounded to the first and last chapters", () => {
  assert.deepEqual(phase(-2), { a: 0, b: 1, t: 0 });
  assert.deepEqual(phase(19), { a: 9, b: 9, t: 0 });
});
