import type { FooterControl } from './types';

/** Icono cuando no hay `icon:` ni la entidad trae uno. */
export const DEFAULT_ICON = 'mdi:lightbulb';

/**
 * Columnas del grid de Home Assistant con las que empieza la tarjeta grande
 * (todo el ancho de la sección) y mínimo al que se puede reducir a mano; el
 * alto es automático.
 */
export const LIGHT_GRID = { columns: 12, min_columns: 4 } as const;

/** Alto mínimo (%) del llenado del icono con la luz encendida, para que se vea aunque el brillo sea muy bajo. */
export const MIN_FILL_PERCENT = 6;

/** Modos de color de `supported_color_modes` que permiten elegir un color. */
export const COLOR_MODES: readonly string[] = ['hs', 'xy', 'rgb', 'rgbw', 'rgbww'];

/** Rango de temperatura de color (K) cuando la entidad no declara el suyo. */
export const DEFAULT_KELVIN = { min: 2000, max: 6500 } as const;

/** Saturación (%) con la que se elige un color si la luz aún no tiene ninguno. */
export const DEFAULT_SATURATION = 100;

/**
 * Saturación mínima (%) que conserva la barra de color al elegir un tono. Con
 * una luz en blanco o casi (temperatura fría, saturación ~0) mantenerla
 * dejaría la luz blanca elijas el tono que elijas.
 */
export const MIN_PICK_SATURATION = 50;

/** Orden de los controles en el pie. */
export const CONTROL_ORDER: readonly FooterControl[] = ['brightness', 'color_temp', 'color'];

/** Iconos `mdi` de los botones del pie. */
export const FOOTER_ICONS = {
  brightness: 'mdi:brightness-6',
  color_temp: 'mdi:white-balance-sunny',
  color: 'mdi:palette',
  effects: 'mdi:auto-fix',
  close: 'mdi:close',
  next: 'mdi:chevron-right',
} as const;

/**
 * Cuántos iconos del pie caben a la vez, por columnas de la rejilla de Home
 * Assistant: una por cada 3 columnas que ocupa la tarjeta (12 columnas = 4
 * iconos, 9 = 3, 6 = 2, de 4 a 5 = 1). El resto se alcanza con la flecha del
 * carrusel.
 */
export const GRID_UNITS = 12;
export const COLUMNS_PER_ICON = 3;

/**
 * Respaldo por píxeles cuando la tarjeta no está en una rejilla de secciones
 * (vista masonry, panel, vista previa del editor): ancho mínimo por icono,
 * separación, ancho de la flecha y relleno horizontal de la tarjeta (2 × 20 px
 * más su borde).
 */
export const FOOTER_MIN_ITEM_WIDTH = 96;
export const FOOTER_GAP = 8;
export const FOOTER_ARROW_WIDTH = 32;
export const CARD_PADDING_X = 42;
