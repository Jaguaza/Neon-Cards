import { NEON_CARDS_VERSION } from '../../version';
import type { SensorSize, ThresholdLevel } from './types';

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

export const DEFAULT_SIZE: SensorSize = 'normal';

/**
 * Hueco FIJO de cada tamaño en el grid de HA (secciones: 12 columnas por
 * sección, filas de 56 px + 8 px de separación). No es «alto automático»:
 * con el alto según contenido, el que HA reserva no coincidía con el que
 * necesitaba el layout y el gráfico se salía de la tarjeta.
 * - `compact` (3×2): el más pequeño, sin gráfico (nombre, valor, unidad y
 *   etiqueta).
 * - `normal` (6×2): cabecera, valor y gráfico en la misma fila.
 * - `large` (12×2): el ancho máximo; valor y umbral a la izquierda y el
 *   gráfico a la derecha.
 */
export const SIZE_GRID: Record<SensorSize, { columns: number; rows: number }> = {
  compact: { columns: 3, rows: 2 },
  normal: { columns: 6, rows: 2 },
  large: { columns: 12, rows: 2 },
};

/** Decimales fijos del tamaño pequeño: siempre `xx.x` (no se configura). */
export const COMPACT_DECIMALS = 1;
