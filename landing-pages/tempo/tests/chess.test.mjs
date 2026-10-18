import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(
  new URL("../lib/chess.ts", import.meta.url),
  "utf8",
);
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const api = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
);

const starts = [1, 2, 7, 8].flatMap((rank) =>
  [..."abcdefgh"].map((file) => `${file}${rank}`),
);
test("the opening preserves 32 distinct, occupied squares at every step", () => {
  for (let step = 0; step <= 6; step++) {
    const occupied = starts.map((start) => api.pieceSquare(start, step));
    assert.equal(new Set(occupied).size, 32);
    occupied.forEach((square) => assert.match(square, /^[a-h][1-8]$/));
  }
});
test("the Italian Game develops both central pawns, knights and bishops", () => {
  for (const [start, finish] of [
    ["e2", "e4"],
    ["e7", "e5"],
    ["g1", "f3"],
    ["b8", "c6"],
    ["f1", "c4"],
    ["f8", "c5"],
  ])
    assert.equal(api.pieceSquare(start, 6), finish);
  assert.equal(api.pieceSquare("g1", 2), "g1");
  assert.equal(api.pieceSquare("g1", 3), "f3");
  assert.equal(api.pieceSquare("g1", -1), "g1");
  assert.match(api.pgn, /1\. e4 e5 2\. Nf3 Nc6 3\. Bc4 Bc5 \*/);
});
