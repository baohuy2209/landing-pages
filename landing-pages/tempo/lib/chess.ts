export const opening = [
  {
    notation: "e4",
    from: "e2",
    to: "e4",
    idea: "Claim the centre. Open a path for your bishop.",
  },
  {
    notation: "e5",
    from: "e7",
    to: "e5",
    idea: "Black meets the idea with an equal share of space.",
  },
  {
    notation: "Nf3",
    from: "g1",
    to: "f3",
    idea: "Develop a knight, with a question for the e5 pawn.",
  },
  {
    notation: "Nc6",
    from: "b8",
    to: "c6",
    idea: "Defend the centre while bringing a new piece into play.",
  },
  {
    notation: "Bc4",
    from: "f1",
    to: "c4",
    idea: "The Italian Game. A bishop finds its long diagonal.",
  },
  {
    notation: "Bc5",
    from: "f8",
    to: "c5",
    idea: "The Giuoco Piano: both sides have made room to move.",
  },
];
export function squarePosition(square: string): [number, number] {
  return [
    (square.charCodeAt(0) - 97 - 3.5) * 1.12,
    (3.5 - (Number(square[1]) - 1)) * 1.12,
  ];
}
export function pieceSquare(start: string, step: number) {
  let square = start;
  for (const move of opening.slice(
    0,
    Math.max(0, Math.min(6, Math.floor(step))),
  ))
    if (square === move.from) square = move.to;
  return square;
}
export const pgn =
  '[Event "Tempo · Italian Game study"]\n[Result "*"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 *\n';
