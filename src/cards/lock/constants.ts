import { NEON_CARDS_VERSION } from '../../version';
import type { LockVisualState } from './types';

export const CARD_AUTHOR = 'Jaguaza';
export const CARD_VERSION = NEON_CARDS_VERSION;

/** Icono mientras todavía no hay `hass` (primer render, antes de conocer el estado). */
export const DEFAULT_ICON = 'mdi:lock';

/**
 * Icono por estado. `error` usa el mismo `mdi:close` que Button para
 * "entidad rota" — el icono deja de comunicar la acción y pasa a
 * comunicar el problema, con el halo rojo de `.neon-halo-error`.
 */
export const LOCK_ICONS: Record<LockVisualState, string> = {
  locked: 'mdi:lock',
  unlocked: 'mdi:lock-open-variant',
  locking: 'mdi:lock-clock',
  unlocking: 'mdi:lock-clock',
  jammed: 'mdi:lock-alert',
  open: 'mdi:door-open',
  opening: 'mdi:door-open',
  error: 'mdi:close',
};

/** Estados del dominio `lock` que HA puede devolver (todo lo demás es `error`). */
export const HA_LOCK_STATES: readonly LockVisualState[] = [
  'locked',
  'unlocked',
  'locking',
  'unlocking',
  'jammed',
  'open',
  'opening',
];
