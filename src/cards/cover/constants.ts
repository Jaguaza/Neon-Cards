import type { CoverType, StatusGroup } from './types';

/** Color del punto de estado: verde abierta, ámbar en movimiento, gris cerrada y rojo no disponible. */
export const STATUS_DOT_COLORS: Record<StatusGroup, string> = {
  open: '#39e07a',
  moving: '#ffb02e',
  closed: '#9aa0a6',
  alert: '#ff5c5c',
};

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
