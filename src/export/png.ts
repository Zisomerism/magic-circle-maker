import type { CircleConfig, GeneratorParams } from "../types/circle";
import { drawConfig } from "../core/renderer/drawConfig";
import { downloadBlob, renderToCanvas } from "./download";

export async function exportPng(
  configs: CircleConfig[],
  params: GeneratorParams,
  filename = "magic-circle.png",
): Promise<void> {
  const { canvas, ctx } = renderToCanvas(params.size);
  drawConfig(ctx, configs, params);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (blob) downloadBlob(blob, filename);
}
