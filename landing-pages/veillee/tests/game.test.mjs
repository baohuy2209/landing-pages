import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(
  new URL("../lib/game.ts", import.meta.url),
  "utf8",
);
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const api = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
);

test("every party size assigns exactly one role per player", () => {
  for (let size = 8; size <= 18; size++) {
    const p = api.party(size);
    assert.equal(p.wolves + p.seers + p.villagers, size);
    assert.equal(p.seers, 1);
    assert.ok(p.villagers > p.wolves);
  }
  assert.equal(api.party(2).players, 8);
  assert.equal(api.party(30).players, 18);
});
test("the printable guide matches the chosen table and names the moderator", () => {
  const guide = api.hostGuide(14);
  assert.ok(guide.includes("14 players + 1 moderator"));
  assert.ok(guide.includes("3 werewolves / 1 seer / 10 villagers"));
});
