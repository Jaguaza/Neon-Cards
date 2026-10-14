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

/**
 * Acciones que operan la cerradura y, por tanto, van a provocar un cambio
 * de estado de la entidad (las demás —más info, navegar…— no).
 */
export const OPERATING_ACTIONS: readonly string[] = ['toggle', 'call-service', 'perform-action'];

/**
 * Tiempo máximo (ms) que el halo espera, encendido, el cambio de estado
 * tras una acción que opera la cerradura. Hay cerraduras (portones) que
 * tardan más de `ACTION_FLASH_MS` en cambiar de estado: con solo el
 * destello fijo el halo se retiraba a medias y volvía a dibujarse al
 * llegar el cambio (un «rebote»). Con la espera sigue encendido sin hueco;
 * al llegar el cambio, el halo se mantiene `ACTION_FLASH_MS` más. Si el
 * estado no cambia (acción fallida), se apaga al agotarse.
 */
export const ACTION_PENDING_MS = 6000;
