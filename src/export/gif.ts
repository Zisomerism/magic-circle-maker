import { applyPalette, GIFEncoder, quantize, type Palette } from "gifenc";
import type { CircleConfig, GeneratorParams, GifParams } from "../types/circle";
import { drawConfig } from "../core/renderer/drawConfig";
import { downloadBlob, renderToCanvas } from "./download";

export type GifProgress = (fraction: number) => void;

function findTransparentIndex(palette: Palette): number {
  for (let i = 0; i < palette.length; i++) {
    const c = palette[i];
    if (c.length >= 4 && c[3] === 0) return i;
  }
  return 0;
}

/**
 * Render a seamless rotation loop to an animated GIF. Frames advance the
 * animation phase from 0 to 1; integer ring rotation speeds keep the loop
 * seamless. Yields to the event loop between frames so the UI can update.
 */
export async function encodeGif(
  configs: CircleConfig[],
  params: GeneratorParams,
  gifParams: GifParams,
  onProgress?: GifProgress,
): Promise<Blob> {
  const size = params.size;
  const { canvas, ctx } = renderToCanvas(size);
  void canvas;

  const totalFrames = Math.max(
    1,
    Math.round(gifParams.duration * gifParams.fps),
  );
  const delay = Math.round(1000 / gifParams.fps);
  const transparent = !params.drawBackground;
  const format = transparent ? "rgba4444" : "rgb565";

  const enc = GIFEncoder();
  let palette: Palette | null = null;
  let transparentIndex = 0;

  for (let i = 0; i < totalFrames; i++) {
    const phase = i / totalFrames;
    drawConfig(ctx, configs, params, { phase });
    const { data } = ctx.getImageData(0, 0, size, size);

    if (!palette) {
      palette = quantize(data, 256, { format, oneBitAlpha: transparent });
      if (transparent) transparentIndex = findTransparentIndex(palette);
    }

    const index = applyPalette(data, palette, format);
    enc.writeFrame(index, size, size, {
      palette: i === 0 ? palette : undefined,
      delay,
      repeat: 0,
      transparent,
      transparentIndex,
      dispose: transparent ? 2 : -1,
    });

    onProgress?.((i + 1) / totalFrames);
    // Yield so the progress modal can repaint.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  enc.finish();
  const bytes = enc.bytes();
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  );
  return new Blob([buffer], { type: "image/gif" });
}

export async function exportGif(
  configs: CircleConfig[],
  params: GeneratorParams,
  gifParams: GifParams,
  onProgress?: GifProgress,
  filename = "magic-circle.gif",
): Promise<Blob> {
  const blob = await encodeGif(configs, params, gifParams, onProgress);
  downloadBlob(blob, filename);
  return blob;
}
