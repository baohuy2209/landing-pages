import { gameMoves } from "./game-score";
export { gameMoves };
export const gameSource =
  "https://www.chess.com/pt-BR/news/view/25-anos-atras-kasparov-topalov-1999";
export const initialPieces = [1, 2, 7, 8].flatMap((rank) =>
  [..."abcdefgh"].map((file, index) => ({
    id: `${file}${rank}`,
    type: rank === 2 || rank === 7 ? "p" : "rnbqkbnr"[index],
    white: rank < 3,
  })),
);
// Persistent identities let the same 32 sculptures survive captures, seeks and replay.
// This replays a single, independently validated score; it is not a chess rules engine.
const positions: Readonly<Record<string, string | null>>[] = [
  Object.freeze(Object.fromEntries(initialPieces.map((p) => [p.id, p.id]))),
];
for (const move of gameMoves) {
  const next = { ...positions[positions.length - 1] };
  const moving = Object.keys(next).find((id) => next[id] === move.from)!;
  const captured = Object.keys(next).find((id) => next[id] === move.to);
  if (captured) next[captured] = null;
  next[moving] = move.to;
  if (move.notation === "O-O-O") {
    const rank = move.from[1];
    next[`a${rank}`] = `d${rank}`;
  }
  positions.push(Object.freeze(next));
}
export const lastPly = gameMoves.length;
export function positionAt(step: number) {
  return positions[Math.max(0, Math.min(lastPly, Math.round(step)))];
}
export function pieceSquare(start: string, step: number) {
  return positionAt(step)[start];
}
export function squarePosition(square: string): [number, number] {
  return [
    (square.charCodeAt(0) - 97 - 3.5) * 1.12,
    (3.5 - (Number(square[1]) - 1)) * 1.12,
  ];
}
export function moveLabel(step: number) {
  if (step === 0) return "Starting position";
  const ply = Math.min(lastPly, Math.max(1, Math.round(step)));
  return `${Math.ceil(ply / 2)}${ply % 2 ? "." : "…"} ${gameMoves[ply - 1].notation}`;
}
export function gameMoment(step: number) {
  if (step === lastPly) return "1–0. Topalov resigns after 44. Qa7.";
  if (step >= 73)
    return "The final combination. Every remaining piece has a part to play.";
  if (step >= 51)
    return "A king on a journey. Follow Topalov’s king across the board.";
  if (step >= 47)
    return "24. Rxd4! A rook sacrifice changes the character of the game.";
  if (step >= 26)
    return "Both kings have castled long. The tension gathers on the queenside.";
  return "The Pirc Defence. Space, development, and the first questions.";
}
