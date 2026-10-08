import { NEON_CARDS_VERSION } from '../../version';
import type { SensorLevel } from './types';

export const CARD_AUTHOR = 'Jaguaza';
export const CARD_VERSION = NEON_CARDS_VERSION;

/** Icono cuando la entidad no existe o no es un sensor/binary_sensor. */
export const ERROR_ICON = 'mdi:close';

export const DEFAULT_GRAPH_HOURS = 24;
/** Tramos en que se reparte el histórico: una arista del trazo por tramo. */
export const GRAPH_BUCKETS = 48;
/** Cada cuánto se relee el histórico (ms). Una llamada WS por tarjeta. */
export const HISTORY_REFRESH_MS = 120_000;

/** Colores automáticos por estado (modo `state`) y valores de partida
    del modo `custom_state`. `unavailable` es siempre neutro. */
export const DEFAULT_STATE_COLORS: Record<SensorLevel, string> = {
  normal: '#1ecdf2',
  warning: '#ffb347',
  critical: '#ff3d5a',
  unavailable: '#e6e9f2',
};
