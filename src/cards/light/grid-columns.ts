import { GRID_UNITS } from './constants';

/** Rejilla (CSS grid) en la que está la tarjeta, ya resuelta en píxeles. */
export interface GridInfo {
  tracks: number;
  trackWidth: number;
  gap: number;
}

type StyleReader = (element: Element) => Pick<CSSStyleDeclaration, 'display' | 'gridTemplateColumns' | 'columnGap'>;

const MAX_DEPTH = 16;

function parseGrid(style: ReturnType<StyleReader>): GridInfo | undefined {
  if (style.display !== 'grid') return undefined;
  const tracks = style.gridTemplateColumns.split(/\s+/).map(parseFloat);
  if (tracks.length < 2 || tracks.some((track) => !Number.isFinite(track))) return undefined;
  const gap = parseFloat(style.columnGap);
  return { tracks: tracks.length, trackWidth: tracks[0], gap: Number.isFinite(gap) ? gap : 0 };
}

/**
 * Sube desde `start` (atravesando los shadow roots de Home Assistant) hasta
 * la primera rejilla con varias columnas resueltas en píxeles: en una vista
 * de secciones, la de la sección. Sin rejilla (masonry, panel, editor)
 * devuelve `undefined`.
 */
export function findParentGrid(start: Node, readStyle: StyleReader = (element) => getComputedStyle(element)): GridInfo | undefined {
  let node: Node | null = start.parentNode;
  for (let depth = 0; node && depth < MAX_DEPTH; depth++) {
    if (node instanceof ShadowRoot) node = node.host;
    if (node instanceof Element) {
      const grid = parseGrid(readStyle(node));
      if (grid) return grid;
    }
    node = node.parentNode;
  }
  return undefined;
}

/**
 * Columnas (de 12) que ocupa una tarjeta de `cardWidth` px en esa rejilla:
 * 12 es todo el ancho de la sección, aunque la rejilla tenga otro número de
 * columnas. `undefined` si no se puede calcular.
 */
export function columnsInGrid(grid: GridInfo | undefined, cardWidth: number): number | undefined {
  if (!grid || cardWidth <= 0 || grid.trackWidth + grid.gap <= 0) return undefined;
  const span = Math.round((cardWidth + grid.gap) / (grid.trackWidth + grid.gap));
  return Math.max(1, Math.min(GRID_UNITS, Math.round((span * GRID_UNITS) / grid.tracks)));
}
