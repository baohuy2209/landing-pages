export const roles = [
  {
    name: "Werewolf",
    clan: "THE PACK",
    detail:
      "You know who the other wolves are. At night, choose together. By day, be wonderfully ordinary.",
  },
  {
    name: "Villager",
    clan: "THE VILLAGE",
    detail:
      "No secret power. Just your memory, your questions, and the courage to trust the right person.",
  },
  {
    name: "Seer",
    clan: "THE VILLAGE",
    detail:
      "Each night, learn one player’s role. Information is a gift. Knowing when to speak is the game.",
  },
];
export function party(size: number) {
  const players = Math.max(8, Math.min(18, Math.round(size)));
  const wolves = players < 12 ? 2 : 3;
  return { players, wolves, seers: 1, villagers: players - wolves - 1 };
}
export function hostGuide(size: number) {
  const p = party(size);
  return `VEILLÉE / A NIGHT TO REMEMBER\nOriginal Werewolf-inspired party setup\n\n${p.players} players + 1 moderator\n${p.wolves} werewolves / 1 seer / ${p.villagers} villagers\n\nBEFORE NIGHT\nAgree on a comfortable tone. Prepare shuffled, secret role cards. The moderator does not play.\n\nNIGHT\nEveryone closes their eyes. The moderator calls the wolves to choose a victim silently, then the seer to inspect one role. Call each group back to sleep.\n\nDAY\nThe moderator announces the night's outcome. The remaining players discuss, then vote to eliminate one person. Resolve tied votes by a runoff; a second tie means no elimination. Eliminated players stay silent.\n\nREPEAT\nVillagers win when all wolves are eliminated. Wolves win when they equal or outnumber the remaining village players. This is our simple introductory variant; role variants can use different win conditions.\n\nLeave the accusations at the table. Stay friends after sunrise.\n\nIndependent fictional concept by LN · lndev.me\nOpen-source code: github.com/ln-dev7/landing-pages (MIT)\n`;
}
