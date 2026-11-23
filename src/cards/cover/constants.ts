import type { StatusGroup } from './types';

/** Iconos de un tipo de cover: con la persiana abierta (o a medias) y cerrada. */
export interface CoverIconPair {
  open: string;
  closed: string;
}

/** Iconos por `device_class`, los mismos que usa Home Assistant para sus covers. */
export const COVER_ICONS: Record<string, CoverIconPair> = {
  awning: { open: 'mdi:awning-outline', closed: 'mdi:awning-outline' },
  blind: { open: 'mdi:blinds-horizontal', closed: 'mdi:blinds-horizontal-closed' },
  curtain: { open: 'mdi:curtains', closed: 'mdi:curtains-closed' },
  damper: { open: 'mdi:valve-open', closed: 'mdi:valve-closed' },
  door: { open: 'mdi:door-open', closed: 'mdi:door-closed' },
  garage: { open: 'mdi:garage-open', closed: 'mdi:garage' },
  gate: { open: 'mdi:gate-open', closed: 'mdi:gate' },
  shade: { open: 'mdi:roller-shade', closed: 'mdi:roller-shade-closed' },
  shutter: { open: 'mdi:window-shutter-open', closed: 'mdi:window-shutter' },
  window: { open: 'mdi:window-open', closed: 'mdi:window-closed' },
};

/** Icono de un cover sin `device_class` (o con una que no está en `COVER_ICONS`). */
export const DEFAULT_COVER_ICONS: CoverIconPair = { open: 'mdi:window-open', closed: 'mdi:window-closed' };

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
