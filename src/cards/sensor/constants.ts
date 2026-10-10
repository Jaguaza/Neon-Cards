import { NEON_CARDS_VERSION } from '../../version';
import type { ThresholdLevel } from './types';

export const CARD_AUTHOR = 'Jaguaza';
export const CARD_VERSION = NEON_CARDS_VERSION;

/** Icono cuando la entidad no existe o no es un sensor/binary_sensor. */
export const ERROR_ICON = 'mdi:close';

export const DEFAULT_GRAPH_HOURS = 24;
/** Tramos en que se reparte el histórico: una arista del trazo por tramo. */
export const GRAPH_BUCKETS = 48;
/** Cada cuánto se relee el histórico (ms). Una llamada WS por tarjeta. */
export const HISTORY_REFRESH_MS = 120_000;

/** Color del efecto `single` si no se elige otro. */
export const DEFAULT_SINGLE_COLOR = '#1ecdf2';

/** Colores de partida de cada nivel de los umbrales. */
export const DEFAULT_THRESHOLD_COLORS: Record<ThresholdLevel, string> = {
  low: '#4facfe',
  ok: '#39e07a',
  high: '#ff3d5a',
};

/** Sin señal: neutro en todos los efectos. */
export const UNAVAILABLE_COLOR = '#e6e9f2';

/** Color del tema de HA que usa el efecto `normal`. */
export const THEME_COLOR = 'var(--primary-color)';
