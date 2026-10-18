# Tempo

An imaginary chess club, presented as a sculptural editorial journey. Ivory, graphite and vermilion pieces move through ten chapters: the board, six movement studies and a complete grandmaster game.

The three hero pieces travel into their own squares on the board. Each piece study combines an opaque, rigid sculpture with a movement field, diagram and short practical notes. The whole scene slides in and out together. Every piece demonstrates its own movement; the pawn advances twice and waits, while the other studies follow legal repeating routes. Ambient motion can be paused. The journey spans 21 viewport heights and has separate mobile framing.

The final section replays **Kasparov–Topalov, Wijk aan Zee, 20 January 1999 (1–0)** in full: 87 plies, including castling and captures. Auto playback runs only while the player is visible; pause, step in either direction, seek, replay or download the PGN. Reduced-motion visitors start with playback paused. This is a recorded game, not a chess engine or multiplayer service.

The local score was cross-checked with [ChessBox’s game record](https://www.chessbox.in/chessgame/kasparov-garry-topalov-veselin-30/) and the event details with [Chess.com’s anniversary report](https://www.chess.com/pt-BR/news/view/25-anos-atras-kasparov-topalov-1999). No third-party annotations are reproduced. `scripts/verify-game.py` regenerates legal move data and position fixtures with the optional development tool `python-chess`; no chess library runs in the browser.

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
