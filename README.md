# Magic Circle Maker

A browser app for procedurally generating and animating magic circles. Inspired by the feature set of [Magic Circle Generator](https://game-dev-goose.itch.io/magic-circle-generator), reimplemented from scratch.

## Features

- Seed-driven procedural generation with nested sub-circles
- Geometry: symmetry points, polygon/star connections, inscribed shapes, radial lines
- Curved text rings, symbol rings, symbols at points, and center glyphs
- Symbol libraries (Alchemy, Astrology, Hebrew, Runic, Greek, Misc) plus custom symbols and vocabulary
- Live animated preview with zoom and pan
- Post-processing: background fill and drop shadows
- Export to PNG, vector SVG, and seamless rotation GIF

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL.

## Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - type-check and produce a production build in `dist/`
- `npm run preview` - preview the production build
- `npm test` - run unit tests (Vitest)

## Architecture

```
src/
  core/        procedural generator, seeded PRNG, and Canvas renderer
  export/      PNG / SVG / GIF exporters
  components/  React UI (settings panel, preview, export bar)
  store/       Zustand store (single source of truth for params)
  data/        symbol libraries and defaults
  types/       shared TypeScript types
```

Generation produces a flat `CircleConfig[]` (rings linked by `parentId`). The
renderer and all exporters consume that same array, so the preview, PNG, SVG,
and GIF stay in sync.
