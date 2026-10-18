# Tempo

An imaginary chess club, presented as a sculptural editorial journey. Ivory, graphite and vermilion pieces move through ten chapters: the board, six piece studies, a playable opening and your next game.

Step through the first six plies of the Italian Game (`1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5`), go backwards, reset the board or download the opening as a PGN. This is an interactive study, not a chess engine or multiplayer game.

The journey spans 21 viewport heights. All 32 pieces are original procedural models, with smooth profiles, bevelled details, studio lighting and continuous scroll transitions. Mobile uses its own framing.

## Development

```bash
pnpm install
pnpm dev
```

Use `pnpm test`, `pnpm typecheck` and `pnpm build` to validate. On Vercel, set the root directory to `landing-pages/tempo`.

Built with Next.js, Three.js and customized shadcn/ui components based on Base UI. Fonts and artwork are local. Native scrolling, a chapter index, keyboard controls, reduced motion, an ambient-animation toggle and a readable WebGL fallback are included. The loader waits for fonts and the first rendered 3D frame.

## Credits

Original concept and procedural 3D artwork by [LN](https://lndev.me). Code: [MIT](../../LICENSE). See `app/fonts/*OFL.txt` for font licenses and [RESEARCH.md](RESEARCH.md) for creative references.

[Support the project](https://lndev.mychariow.shop/prd_3cu1s0)
