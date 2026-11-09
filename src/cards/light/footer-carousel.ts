import { CARD_PADDING_X, COLUMNS_PER_ICON, FOOTER_ARROW_WIDTH, FOOTER_GAP, FOOTER_MIN_ITEM_WIDTH } from './constants';

/** Por columnas de la rejilla: un icono por cada `COLUMNS_PER_ICON` columnas, como mínimo uno y menos que el total si no caben. */
function visibleByColumns(total: number, columns: number): number {
  const count = Math.max(1, Math.floor(columns / COLUMNS_PER_ICON));
  return count >= total ? total : count;
}

/** Respaldo por píxeles: los que quepan junto a la flecha, como mínimo uno y siempre menos que el total. */
function visibleByWidth(total: number, cardWidth: number): number {
  const available = cardWidth - CARD_PADDING_X;
  if (total * FOOTER_MIN_ITEM_WIDTH + (total - 1) * FOOTER_GAP <= available) return total;
  const fit = Math.floor((available - FOOTER_ARROW_WIDTH) / (FOOTER_MIN_ITEM_WIDTH + FOOTER_GAP));
  return Math.min(total - 1, Math.max(1, fit));
}

/**
 * Cuántos iconos del pie caben a la vez. Con las columnas que ocupa la tarjeta
 * en la rejilla de Home Assistant (`columns`, de 12) manda la regla por
 * columnas; sin ellas (masonry, panel, editor), el ancho en píxeles. Si caben
 * todos, todos y sin flecha. Sin medida todavía (`cardWidth` <= 0) se
 * muestran todos.
 */
export function visibleItemCount(total: number, cardWidth: number, columns?: number): number {
  if (total <= 1 || cardWidth <= 0) return total;
  return columns === undefined ? visibleByWidth(total, cardWidth) : visibleByColumns(total, columns);
}

/** Ventana circular de `count` elementos que empieza en `start`: tras el último vuelve al primero. */
export function carouselWindow<T>(items: readonly T[], start: number, count: number): T[] {
  if (items.length === 0) return [];
  return Array.from({ length: count }, (_, offset) => items[(start + offset) % items.length]);
}

/** Posición a la que pasa el carrusel al pulsar la flecha: una más, y de la última a la primera. */
export const nextStart = (start: number, total: number): number => (total <= 0 ? 0 : (start + 1) % total);
