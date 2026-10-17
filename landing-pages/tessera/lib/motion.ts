// A chapter stays whole while its copy is read, then hands off continuously.
export function chapterBlend(progress: number) {
  const bounded = Math.max(0, Math.min(progress, 7));
  const from = Math.floor(bounded);
  const t = Math.max(0, Math.min(1, (bounded - from - 0.42) / 0.58));
  // Quintic easing: both velocity and acceleration reach zero at either end.
  const mix = t * t * t * (t * (t * 6 - 15) + 10);
  return { from, to: Math.min(7, from + 1), mix };
}

// The sphere takes off, floats and lands before resting on its pedestal.
// Zero velocity at lift-off/landing also makes the eight-second loop seamless.
export function sphereFlight(seconds: number) {
  const cycle = ((seconds % 8) + 8) % 8;
  return Math.sin(Math.PI * Math.min(1, cycle / 6.2)) ** 4;
}
