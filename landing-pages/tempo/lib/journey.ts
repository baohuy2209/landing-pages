export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const ease = (n: number) => {
  const t = clamp(n);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
// Each chapter has a still reading beat, followed by a continuous spatial move.
export function phase(value: number, count = 10) {
  const p = Math.max(0, Math.min(count - 1, value));
  const a = Math.floor(p);
  return { a, b: Math.min(count - 1, a + 1), t: ease((p - a - 0.18) / 0.82) };
}
export function interpolate(keys: number[][], value: number) {
  const { a, b, t } = phase(value, keys.length);
  return keys[a].map((v, i) => v + (keys[b][i] - v) * t);
}
export function download(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
