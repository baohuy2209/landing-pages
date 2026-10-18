# Veillée

An original, fictional Werewolf game night. One miniature village carries a ten-chapter journey from dusk to sunrise: roles are dealt once, shutters close, a sculpted wolf arrives, the seer looks behind a door, and the village votes.

Choose the wolves’ target, inspect an identity and cast a vote. Lights go out, tokens gather and eliminated figures remain on the table. Scrolling backwards retraces the same round. Prepare a printable moderator guide for 8–18 players plus one moderator. This is a local illustrated story, not an online multiplayer game or an official edition.

The journey spans 21 viewport heights. Cameras, shutters, cards and lighting follow continuous scroll transitions. Mobile uses dedicated camera distances, a clear reading area and capped render resolution.

## Development

```bash
pnpm install
pnpm dev
```

Use `pnpm test`, `pnpm typecheck` and `pnpm build` to validate. On Vercel, set the root directory to `landing-pages/veillee`.

Built with Next.js, Three.js and customized shadcn/ui components based on Base UI. Fonts and artwork are local. Native scrolling, a chapter index, keyboard controls, reduced motion, an ambient-animation toggle and a readable WebGL fallback are included. The loader waits for fonts and the first rendered 3D frame.

## Credits

Original concept and procedural 3D artwork by [LN](https://lndev.me). Code: [MIT](../../LICENSE). See `app/fonts/*OFL.txt` for font licenses and [RESEARCH.md](RESEARCH.md) for creative references.

[Support the project](https://lndev.mychariow.shop/prd_3cu1s0)
