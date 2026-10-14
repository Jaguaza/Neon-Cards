import { NEON_CARDS_VERSION } from '../../version';
import type { LockVisualState } from './types';

export const CARD_AUTHOR = 'Jaguaza';
export const CARD_VERSION = NEON_CARDS_VERSION;

/**
 * Icono `mdi` del estado `error` (sin entidad válida): mismo `mdi:close`
 * que Button para "entidad rota". El resto de estados dibujan el
 * candado animado de `lock-icon.ts`.
 */
export const ERROR_ICON = 'mdi:close';

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
 * o double_tap distinta de `none`) y, en todas las tarjetas de la entidad,
 * cuando esta cambia de estado: el aro tarda 900 ms en dibujarse (ver
 * `transition` de `NEON_RING_SPLIT_STYLES` en `src/shared/glow.ts`) y se
 * mantiene un instante encendido antes de apagarse. Da respuesta
 * inmediata aunque la integración tarde en pasar a `locking`/`unlocking`
 * o salte directamente de `locked` a `unlocked`.
 */
export const ACTION_FLASH_MS = 1500;
