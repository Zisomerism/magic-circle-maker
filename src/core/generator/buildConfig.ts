import type { CircleConfig, GeneratorParams } from "../../types/circle";
import { createRng, pick, randInt, shuffle, type Rng } from "../prng";
import { featureOn } from "./features";

function ringDefaults(): Omit<CircleConfig, "id" | "parentId" | "tier" | "radius"> {
  return {
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    rotationSpeed: 1,
    symNum: 6,
    outerRing: false,
    connectBorder: false,
    connectMidPoints: false,
    connectPoints: false,
    connectPointsSkip: 1,
    inscribePoints: false,
    linesToCenter: false,
    eraseCenter: false,
    symbolRing: false,
    symbolsAtPoints: false,
    drawTextRing: false,
    centerSymbol: false,
  };
}

interface BuildContext {
  rng: Rng;
  params: GeneratorParams;
  symbols: string[];
  words: string[];
  maxTier: number;
  configs: CircleConfig[];
  nextId: number;
}

function takeWords(ctx: BuildContext, count: number): string {
  if (ctx.words.length === 0) return "";
  return shuffle(ctx.rng, ctx.words).slice(0, count).join(" ");
}

function takeSymbols(ctx: BuildContext, count: number): string {
  if (ctx.symbols.length === 0) return "";
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(pick(ctx.rng, ctx.symbols));
  return out.join("");
}

function push(ctx: BuildContext, ring: Omit<CircleConfig, "id">): CircleConfig {
  const full: CircleConfig = { id: ctx.nextId++, ...ring };
  ctx.configs.push(full);
  return full;
}

/** Assign procedural geometry/text features to an inner ring. */
function decorateRing(
  ctx: BuildContext,
  ring: Omit<CircleConfig, "id">,
  emphasis: number,
): void {
  const { rng, params } = ctx;
  const c = params.complexity * emphasis;

  ring.connectBorder = featureOn(rng, c, 0.9);
  ring.connectPoints = featureOn(rng, c, 0.8);
  ring.connectMidPoints = featureOn(rng, c, 0.6);
  ring.inscribePoints = featureOn(rng, c, 0.7);
  ring.linesToCenter = featureOn(rng, c, 0.6);
  ring.symbolsAtPoints = featureOn(rng, c, 0.7);
  ring.eraseCenter = featureOn(rng, c, 0.3);

  if (ring.connectPoints) {
    ring.connectPointsSkip = randInt(rng, 1, Math.max(1, Math.floor(ring.symNum / 2) - 1));
  }
  if (ring.symbolsAtPoints) {
    ring.symbolText = takeSymbols(ctx, ring.symNum);
  }

  if (featureOn(rng, c, 0.7)) {
    ring.drawTextRing = true;
    ring.ringText = takeWords(ctx, randInt(ctx.rng, 3, 8));
  } else if (featureOn(rng, c, 0.6)) {
    ring.symbolRing = true;
    ring.symbolText = takeSymbols(ctx, randInt(ctx.rng, 8, 16));
  }
}

function buildSubCircles(
  ctx: BuildContext,
  parent: CircleConfig,
  tier: number,
): void {
  if (tier > ctx.maxTier) return;
  const { rng, params } = ctx;

  const points = Math.max(2, parent.symNum);
  const childRadius = (parent.radius * params.tierScale) / 2.6;
  const orbit = parent.radius * 0.62;
  const childSym = Math.max(0, parent.symNum + params.tierSymmetryDelta);

  for (let i = 0; i < points; i++) {
    if (rng() > params.scsc) continue;
    const angle = -Math.PI / 2 + (i / points) * Math.PI * 2;
    const child: Omit<CircleConfig, "id"> = {
      ...ringDefaults(),
      parentId: parent.id,
      tier,
      radius: childRadius,
      offsetX: Math.cos(angle) * orbit,
      offsetY: Math.sin(angle) * orbit,
      symNum: childSym,
      rotationSpeed: Math.max(2 * (ctx.maxTier - tier + 1), 1),
      outerRing: true,
    };
    decorateRing(ctx, child, 1.1);
    if (childSym >= 2 && featureOn(rng, params.complexity, 0.5)) {
      child.centerSymbol = true;
      child.centerSymbolText = takeSymbols(ctx, 1);
    }
    const created = push(ctx, child);
    buildSubCircles(ctx, created, tier + 1);
  }
}

export function buildConfig(params: GeneratorParams): CircleConfig[] {
  const rng = createRng(params.seed);
  const symbols = params.symbols.trim().split(/\s+/).filter(Boolean);
  const words = params.words.trim().split(/\s+/).filter(Boolean);
  const drawableRadius = params.size / 2 - params.margin;

  const ctx: BuildContext = {
    rng,
    params,
    symbols,
    words,
    maxTier: Math.max(0, params.tiers - 1),
    configs: [],
    nextId: 0,
  };

  // Root frame: outer border with a wrapped text ring.
  const root = push(ctx, {
    ...ringDefaults(),
    parentId: null,
    tier: 0,
    radius: drawableRadius,
    symNum: params.symNum,
    rotationSpeed: 1,
    outerRing: true,
    drawTextRing: true,
    ringText: takeWords(ctx, randInt(rng, 8, 16)),
    connectBorder: featureOn(rng, params.complexity, 0.6),
  });

  // Inner concentric feature rings.
  const innerRadius = drawableRadius - params.borderSpace;
  const innerCount = 1 + Math.floor(params.complexity * 4);
  let symNum = params.symNum;
  for (let i = 0; i < innerCount; i++) {
    const t = 1 - (i + 1) / (innerCount + 1);
    const radius = innerRadius * (0.35 + 0.6 * t);
    symNum = Math.max(2, symNum + (i === 0 ? 0 : randInt(rng, -1, 1)));
    const ring: Omit<CircleConfig, "id"> = {
      ...ringDefaults(),
      parentId: root.id,
      tier: 0,
      radius,
      symNum,
      rotationSpeed: 1 + i,
      outerRing: featureOn(rng, params.complexity, 1.2) || i === 0,
    };
    decorateRing(ctx, ring, 1);
    push(ctx, ring);
  }

  // Center symbol on the innermost area.
  if (symbols.length > 0 && featureOn(rng, params.complexity, 1.5)) {
    push(ctx, {
      ...ringDefaults(),
      parentId: root.id,
      tier: 0,
      radius: innerRadius * 0.18,
      symNum: 1,
      centerSymbol: true,
      centerSymbolText: takeSymbols(ctx, 1),
    });
  }

  // Satellite sub-circles around a mid ring.
  if (ctx.maxTier >= 1 && params.scsc > 0) {
    const host: Omit<CircleConfig, "id"> = {
      ...ringDefaults(),
      parentId: root.id,
      tier: 0,
      radius: innerRadius * 0.82,
      symNum: params.symNum,
      outerRing: false,
    };
    const hostRing = push(ctx, host);
    buildSubCircles(ctx, hostRing, 1);
  }

  return ctx.configs;
}
