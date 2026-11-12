import { GRID_UNITS } from './constants';

/** Rejilla (CSS grid) en la que está la tarjeta, ya resuelta en píxeles. */
export interface GridInfo {
  tracks: number;
  trackWidth: number;
  gap: number;
}

type StyleReader = (element: Element) => Pick<CSSStyleDeclaration, 'display' | 'gridTemplateColumns' | 'columnGap'>;

const MAX_DEPTH = 16;
const ELEMENT_NODE = 1;
const FRAGMENT_NODE = 11;

const NO_GRID: ReturnType<StyleReader> = { display: 'block', gridTemplateColumns: 'none', columnGap: 'normal' };

/** Lectura de estilos del navegador; fuera de él (pruebas de rendimiento en Node) no hay rejilla. */
const browserStyle: StyleReader = (element) => (typeof getComputedStyle === 'function' ? getComputedStyle(element) : NO_GRID);

function parseGrid(style: ReturnType<StyleReader>): GridInfo | undefined {
  if (style.display !== 'grid') return undefined;
  const tracks = style.gridTemplateColumns.split(/\s+/).map(parseFloat);
  if (tracks.length < 2 || tracks.some((track) => !Number.isFinite(track))) return undefined;
  const gap = parseFloat(style.columnGap);
  return { tracks: tracks.length, trackWidth: tracks[0], gap: Number.isFinite(gap) ? gap : 0 };
}

/** Sube un nivel: al padre o, en la raíz de un shadow root, a su anfitrión. Por `nodeType`, sin las clases globales `Element` y `ShadowRoot` (no existen en Node). */
function parentOf(node: Node): Node | null {
  if (node.nodeType === FRAGMENT_NODE && 'host' in node) return (node as ShadowRoot).host;
  return node.parentNode ?? null;
}

/**
 * Sube desde `start` (atravesando los shadow roots de Home Assistant) hasta
 * la primera rejilla con varias columnas resueltas en píxeles: en una vista
 * de secciones, la de la sección. Sin rejilla (masonry, panel, editor)
 * devuelve `undefined`.
 */
export function findParentGrid(start: Node, readStyle: StyleReader = browserStyle): GridInfo | undefined {
  let node = parentOf(start);
  for (let depth = 0; node && depth < MAX_DEPTH; depth++) {
    if (node.nodeType === ELEMENT_NODE) {
      const grid = parseGrid(readStyle(node as Element));
      if (grid) return grid;
    }
    node = parentOf(node);
  }
  return undefined;
}

/**
 * Columnas que ocupa una tarjeta de `cardWidth` px en esa rejilla. Las
 * secciones de Home Assistant tienen 12 columnas por cada sección de ancho
 * que ocupan (12, 24, 36...): ahí la tarjeta ocupa tal cual las columnas que
 * cuenta Home Assistant en sus opciones de rejilla (en una sección ensanchada,
 * 8 columnas son 8 y no 4). Cualquier otra rejilla (la tarjeta `grid`, por
 * ejemplo) se normaliza a 12, que es todo su ancho. `undefined` si no se puede
 * calcular.
 */
export function columnsInGrid(grid: GridInfo | undefined, cardWidth: number): number | undefined {
  if (!grid || cardWidth <= 0 || grid.trackWidth + grid.gap <= 0) return undefined;
  const span = Math.max(1, Math.round((cardWidth + grid.gap) / (grid.trackWidth + grid.gap)));
  if (grid.tracks % GRID_UNITS === 0) return span;
  return Math.max(1, Math.min(GRID_UNITS, Math.round((span * GRID_UNITS) / grid.tracks)));
}
