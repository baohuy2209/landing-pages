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

// The hero sculptures are the board's actual g1 knight, a8 rook and d1 queen.
export function arrivalPose(progress: number, index: number, target: number[]) {
  const layout = [
    [2.5, -0.5, 1.5, 3.3],
    [6.3, -0.5, -1.7, 3.1],
    [-2.5, -0.5, -1.5, 2.9],
  ][index];
  const delay = 0.12 + index * 0.045;
  const t = smooth(Math.max(0, Math.min(1, (progress - delay) / (1 - delay))));
  return {
    x: layout[0] + (target[0] - layout[0]) * t,
    y: -0.5 + 0.566 * t + Math.sin(Math.PI * t) * (3 + index * 0.45),
    z: layout[2] + (target[1] - layout[2]) * t,
    scale: layout[3] + (1 - layout[3]) * t,
    surface: -0.5 + 0.566 * t,
    t,
  };
}
