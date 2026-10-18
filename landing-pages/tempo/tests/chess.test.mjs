import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const moduleURL = (source) =>
  `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText).toString("base64")}`;
const score = moduleURL(
  await readFile(new URL("../lib/game-score.ts", import.meta.url), "utf8"),
);
const source = (
  await readFile(new URL("../lib/chess.ts", import.meta.url), "utf8")
).replace('"./game-score"', JSON.stringify(score));
const api = await import(moduleURL(source));
const expected = JSON.parse(
  await readFile(new URL("./game-positions.json", import.meta.url), "utf8"),
);
function fen(step) {
  const position = api.positionAt(step);
  return Array.from({ length: 8 }, (_, row) => {
    let result = "",
      empty = 0;
    for (const file of "abcdefgh") {
      const piece = api.initialPieces.find(
        (p) => position[p.id] === file + (8 - row),
      );
      if (!piece) {
        empty++;
        continue;
      }
      if (empty) {
        result += empty;
        empty = 0;
      }
      result += piece.white ? piece.type.toUpperCase() : piece.type;
    }
    return result + (empty || "");
  }).join("/");
}
test("every position matches the 88 independently generated legal FEN fixtures", () => {
  assert.equal(api.lastPly, 87);
  for (let i = 0; i <= 87; i++) {
    assert.equal(fen(i), expected[i], `position ${i}`);
    const squares = Object.values(api.positionAt(i)).filter(Boolean);
    assert.equal(new Set(squares).size, squares.length);
  }
});
test("both long castles move the king and original rook together", () => {
  assert.equal(api.pieceSquare("e1", 21), "c1");
  assert.equal(api.pieceSquare("a1", 21), "d1");
  assert.equal(api.pieceSquare("e8", 26), "c8");
  assert.equal(api.pieceSquare("a8", 26), "d8");
});
test("captures, backwards seeks and reset keep persistent piece identities", () => {
  assert.equal(api.pieceSquare("a1", 47), "d4");
  assert.equal(api.pieceSquare("a1", 48), null);
  assert.equal(api.pieceSquare("a1", 47), "d4");
  assert.equal(api.pieceSquare("d1", 87), "a7");
  assert.equal(api.pieceSquare("e8", 87), "e1");
  assert.equal(api.pieceSquare("a1", 0), "a1");
  assert.equal(fen(87), "8/Q6p/6p1/5p2/5P2/2p3P1/3r3P/2K1k3");
  assert.equal(api.positionAt(-8), api.positionAt(0));
  assert.equal(api.positionAt(999), api.positionAt(87));
});
test("the archive is the complete decisive score, not a checkmate claim", async () => {
  const pgn = await readFile(
    new URL("../public/games/kasparov-topalov-1999.pgn", import.meta.url),
    "utf8",
  );
  assert.match(pgn, /44\. Qa7 1-0/);
  const sans = pgn
    .replace(/\[.*?\]/g, "")
    .replace(/\d+\./g, "")
    .trim()
    .split(/\s+/)
    .filter((s) => s !== "1-0");
  assert.deepEqual(
    sans,
    api.gameMoves.map((m) => m.notation),
  );
  assert.match(pgn, /\[Date "1999.01.20"\]/);
  assert.equal(api.moveLabel(87), "44. Qa7");
  assert.match(api.gameMoment(87), /resigns/);
});
