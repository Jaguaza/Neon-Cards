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

/**
 * Duración (ms) del halo que se enciende al pulsar una acción (tap, hold
 * o double_tap distinta de `none`): el aro tarda 900 ms en dibujarse (ver
 * `transition` de `NEON_RING_SPLIT_STYLES` en `src/shared/glow.ts`) y se
 * mantiene un instante encendido antes de apagarse. Da respuesta
 * inmediata aunque la integración tarde en pasar a `locking`/`unlocking`
 * o salte directamente de `locked` a `unlocked`.
 */
export const ACTION_FLASH_MS = 1500;
