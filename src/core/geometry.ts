export interface Point {
  x: number;
  y: number;
}

/** Point on a circle of the given radius at angle (radians), origin at (0,0). */
export function polar(radius: number, angle: number): Point {
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

/**
 * Evenly spaced points around a ring.
 * `offsetAngle` rotates the whole set; the first point starts at -PI/2 (top).
 */
export function ringPoints(
  count: number,
  radius: number,
  offsetAngle = 0,
): Point[] {
  const points: Point[] = [];
  if (count <= 0) return points;
  const start = -Math.PI / 2 + offsetAngle;
  for (let i = 0; i < count; i++) {
    const angle = start + (i / count) * Math.PI * 2;
    points.push(polar(radius, angle));
  }
  return points;
}

export const TAU = Math.PI * 2;
