// One reversible night. Every consequence remains in the village until the end.
export const houses = [
  { name: "The mill", role: "Villager" },
  { name: "The inn", role: "Villager" },
  { name: "The forge", role: "Villager" },
  { name: "The orchard", role: "Villager" },
  { name: "The bakery", role: "Werewolf" },
  { name: "The tower", role: "Villager" },
  { name: "The cottage", role: "Werewolf" },
  { name: "The chapel", role: "Seer" },
];
export function cue(p: number, start: number, end: number) {
  const t = Math.max(0, Math.min(1, (p - start) / (end - start)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
export function nightAt(p: number) {
  return {
    deal: cue(p, 1.25, 1.95),
    fold: cue(p, 2.35, 2.95),
    asleep: cue(p, 2.35, 3),
    hunt: cue(p, 3.25, 4),
    retreat: cue(p, 4.35, 5.1),
    vision: cue(p, 4.45, 5) * (1 - cue(p, 5.4, 5.95)),
    loss: cue(p, 5.35, 6),
    dawn: cue(p, 5.4, 6.4),
    vote: cue(p, 6.35, 7),
    verdict: cue(p, 7.35, 8),
    sunrise: cue(p, 7.5, 8.75),
  };
}
export function windowLight(
  p: number,
  house: number,
  victim: number,
  accused: number,
) {
  const n = nightAt(p);
  const alive =
    (1 - (house === victim ? n.loss : 0)) *
    (1 - (house === accused ? n.verdict : 0));
  return alive * (1 - n.asleep * 0.9 * (1 - n.dawn));
}
