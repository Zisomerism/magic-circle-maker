import type { CircleConfig, GeneratorParams } from "../types/circle";
import { ringPoints, TAU } from "../core/geometry";
import { computeCenters } from "../core/renderer/drawConfig";
import { downloadBlob } from "./download";

// Shared measuring context so SVG arc text matches the canvas layout.
let measureCtx: CanvasRenderingContext2D | null = null;
function getMeasureCtx(): CanvasRenderingContext2D {
  if (!measureCtx) {
    const c = document.createElement("canvas");
    measureCtx = c.getContext("2d");
    if (!measureCtx) throw new Error("Unable to acquire measuring context");
  }
  return measureCtx;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
const deg = (rad: number) => (rad * 180) / Math.PI;
const f = (n: number) => Number(n.toFixed(2));

interface SvgStyle {
  font: string;
  color: string;
  faceTextInward: boolean;
  symbolsFaceCenter: boolean;
}

function circle(radius: number, stroke: number, color: string): string {
  return `<circle cx="0" cy="0" r="${f(radius)}" fill="none" stroke="${color}" stroke-width="${f(stroke)}"/>`;
}

function polygonPath(
  points: { x: number; y: number }[],
  skip: number,
  color: string,
  stroke: number,
): string {
  const n = points.length;
  if (n < 2) return "";
  const visited = new Set<number>();
  const segments: string[] = [];
  for (let start = 0; start < n; start++) {
    if (visited.has(start)) continue;
    let i = start;
    let d = `M ${f(points[i].x)} ${f(points[i].y)}`;
    do {
      visited.add(i);
      i = (i + skip) % n;
      d += ` L ${f(points[i].x)} ${f(points[i].y)}`;
    } while (i !== start);
    segments.push(d);
  }
  return `<path d="${segments.join(" ")}" fill="none" stroke="${color}" stroke-width="${f(stroke)}" stroke-linejoin="round"/>`;
}

function arcTextSvg(
  text: string,
  radius: number,
  density: number,
  style: SvgStyle,
): string {
  if (!text || radius <= 0) return "";
  const fontSize = clamp(radius * density, 7, 240);
  const ctx = getMeasureCtx();
  ctx.font = `${fontSize}px ${style.font}`;

  const circumference = TAU * radius;
  const base = `${text} `;
  let filled = "";
  let width = 0;
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
  const angleScale = (TAU * Math.min(1, totalWidth / circumference)) / totalWidth;

  let angle = -Math.PI / 2 - (totalWidth * angleScale) / 2;
  const parts: string[] = [];
  for (const ch of chars) {
    const w = ctx.measureText(ch).width;
    const charAngle = w * angleScale;
    const mid = angle + charAngle / 2;
    const x = Math.cos(mid) * radius;
    const y = Math.sin(mid) * radius;
    const rot = style.faceTextInward ? mid - Math.PI / 2 : mid + Math.PI / 2;
    parts.push(
      `<text x="0" y="0" transform="translate(${f(x)} ${f(y)}) rotate(${f(deg(rot))})" font-family="${style.font}" font-size="${f(fontSize)}" fill="${style.color}" text-anchor="middle" dominant-baseline="central">${esc(ch)}</text>`,
    );
    angle += charAngle;
  }
  return parts.join("");
}

function symbolRingSvg(
  symbols: string,
  radius: number,
  fontSize: number,
  style: SvgStyle,
): string {
  const glyphs = [...symbols].filter((g) => g.trim());
  if (glyphs.length === 0 || radius <= 0) return "";
  const parts: string[] = [];
  for (let i = 0; i < glyphs.length; i++) {
    const a = -Math.PI / 2 + (i / glyphs.length) * TAU;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    const rot = style.symbolsFaceCenter ? a + Math.PI / 2 : 0;
    parts.push(
      `<text x="0" y="0" transform="translate(${f(x)} ${f(y)}) rotate(${f(deg(rot))})" font-family="${style.font}" font-size="${f(fontSize)}" fill="${style.color}" text-anchor="middle" dominant-baseline="central">${esc(glyphs[i])}</text>`,
    );
  }
  return parts.join("");
}

function ringSvg(
  ring: CircleConfig,
  params: GeneratorParams,
  isRoot: boolean,
): string {
  const color = ring.color ?? params.color;
  const stroke = isRoot ? params.borderWidth : params.lineWidth;
  const style: SvgStyle = {
    font: params.font,
    color,
    faceTextInward: params.faceTextInward,
    symbolsFaceCenter: params.symbolsFaceCenter,
  };
  const out: string[] = [];
  const r = ring.radius;

  if (ring.outerRing) out.push(circle(r, stroke, color));

  if (ring.drawTextRing && ring.ringText) {
    const innerR = Math.max(2, r - params.borderSpace);
    if (ring.outerRing) out.push(circle(innerR, stroke, color));
    out.push(arcTextSvg(ring.ringText, (r + innerR) / 2, params.textDensity, style));
  }

  const geomRadius = ring.drawTextRing
    ? Math.max(2, r - params.borderSpace)
    : r;
  const points = ringPoints(ring.symNum, geomRadius);
  const hasGeom =
    ring.connectBorder ||
    ring.connectPoints ||
    ring.connectMidPoints ||
    ring.linesToCenter ||
    ring.inscribePoints;

  if (ring.symNum >= 2 && !ring.outerRing && hasGeom) {
    out.push(circle(geomRadius, stroke, color));
  }
  if (ring.connectBorder && points.length >= 2) {
    out.push(polygonPath(points, 1, color, stroke));
  }
  if (ring.connectPoints && points.length >= 2) {
    out.push(polygonPath(points, Math.max(1, ring.connectPointsSkip), color, stroke));
  }
  if (ring.connectMidPoints && points.length >= 2) {
    const mids = ringPoints(ring.symNum, geomRadius, Math.PI / ring.symNum);
    out.push(polygonPath(mids, 1, color, stroke));
  }
  if (ring.linesToCenter) {
    for (const p of points) {
      out.push(
        `<line x1="0" y1="0" x2="${f(p.x)}" y2="${f(p.y)}" stroke="${color}" stroke-width="${f(stroke)}"/>`,
      );
    }
  }
  if (ring.inscribePoints) {
    const ir = geomRadius * 0.12;
    for (const p of points) {
      out.push(
        `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(ir)}" fill="none" stroke="${color}" stroke-width="${f(stroke)}"/>`,
      );
    }
  }
  if (ring.symbolRing && ring.symbolText) {
    out.push(
      symbolRingSvg(ring.symbolText, geomRadius * 0.86, Math.max(8, geomRadius * 0.16), style),
    );
  }
  if (ring.symbolsAtPoints && ring.symbolText) {
    const glyphs = [...ring.symbolText].filter((g) => g.trim());
    const fontSize = Math.max(10, ring.radius * 0.12);
    points.forEach((p, idx) => {
      if (glyphs.length === 0) return;
      const g = glyphs[idx % glyphs.length];
      const a = Math.atan2(p.y, p.x);
      const rot = style.symbolsFaceCenter ? a + Math.PI / 2 : 0;
      out.push(
        `<text x="0" y="0" transform="translate(${f(p.x)} ${f(p.y)}) rotate(${f(deg(rot))})" font-family="${style.font}" font-size="${f(fontSize)}" fill="${color}" text-anchor="middle" dominant-baseline="central">${esc(g)}</text>`,
      );
    });
  }
  if (ring.centerSymbol && ring.centerSymbolText) {
    const fontSize = Math.max(12, r * 0.5);
    out.push(
      `<text x="0" y="0" font-family="${style.font}" font-size="${f(fontSize)}" fill="${color}" text-anchor="middle" dominant-baseline="central">${esc(ring.centerSymbolText)}</text>`,
    );
  }

  return out.join("");
}

export function buildSvg(
  configs: CircleConfig[],
  params: GeneratorParams,
): string {
  const centers = computeCenters(configs, params.size);
  const groups: string[] = [];

  if (params.drawBackground) {
    groups.push(
      `<rect x="0" y="0" width="${params.size}" height="${params.size}" fill="${params.backgroundColor}"/>`,
    );
  }

  for (const ring of configs) {
    if (ring.hidden) continue;
    const center = centers.get(ring.id);
    if (!center) continue;
    const rot = deg(ring.rotation);
    const body = ringSvg(ring, params, ring.parentId === null);
    if (!body) continue;
    groups.push(
      `<g transform="translate(${f(center.x)} ${f(center.y)}) rotate(${f(rot)})">${body}</g>`,
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${params.size}" height="${params.size}" viewBox="0 0 ${params.size} ${params.size}">
${groups.join("\n")}
</svg>`;
}

export function exportSvg(
  configs: CircleConfig[],
  params: GeneratorParams,
  filename = "magic-circle.svg",
): void {
  const svg = buildSvg(configs, params);
  downloadBlob(new Blob([svg], { type: "image/svg+xml" }), filename);
}
