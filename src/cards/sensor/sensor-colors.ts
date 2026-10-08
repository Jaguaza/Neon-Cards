import { resolveGradientColors } from '../../shared';
import type { GradientColors } from '../../shared';
import { DEFAULT_STATE_COLORS } from './constants';
import type { NeonSensorCardConfig, SensorLevel } from './types';

const solid = (color: string): GradientColors => ({ c1: color, c2: color, c3: color });

/**
 * Los 3 colores de la tarjeta para un nivel. `unavailable` es neutro en
 * todos los modos (es "sin señal", no una variante de color) salvo que
 * el usuario lo defina en `state_colors` con `color_mode: custom_state`.
 */
export function resolveCardColors(config: NeonSensorCardConfig | undefined, level: SensorLevel): GradientColors {
  const mode = config?.color_mode ?? 'single';
  if (mode === 'custom_state') return solid(config?.state_colors?.[level] || DEFAULT_STATE_COLORS[level]);
  if (level === 'unavailable' || mode === 'state') return solid(DEFAULT_STATE_COLORS[level]);
  return resolveGradientColors(config);
}
