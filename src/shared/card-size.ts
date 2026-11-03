/**
 * Tamaños de las tarjetas con tres variantes (Lock y Alarm): el tipo, la
 * lista, el predeterminado, cómo se resuelve un valor de la config y las
 * columnas del grid de Home Assistant con las que empieza cada uno.
 */

/**
 * `large` es el diseño de siempre (nombre con subtítulo, estado y tres
 * puntos) y es el predeterminado, para que las tarjetas ya creadas no
 * cambien. `medium` es la mediana: sin subtítulo, con el estado bajo el
 * nombre. `compact` es la compacta: solo icono, nombre y estado.
 */
export type CardSize = 'compact' | 'medium' | 'large';

export const CARD_SIZES: readonly CardSize[] = ['compact', 'medium', 'large'];

export const DEFAULT_CARD_SIZE: CardSize = 'large';

/** Un valor desconocido en la config cuenta como el predeterminado. */
export function resolveCardSize(config: { size?: CardSize } | undefined): CardSize {
  const size = config?.size;
  return size && (CARD_SIZES as readonly string[]).includes(size) ? size : DEFAULT_CARD_SIZE;
}

/**
 * Columnas del grid de HA (12 por sección) con las que empieza cada tamaño y
 * mínimo al que se puede reducir a mano. El alto es automático.
 */
export const CARD_GRID: Record<CardSize, { columns: number; min_columns: number }> = {
  compact: { columns: 3, min_columns: 3 },
  medium: { columns: 6, min_columns: 4 },
  large: { columns: 12, min_columns: 4 },
};
