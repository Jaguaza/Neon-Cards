import type { CoverSize, CoverType, StatusGroup } from './types';

/** Color del punto de estado: verde abierta, ámbar en movimiento, gris cerrada y rojo no disponible. */
export const STATUS_DOT_COLORS: Record<StatusGroup, string> = {
  open: '#39e07a',
  moving: '#ffb02e',
  closed: '#9aa0a6',
  alert: '#ff5c5c',
};

/** Clave de la config con el color del punto de cada grupo de estado. */
export const STATUS_COLOR_KEYS = {
  open: 'status_color_open',
  moving: 'status_color_moving',
  closed: 'status_color_closed',
  alert: 'status_color_alert',
} as const satisfies Record<StatusGroup, string>;

/** Los grupos de estado cuyo color se puede cambiar, en el orden del editor. */
export const STATUS_COLOR_GROUPS: readonly StatusGroup[] = ['open', 'moving', 'closed', 'alert'];

/** Clave de la config con el color del icono grande; sin ella el icono sigue al halo. */
export const ICON_COLOR_KEY = 'icon_color';

/** Iconos de los tres botones de la tarjeta. */
export const CONTROL_ICONS = {
  close: 'mdi:arrow-collapse-down',
  stop: 'mdi:pause',
  open: 'mdi:arrow-collapse-up',
} as const;

/** Extremos del porcentaje de apertura (0 = cerrada, 100 = abierta del todo). */
export const POSITION_MIN = 0;
export const POSITION_MAX = 100;

/** Los tipos de cover que la tarjeta sabe dibujar, en el orden del editor. */
export const COVER_TYPES: readonly CoverType[] = ['shutter', 'blind', 'curtain', 'awning', 'projector', 'tv'];

/** Los tipos binarios: solo abiertos o cerrados, sin porcentaje, dial ni deslizadores. */
export const BINARY_COVER_TYPES: readonly CoverType[] = ['projector', 'tv'];

/** Los tamaños de la tarjeta, en el orden del editor. */
export const COVER_SIZES: readonly CoverSize[] = ['large', 'medium'];
export const DEFAULT_COVER_SIZE: CoverSize = 'large';

/**
 * Ancho de la tarjeta en la rejilla de secciones de Home Assistant. La grande
 * empieza a 12 columnas (todo el ancho) y solo se puede dejar entre 9 y 12:
 * con menos no hay sitio para el icono grande, el porcentaje con el dial y el
 * pie de botones. La mediana empieza a 8 columnas y se puede dejar entre 6 y 8
 * (el ancho de la mediana del termostato); sin dial necesita menos, pero no
 * menos de 6 para el % con el icono grande al lado.
 */
export const COVER_GRID: Record<CoverSize, { columns: number; min_columns: number; max_columns: number }> = {
  large: { columns: 12, min_columns: 9, max_columns: 12 },
  medium: { columns: 8, min_columns: 6, max_columns: 8 },
};
