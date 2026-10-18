export const SCENE_TRAVEL = 64;
export const STUDY_SCALE = 2.8;
export const CELL_SIZE = 2.2;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

// All scenes use the board's spatial travel and easing. Never dissolve a sculpture.
export function studySlide(index: number, progress: number) {
  const chapter = index + 2;
  const p = Math.max(0, Math.min(9, progress));
  const a = Math.floor(p);
  const from = Math.max(-1, Math.min(1, chapter - a));
  const to = Math.max(-1, Math.min(1, chapter - Math.min(9, a + 1)));
  return (
    3.2 + (from + (to - from) * smooth((p - a - 0.18) / 0.82)) * SCENE_TRAVEL
  );
}

type Point = readonly [number, number];
const routes: readonly (readonly Point[])[] = [
  [
    [0, 0],
    [0, -1],
    [0, -2],
  ],
  [
    [0, 0],
    [2, 1],
    [0, 0],
  ],
  [
    [0, 0],
    [1, -1],
    [2, 0],
    [1, 1],
    [0, 0],
  ],
  [
    [0, 0],
    [2, 0],
    [2, 1],
    [0, 1],
    [0, 0],
  ],
  [
    [0, 0],
    [1, -1],
    [1, 1],
    [0, 0],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
  ],
];
export const STUDY_BEAT = 3;
const HOLD = 1.1;
const TRAVEL = 1.35;
export function studyMotion(index: number, elapsed: number) {
  const route = routes[index];
  const duration = (route.length - 1) * STUDY_BEAT;
  // A pawn never moves backwards. It advances twice, then waits until the scene is revisited.
  const time =
    index === 0
      ? Math.min(duration, Math.max(0, elapsed))
      : Math.max(0, elapsed) % duration;
  const leg = Math.min(route.length - 2, Math.floor(time / STUDY_BEAT));
  const phase = smooth((time - leg * STUDY_BEAT - HOLD) / TRAVEL);
  const from = route[leg],
    to = route[leg + 1];
  const xPhase = index === 1 ? smooth(phase / 0.67) : phase;
  const zPhase = index === 1 ? smooth((phase - 0.67) / 0.33) : phase;
  return {
    x: (from[0] + (to[0] - from[0]) * xPhase) * CELL_SIZE,
    y: Math.sin(Math.PI * phase) * (index === 1 ? 0.85 : 0.12),
    z: (from[1] + (to[1] - from[1]) * zPhase) * CELL_SIZE,
  };
}

// Opaque meshes write depth even during a captured-piece dissolve. Only shadows blend.
export function sculptureSurface(contactShadow: boolean, captured = false) {
  return {
    transparent: contactShadow,
    depthWrite: !contactShadow,
    alphaHash: !contactShadow && captured,
  };
}
