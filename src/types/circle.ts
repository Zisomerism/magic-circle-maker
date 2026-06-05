export interface CircleConfig {
  id: number;
  parentId: number | null;
  tier: number;
  /** Ring radius in image-space pixels. */
  radius: number;
  /** Offset from the parent center (image-space pixels). */
  offsetX: number;
  offsetY: number;
  /** Base rotation in radians, applied before animation. */
  rotation: number;
  /** Relative animation speed; larger spins faster during GIF export. */
  rotationSpeed: number;
  /** Number of equidistant points on the ring. */
  symNum: number;
  /** Optional per-ring color override; falls back to the global color. */
  color?: string;

  // Geometry feature flags
  outerRing: boolean;
  connectBorder: boolean;
  connectMidPoints: boolean;
  connectPoints: boolean;
  /** Skip count when chaining points (1 = adjacent, 2 = every other, ...). */
  connectPointsSkip: number;
  inscribePoints: boolean;
  linesToCenter: boolean;
  eraseCenter: boolean;

  // Text + symbol features
  symbolRing: boolean;
  symbolsAtPoints: boolean;
  drawTextRing: boolean;
  centerSymbol: boolean;
  ringText?: string;
  symbolText?: string;
  centerSymbolText?: string;

  hidden?: boolean;
}

export interface GeneratorParams {
  seed: string;
  size: number;
  margin: number;

  // Sub-circle structure
  tiers: number;
  /** Sub-circle spawn chance, 0..1. */
  scsc: number;
  tierScale: number;
  tierSymmetryDelta: number;

  // Core look
  borderSpace: number;
  lineWidth: number;
  borderWidth: number;
  color: string;
  symNum: number;
  /** 0..1. Higher complexity enables more features. */
  complexity: number;

  // Text + symbols
  symbols: string;
  words: string;
  textDensity: number;
  font: string;
  faceTextInward: boolean;
  symbolsFaceCenter: boolean;

  // Post-processing
  drawShadows: boolean;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  drawBackground: boolean;
  backgroundColor: string;
}

export interface GifParams {
  duration: number;
  fps: number;
}

/** Extra options passed to the renderer for a single frame. */
export interface RenderOptions {
  /** Animation phase in 0..1 used to advance ring rotation for GIF frames. */
  phase?: number;
}
