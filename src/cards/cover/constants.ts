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

/** Los tres iconos del pie de botones de un tipo de cover. */
export interface ControlIcons {
  close: string;
  stop: string;
  open: string;
}

const STOP_ICON = 'mdi:pause';

/** Persiana, veneciana y TV: cerrar baja (⤓) y abrir sube (⤒). */
const DOWN_TO_CLOSE: ControlIcons = { close: 'mdi:arrow-collapse-down', stop: STOP_ICON, open: 'mdi:arrow-collapse-up' };
/** Toldo y pantalla de proyector: se recogen hacia arriba, así que cerrar sube (⤒) y abrir baja (⤓). */
const UP_TO_CLOSE: ControlIcons = { close: 'mdi:arrow-collapse-up', stop: STOP_ICON, open: 'mdi:arrow-collapse-down' };

/**
 * Iconos de los botones según el tipo, para que la flecha dibuje el movimiento
 * real: la cortina se cierra con dos flechas hacia dentro (cada lado va de
 * fuera hacia el centro) y se abre con el mismo icono pero con las flechas
 * hacia fuera (`arrow-split-vertical`, las mismas barras); el toldo y la pantalla
 * de proyector se cierran hacia arriba (recogidos) y se abren hacia abajo.
 */
export const CONTROL_ICONS: Record<CoverType, ControlIcons> = {
  shutter: DOWN_TO_CLOSE,
  blind: DOWN_TO_CLOSE,
  tv: DOWN_TO_CLOSE,
  curtain: { close: 'mdi:arrow-collapse-horizontal', stop: STOP_ICON, open: 'mdi:arrow-split-vertical' },
  awning: UP_TO_CLOSE,
  projector: UP_TO_CLOSE,
};

/** Extremos del porcentaje de apertura (0 = cerrada, 100 = abierta del todo). */
export const POSITION_MIN = 0;
export const POSITION_MAX = 100;

/** Los tipos de cover que la tarjeta sabe dibujar, en el orden del editor. */
export const COVER_TYPES: readonly CoverType[] = ['shutter', 'blind', 'curtain', 'awning', 'projector', 'tv'];

/** Los tipos binarios: solo abiertos o cerrados; no se elige un porcentaje y no llevan dial ni deslizadores. */
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
