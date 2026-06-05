import { describe, expect, it } from "vitest";
import { buildConfig } from "./buildConfig";
import type { GeneratorParams } from "../../types/circle";

const baseParams: GeneratorParams = {
  seed: "Ultima Veneficus",
  size: 1024,
  margin: 32,
  tiers: 2,
  scsc: 1,
  tierScale: 1,
  tierSymmetryDelta: -1,
  borderSpace: 45,
  lineWidth: 7,
  borderWidth: 7,
  color: "#ffffff",
  symNum: 6,
  complexity: 0.7,
  symbols: "\u2721 \u2727 \u272a",
  words: "alpha beta gamma delta epsilon zeta",
  textDensity: 0.075,
  font: "Georgia",
  faceTextInward: false,
  symbolsFaceCenter: true,
  drawShadows: false,
  shadowColor: "#000000",
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 10,
  drawBackground: false,
  backgroundColor: "#ffffff",
};

describe("buildConfig", () => {
  it("is deterministic for the same seed", () => {
    const a = buildConfig(baseParams);
    const b = buildConfig(baseParams);
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
  });

  it("produces different output for different seeds", () => {
    const a = buildConfig(baseParams);
    const b = buildConfig({ ...baseParams, seed: "Different" });
    expect(JSON.stringify(a)).not.toEqual(JSON.stringify(b));
  });

  it("always creates a root ring with unique ids", () => {
    const configs = buildConfig(baseParams);
    expect(configs.length).toBeGreaterThan(0);
    expect(configs[0].parentId).toBeNull();
    const ids = configs.map((c) => c.id);
    expect(new Set(ids).size).toEqual(ids.length);
  });

  it("respects tier depth", () => {
    const configs = buildConfig({ ...baseParams, tiers: 3 });
    const maxTier = Math.max(...configs.map((c) => c.tier));
    expect(maxTier).toBeLessThanOrEqual(2);
  });
});
