import { TAU } from "../geometry";

export interface TextStyle {
  font: string;
  color: string;
  faceTextInward: boolean;
  symbolsFaceCenter: boolean;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Draw text wrapped around a ring of the given radius, centered on the top of
 * the circle. The string is repeated (space-separated) until it fills the
 * circumference. Assumes the context is already translated to the ring center.
 */
export function drawArcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  radius: number,
  density: number,
  style: TextStyle,
): void {
  if (!text || radius <= 0) return;

  const fontSize = clamp(radius * density, 7, 240);
  ctx.save();
  ctx.font = `${fontSize}px ${style.font}`;
  ctx.fillStyle = style.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const circumference = TAU * radius;
  const base = `${text} `;
  let filled = "";
  let width = 0;
  // Repeat until we cover the circle (cap iterations to stay safe).
  for (let guard = 0; guard < 2000; guard++) {
    const w = ctx.measureText(base).width;
    if (w <= 0) break;
    if (width + w > circumference) break;
    filled += base;
    width += w;
  }
  if (!filled) filled = text;

  const chars = [...filled];
  const totalWidth = ctx.measureText(filled).width || 1;
  // Scale char advance so the text exactly meets at the seam.
  const angleScale = (TAU * Math.min(1, totalWidth / circumference)) / totalWidth;

  let angle = -Math.PI / 2 - (totalWidth * angleScale) / 2;
  for (const ch of chars) {
    const w = ctx.measureText(ch).width;
    const charAngle = w * angleScale;
    const mid = angle + charAngle / 2;
    const x = Math.cos(mid) * radius;
    const y = Math.sin(mid) * radius;
    ctx.save();
    ctx.translate(x, y);
    if (style.faceTextInward) {
      ctx.rotate(mid - Math.PI / 2);
    } else {
      ctx.rotate(mid + Math.PI / 2);
    }
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    angle += charAngle;
  }
  ctx.restore();
}

/** Evenly spaced glyphs around a ring (does not depend on glyph widths). */
export function drawSymbolRing(
  ctx: CanvasRenderingContext2D,
  symbols: string,
  radius: number,
  fontSize: number,
  style: TextStyle,
): void {
  const glyphs = [...symbols].filter((g) => g.trim().length > 0);
  if (glyphs.length === 0 || radius <= 0) return;

  ctx.save();
  ctx.font = `${fontSize}px ${style.font}`;
  ctx.fillStyle = style.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < glyphs.length; i++) {
    const a = -Math.PI / 2 + (i / glyphs.length) * TAU;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    ctx.save();
    ctx.translate(x, y);
    if (style.symbolsFaceCenter) ctx.rotate(a + Math.PI / 2);
    ctx.fillText(glyphs[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

/** A single centered glyph. */
export function drawCenterSymbol(
  ctx: CanvasRenderingContext2D,
  symbol: string,
  fontSize: number,
  style: TextStyle,
): void {
  if (!symbol) return;
  ctx.save();
  ctx.font = `${fontSize}px ${style.font}`;
  ctx.fillStyle = style.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(symbol, 0, 0);
  ctx.restore();
}
