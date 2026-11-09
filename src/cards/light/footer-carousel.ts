import { CARD_PADDING_X, FOOTER_ARROW_WIDTH, FOOTER_GAP, FOOTER_MIN_ITEM_WIDTH } from './constants';

/**
 * Cuántos iconos del pie caben a la vez en una tarjeta de `cardWidth` px. Si
 * caben todos, todos y sin flecha; si no, los que quepan junto a la flecha
 * del carrusel (como mínimo uno y siempre menos que el total). Sin medida
 * todavía (`cardWidth` <= 0) se muestran todos.
 */
export function visibleItemCount(total: number, cardWidth: number): number {
  if (total <= 1 || cardWidth <= 0) return total;
  const available = cardWidth - CARD_PADDING_X;
  if (total * FOOTER_MIN_ITEM_WIDTH + (total - 1) * FOOTER_GAP <= available) return total;
  const fit = Math.floor((available - FOOTER_ARROW_WIDTH) / (FOOTER_MIN_ITEM_WIDTH + FOOTER_GAP));
  return Math.min(total - 1, Math.max(1, fit));
}

/** Ventana circular de `count` elementos que empieza en `start`: tras el último vuelve al primero. */
export function carouselWindow<T>(items: readonly T[], start: number, count: number): T[] {
  if (items.length === 0) return [];
  return Array.from({ length: count }, (_, offset) => items[(start + offset) % items.length]);
}

/** Posición a la que pasa el carrusel al pulsar la flecha: una más, y de la última a la primera. */
export const nextStart = (start: number, total: number): number => (total <= 0 ? 0 : (start + 1) % total);
