export type Move = {
  from: [number, number, number];
  to: [number, number];
  start: number;
  duration: number;
  height: number;
};
const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export function beginMove(from: number[], to: number[], start: number): Move {
  const distance = Math.hypot(to[0] - from[0], to[1] - from[2]);
  return {
    from: [from[0], from[1], from[2]],
    to: [to[0], to[1]],
    start,
    duration: 0.72,
    height: Math.min(0.65, distance * 0.2),
  };
}
// A move starts at the exact current pose, including when a user reverses it in flight.
export function motionAt(move: Move, time: number): [number, number, number] {
  const t = Math.max(0, Math.min(1, (time - move.start) / move.duration)),
    e = smooth(t);
  return [
    move.from[0] + (move.to[0] - move.from[0]) * e,
    move.from[1] * (1 - e) + Math.sin(Math.PI * e) * move.height,
    move.from[2] + (move.to[1] - move.from[2]) * e,
  ];
}
