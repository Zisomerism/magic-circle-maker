import { create } from "zustand";
import type { CircleConfig, GeneratorParams, GifParams } from "../types/circle";
import { buildConfig } from "../core/generator/buildConfig";
import { getLibrary, DEFAULT_WORDS } from "../data/symbolLibraries";
import { createRng, pick, randInt, randRange } from "../core/prng";

const LATIN_SEED_WORDS = [
  "Ultima",
  "Veneficus",
  "Arcanum",
  "Sigillum",
  "Aether",
  "Umbra",
  "Lumen",
  "Vortex",
  "Nyx",
  "Sol",
  "Luna",
  "Ignis",
  "Aqua",
  "Terra",
  "Spiritus",
  "Mortis",
  "Vita",
  "Stella",
];

export const DEFAULT_PARAMS: GeneratorParams = {
  seed: "Ultima Veneficus",
  size: 1024,
  margin: 48,
  tiers: 2,
  scsc: 0.85,
  tierScale: 1,
  tierSymmetryDelta: -1,
  borderSpace: 60,
  lineWidth: 5,
  borderWidth: 7,
  color: "#ffffff",
  symNum: 6,
  complexity: 0.65,
  symbols: getLibrary("alchemy").symbols,
  words: DEFAULT_WORDS,
  textDensity: 0.06,
  font: "Georgia",
  faceTextInward: false,
  symbolsFaceCenter: true,
  drawShadows: false,
  shadowColor: "#000000",
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 12,
  drawBackground: false,
  backgroundColor: "#10121c",
};

const DEFAULT_GIF: GifParams = { duration: 5, fps: 15 };

interface CircleStore {
  params: GeneratorParams;
  gif: GifParams;
  configs: CircleConfig[];
  symbolLibraryId: string;

  setParam: <K extends keyof GeneratorParams>(
    key: K,
    value: GeneratorParams[K],
  ) => void;
  setGif: <K extends keyof GifParams>(key: K, value: GifParams[K]) => void;
  setSymbolLibrary: (id: string) => void;
  regenerate: () => void;
  newSeed: () => void;
  randomize: () => void;
}

function makeSeed(): string {
  const rng = createRng(String(Date.now() + Math.random()));
  const count = randInt(rng, 2, 3);
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(pick(rng, LATIN_SEED_WORDS));
  return out.join(" ");
}

export const useCircleStore = create<CircleStore>((set, get) => ({
  params: DEFAULT_PARAMS,
  gif: DEFAULT_GIF,
  configs: buildConfig(DEFAULT_PARAMS),
  symbolLibraryId: "alchemy",

  setParam: (key, value) => {
    const params = { ...get().params, [key]: value };
    set({ params, configs: buildConfig(params) });
  },

  setGif: (key, value) => {
    set({ gif: { ...get().gif, [key]: value } });
  },

  setSymbolLibrary: (id) => {
    const params = { ...get().params, symbols: getLibrary(id).symbols };
    set({ symbolLibraryId: id, params, configs: buildConfig(params) });
  },

  regenerate: () => {
    set({ configs: buildConfig(get().params) });
  },

  newSeed: () => {
    const params = { ...get().params, seed: makeSeed() };
    set({ params, configs: buildConfig(params) });
  },

  randomize: () => {
    const rng = createRng(String(Date.now() + Math.random()));
    const params: GeneratorParams = {
      ...get().params,
      seed: makeSeed(),
      symNum: randInt(rng, 3, 12),
      tiers: randInt(rng, 1, 3),
      complexity: randRange(rng, 0.35, 0.9),
      borderSpace: randInt(rng, 30, 90),
      scsc: randRange(rng, 0.4, 1),
      tierSymmetryDelta: randInt(rng, -2, 1),
    };
    set({ params, configs: buildConfig(params) });
  },
}));
