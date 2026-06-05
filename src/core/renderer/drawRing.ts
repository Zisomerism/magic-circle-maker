import type { CircleConfig, GeneratorParams } from "../../types/circle";
import { ringPoints, TAU } from "../geometry";
import {
  drawArcText,
  drawCenterSymbol,
  drawSymbolRing,
  type TextStyle,
} from "./drawText";

/**
 * Draw one ring's geometry and text. The context must already be translated to
 * the ring center and rotated by the ring's effective rotation.
 */
export function drawRing(
  ctx: CanvasRenderingContext2D,
  ring: CircleConfig,
  params: GeneratorParams,
  isRoot: boolean,
): void {
  const color = ring.color ?? params.color;
  const lineWidth = isRoot ? params.borderWidth : params.lineWidth;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const r = ring.radius;
  const style: TextStyle = {
    font: params.font,
    color,
    faceTextInward: params.faceTextInward,
    symbolsFaceCenter: params.symbolsFaceCenter,
  };

  // Outer circle (and inner border circle when a text ring is present).
  if (ring.outerRing) {
    strokeCircle(ctx, r);
  }

  let textRingRadius = r;
  if (ring.drawTextRing && ring.ringText) {
    const innerR = Math.max(2, r - params.borderSpace);
    if (ring.outerRing) strokeCircle(ctx, innerR);
    textRingRadius = (r + innerR) / 2;
    drawArcText(ctx, ring.ringText, textRingRadius, params.textDensity, style);
  }

  const geomRadius = ring.drawTextRing
    ? Math.max(2, r - params.borderSpace)
    : r;

  const points = ringPoints(ring.symNum, geomRadius);

  if (ring.symNum >= 2 && !ring.outerRing && hasGeometry(ring)) {
    // Faint guide circle so connected geometry reads as a ring.
    strokeCircle(ctx, geomRadius);
  }

  if (ring.connectBorder && points.length >= 2) {
    polygon(ctx, points, 1);
  }

  if (ring.connectPoints && points.length >= 2) {
    polygon(ctx, points, Math.max(1, ring.connectPointsSkip));
  }

  if (ring.connectMidPoints && points.length >= 2) {
    const mids = ringPoints(ring.symNum, geomRadius, Math.PI / ring.symNum);
    polygon(ctx, mids, 1);
  }

  if (ring.linesToCenter) {
    for (const p of points) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }

  if (ring.inscribePoints) {
    const ir = geomRadius * 0.12;
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, ir, 0, TAU);
      ctx.stroke();
    }
  }

  if (ring.symbolRing && ring.symbolText) {
    const fontSize = Math.max(8, geomRadius * 0.16);
    drawSymbolRing(ctx, ring.symbolText, geomRadius * 0.86, fontSize, style);
  }

  if (ring.symbolsAtPoints && ring.symbolText) {
    drawGlyphsAtPoints(ctx, ring, points, style);
  }

  if (ring.centerSymbol && ring.centerSymbolText) {
    drawCenterSymbol(ctx, ring.centerSymbolText, Math.max(12, r * 0.5), style);
  }
}

function hasGeometry(ring: CircleConfig): boolean {
  return (
    ring.connectBorder ||
    ring.connectPoints ||
    ring.connectMidPoints ||
    ring.linesToCenter ||
    ring.inscribePoints
  );
}

function strokeCircle(ctx: CanvasRenderingContext2D, radius: number): void {
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.stroke();
}

function polygon(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  skip: number,
): void {
  const n = points.length;
  if (n < 2) return;
  ctx.beginPath();
  // Walk the star/polygon; when gcd(n, skip) > 1 this draws multiple loops.
  const visited = new Set<number>();
  for (let start = 0; start < n; start++) {
    if (visited.has(start)) continue;
    let i = start;
    ctx.moveTo(points[i].x, points[i].y);
    do {
      visited.add(i);
      i = (i + skip) % n;
      ctx.lineTo(points[i].x, points[i].y);
    } while (i !== start);
  }
  ctx.stroke();
}

function drawGlyphsAtPoints(
  ctx: CanvasRenderingContext2D,
  ring: CircleConfig,
  points: { x: number; y: number }[],
  style: TextStyle,
): void {
  const glyphs = [...(ring.symbolText ?? "")].filter((g) => g.trim());
  if (glyphs.length === 0) return;
  const fontSize = Math.max(10, ring.radius * 0.12);
  ctx.save();
  ctx.font = `${fontSize}px ${style.font}`;
  ctx.fillStyle = style.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  points.forEach((p, idx) => {
    const g = glyphs[idx % glyphs.length];
    const a = Math.atan2(p.y, p.x);
    ctx.save();
    ctx.translate(p.x, p.y);
    if (style.symbolsFaceCenter) ctx.rotate(a + Math.PI / 2);
    ctx.fillText(g, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}
