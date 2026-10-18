# Veillée

An original, fictional Werewolf game night. A miniature forest village, illustrated role cards, a bronze wolf mask and a seer’s orb carry a ten-chapter journey from dusk to sunrise.

Explore three roles, draw a sample secret identity and prepare a printable moderator guide for 8–18 players plus one moderator. These are local demonstrations of our introductory variant, not an online multiplayer game or an official edition.

The journey spans 21 viewport heights, with continuous camera and object transitions. Mobile uses a dedicated composition and a capped render resolution.

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
