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
 * Los 3 colores de la tarjeta para un nivel.
 * 1. `unavailable`: neutro siempre.
 * 2. Umbrales activados y nivel low/ok/high: el color de ese nivel
 *    (sólido) manda sobre el efecto.
 * 3. Si no, el del efecto: `halo` = paleta de 3 colores, `single` = el
 *    color elegido, `normal` = el color del tema.
 */
export function resolveCardColors(config: NeonSensorCardConfig | undefined, level: SensorLevel): GradientColors {
  if (level === 'unavailable') return solid(UNAVAILABLE_COLOR);
  if (config?.thresholds_enabled && (level === 'low' || level === 'ok' || level === 'high')) {
    return solid(config.threshold_colors?.[level] || DEFAULT_THRESHOLD_COLORS[level]);
  }
  const effect = resolveEffect(config);
  if (effect === 'single') return solid(config?.neon_color || DEFAULT_SINGLE_COLOR);
  if (effect === 'normal') return solid(THEME_COLOR);
  return resolveGradientColors(config);
}
