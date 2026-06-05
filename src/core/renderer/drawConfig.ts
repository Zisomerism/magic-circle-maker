import type {
  CircleConfig,
  GeneratorParams,
  RenderOptions,
} from "../../types/circle";
import { TAU } from "../geometry";
import { drawRing } from "./drawRing";
import { applyShadow, paintBackground } from "./postProcess";

export interface AbsoluteCenter {
  x: number;
  y: number;
}

/**
 * Compute each ring's absolute center. Children are positioned relative to
 * their parent's center (offsets are not rotated, so satellites hold position
 * while individual rings spin in place).
 */
export function computeCenters(
  configs: CircleConfig[],
  size: number,
): Map<number, AbsoluteCenter> {
  const centers = new Map<number, AbsoluteCenter>();
  const byId = new Map<number, CircleConfig>();
  for (const c of configs) byId.set(c.id, c);

  const resolve = (c: CircleConfig): AbsoluteCenter => {
    const cached = centers.get(c.id);
    if (cached) return cached;
    let center: AbsoluteCenter;
    if (c.parentId === null) {
      center = { x: size / 2, y: size / 2 };
    } else {
      const parent = byId.get(c.parentId);
      const parentCenter = parent
        ? resolve(parent)
        : { x: size / 2, y: size / 2 };
      center = { x: parentCenter.x + c.offsetX, y: parentCenter.y + c.offsetY };
    }
    centers.set(c.id, center);
    return center;
  };

  for (const c of configs) resolve(c);
  return centers;
}

function effectiveRotation(ring: CircleConfig, phase: number): number {
  const direction = ring.tier % 2 === 0 ? 1 : -1;
  return ring.rotation + phase * TAU * ring.rotationSpeed * direction;
}

export function drawConfig(
  ctx: CanvasRenderingContext2D,
  configs: CircleConfig[],
  params: GeneratorParams,
  options: RenderOptions = {},
): void {
  const phase = options.phase ?? 0;
  paintBackground(ctx, params);
  ctx.save();
  applyShadow(ctx, params);

  const centers = computeCenters(configs, params.size);

  for (const ring of configs) {
    if (ring.hidden) continue;
    const center = centers.get(ring.id);
    if (!center) continue;
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(effectiveRotation(ring, phase));
    drawRing(ctx, ring, params, ring.parentId === null);
    ctx.restore();
  }

  ctx.restore();
}
