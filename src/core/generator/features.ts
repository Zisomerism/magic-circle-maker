import type { Rng } from "../prng";

/**
 * Decide whether a feature is enabled given the global complexity.
 *
 * `complexity` is 0..1. `weight` biases individual features so that some
 * (e.g. the outer ring) appear far more often than rare flourishes.
 */
export function featureOn(rng: Rng, complexity: number, weight = 1): boolean {
  return rng() < complexity * weight;
}
