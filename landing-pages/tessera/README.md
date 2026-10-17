# Tessera

An imaginary architectural exhibition: eight connected 3D studies, explored with native scrolling. Built with Next.js, Three.js and fully customized shadcn/ui (Base UI).

```bash
pnpm install
pnpm dev
```

`pnpm test` checks chapter continuity and the sphere’s flight cycle. `pnpm typecheck` checks TypeScript. `pnpm build` creates the production build; `pnpm start` serves it.

## The experience

A threshold, passage, ascent, courtyard, light room, suspended gallery, blue hour and souvenir. Scroll changes the camera and light across roughly thirteen viewport-heights. Complete maquettes slide horizontally between chapters, keeping opaque geometry and independent contact shadows over a gradually changing backdrop. The atlas and chapter controls also navigate the story. The last chapter offers three palettes and an original SVG postcard download.

The loader waits for local fonts and the first compiled WebGL frame. On unsupported WebGL or context loss, a CSS illustration preserves the reading experience. Ambient motion can be paused; native scrolling remains active. Reduced-motion preferences disable ambient movement and smooth navigation. Mobile uses a separate camera framing, capped pixel ratio and smaller shadow maps. The gold sphere gently takes flight and returns to its pedestal; pool ripples, suspended landings and lanterns animate autonomously. The canvas never captures clicks, drags or touch gestures. Pausing freezes these details; reduced motion replaces lateral travel with a dissolve.

## Art direction & research

- [Zero University](https://why.zero.university/) — spatial storytelling and minimal navigation within an immersive world.
- [Awwwards Amsterdam, by NK Studio](https://www.nk.studio/work/awwwards-conf-amsterdam/) — architecture as a navigable narrative rather than decoration.
- [Three.js Journey](https://threejs-journey.com/) — playful miniature worlds and expressive animated details.
- [Anime.js](https://animejs.com/) — deliberate staging, readable transitions and motion that explains structure.
- [Aten7, by Immersive Garden](https://immersive-g.com/projects/aten7/) — a continuous journey with distinct atmospheres.

These informed the pacing and spatial approach. The buildings, text, materials, postcard and layout are original; no reference site's code, models or visual assets are reused. Tessera is not a real museum or architectural practice.

Local fonts: Syne and Manrope, SIL Open Font License; licenses are in `app/fonts`. Code and original artwork follow the collection's MIT license.

Developed by [LN](https://lndev.me) · [Source](https://github.com/ln-dev7/landing-pages/tree/master/landing-pages/tessera) · [Support](https://lndev.mychariow.shop/prd_3cu1s0).
