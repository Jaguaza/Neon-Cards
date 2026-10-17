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
 * Acciones que operan la cerradura y, por tanto, van a provocar un cambio
 * de estado de la entidad (las demás —más info, navegar…— no).
 */
export const OPERATING_ACTIONS: readonly string[] = ['toggle', 'call-service', 'perform-action'];

/**
 * El halo sigue al estado de la cerradura (encendido mientras está abierta,
 * apagado al llegar a `locked`; ver `isLockHaloOn`). Para dar respuesta
 * inmediata al pulsar una acción que la opera —hay cerraduras que tardan
 * un par de segundos en cambiar de estado—, el halo se enciende ya y
 * espera, como máximo este tiempo (ms), a que el estado cambie; en cuanto
 * cambia manda el estado. Si no cambia (acción fallida) se apaga al agotarse.
 */
export const ACTION_PENDING_MS = 6000;

/**
 * Tiempo (ms) que la vista «¿Abrir?» espera una respuesta antes de
 * cancelarse sola: una cerradura no debe quedarse con la orden de abrir
 * pendiente indefinidamente si alguien pulsa y se va.
 */
export const CONFIRM_TIMEOUT_MS = 8000;

/**
 * Retardo (ms) entre encender el halo y mostrar la vista de confirmación.
 * El aro se dibuja con una transición CSS (`stroke-dashoffset`) y WebKit
 * (iOS, la app de HA) no la arranca si en el MISMO fotograma se inserta
 * además una capa nueva: el halo aparecía ya dibujado. Encendiendo primero
 * el halo y mostrando la vista un instante después, la transición empieza
 * limpia y el aro se dibuja mientras la vista aparece.
 */
export const CONFIRM_REVEAL_MS = 120;

/**
 * Colores por defecto del punto de estado, uno por grupo de estados:
 * cerrada (`locked`, `locking`), desbloqueada o abierta (`unlocked`,
 * `unlocking`, `open`, `opening`) y avería (`jammed`, `error`). Son los
 * mismos que usa la hoja de estilos; el editor los muestra como valor
 * inicial y un test comprueba que coinciden.
 */
export const STATUS_DOT_DEFAULTS = { closed: '#39e07a', open: '#ffb02e', alert: '#ff5c5c' } as const;
