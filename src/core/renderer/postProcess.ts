import type { GeneratorParams } from "../../types/circle";

export function paintBackground(
  ctx: CanvasRenderingContext2D,
  params: GeneratorParams,
): void {
  ctx.clearRect(0, 0, params.size, params.size);
  if (params.drawBackground) {
    ctx.fillStyle = params.backgroundColor;
    ctx.fillRect(0, 0, params.size, params.size);
  }
}

export function applyShadow(
  ctx: CanvasRenderingContext2D,
  params: GeneratorParams,
): void {
  if (!params.drawShadows) return;
  ctx.shadowColor = params.shadowColor;
  ctx.shadowOffsetX = params.shadowOffsetX;
  ctx.shadowOffsetY = params.shadowOffsetY;
  ctx.shadowBlur = params.shadowBlur;
}
