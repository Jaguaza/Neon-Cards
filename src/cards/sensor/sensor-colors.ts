import { resolveGradientColors } from '../../shared';
import type { GradientColors } from '../../shared';
import { DEFAULT_SINGLE_COLOR, DEFAULT_THRESHOLD_COLORS, THEME_COLOR, UNAVAILABLE_COLOR } from './constants';
import type { NeonEffect, NeonSensorCardConfig, SensorLevel } from './types';

const solid = (color: string): GradientColors => ({ c1: color, c2: color, c3: color });

/** Efecto efectivo: cualquier valor desconocido cae al halo. */
export function resolveEffect(config: NeonSensorCardConfig | undefined): NeonEffect {
  const effect = config?.neon_effect;
  return effect === 'normal' || effect === 'single' ? effect : 'halo';
}

/**
 * Los 3 colores del GRÁFICO y del icono: los decide solo el efecto de
 * color, nunca los umbrales (el color del perímetro es otra cosa, ver
 * `resolveEdgeColor`).
 * - `unavailable`: neutro siempre.
 * - `halo` = paleta de 3 colores, `single` = el color elegido,
 *   `normal` = el color del tema.
 */
export function resolveCardColors(config: NeonSensorCardConfig | undefined, level: SensorLevel): GradientColors {
  if (level === 'unavailable') return solid(UNAVAILABLE_COLOR);
  const effect = resolveEffect(config);
  if (effect === 'single') return solid(config?.neon_color || DEFAULT_SINGLE_COLOR);
  if (effect === 'normal') return solid(THEME_COLOR);
  return resolveGradientColors(config);
}

/**
 * Color del PERÍMETRO de la tarjeta (borde y resplandor). Lo marcan solo
 * los umbrales, y solo si están activados: el color de su nivel
 * (`low` / `ok` / `high`), o neutro si no hay señal. Devuelve `null`
 * cuando nada lo marca — umbrales desactivados o lectura sin valorar —,
 * y entonces el perímetro se ve normal (borde del tema), sea cual sea
 * el efecto de color elegido.
 */
export function resolveEdgeColor(config: NeonSensorCardConfig | undefined, level: SensorLevel): string | null {
  if (!config?.thresholds_enabled) return null;
  if (level === 'unavailable') return UNAVAILABLE_COLOR;
  if (level === 'low' || level === 'ok' || level === 'high') {
    return config.threshold_colors?.[level] || DEFAULT_THRESHOLD_COLORS[level];
  }
  return null;
}
