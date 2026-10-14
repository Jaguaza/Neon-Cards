export const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export const round = (n: number): number => Math.round(n * 1000) / 1000;

/** Arranque y llegada suaves (cuadrática); `t` se recorta a [0, 1]. */
export function easeInOut(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}
