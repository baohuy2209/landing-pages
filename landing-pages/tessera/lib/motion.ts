// A chapter stays whole while its copy is read, then hands off continuously.
export function chapterBlend(progress: number) {
  const bounded = Math.max(0, Math.min(progress, 7));
  const from = Math.floor(bounded);
  const t = Math.max(0, Math.min(1, (bounded - from - 0.42) / 0.58));
  // Quintic easing: both velocity and acceleration reach zero at either end.
  const mix = t * t * t * (t * (t * 6 - 15) + 10);
  return { from, to: Math.min(7, from + 1), mix };
}

export type Spring = { value: number; velocity: number; target: number };
export function springStep(spring: Spring, delta: number) {
  // Small fixed substeps keep touch/drag release stable even on a slower device.
  let remaining = Math.min(0.05, Math.max(0, delta));
  while (remaining > 0) {
    const dt = Math.min(remaining, 1 / 120);
    spring.velocity +=
      ((spring.target - spring.value) * 100 - spring.velocity * 19) * dt;
    spring.value += spring.velocity * dt;
    remaining -= dt;
  }
}
