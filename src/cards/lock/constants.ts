import type { LockVisualState } from './types';

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
 * Tiempo (ms) que la vista «¿Abrir?» espera una respuesta antes de
 * cancelarse sola: una cerradura no debe quedarse con la orden de abrir
 * pendiente indefinidamente si alguien pulsa y se va.
 */
export const CONFIRM_TIMEOUT_MS = 8000;

/**
 * Colores por defecto del punto de estado, uno por grupo de estados:
 * cerrada (`locked`, `locking`), desbloqueada o abierta (`unlocked`,
 * `unlocking`, `open`, `opening`) y avería (`jammed`, `error`). Son los
 * mismos que usa la hoja de estilos; el editor los muestra como valor
 * inicial y un test comprueba que coinciden.
 */
export const STATUS_DOT_DEFAULTS = { closed: '#39e07a', open: '#ffb02e', alert: '#ff5c5c' } as const;

/**
 * Iconos de candado de cada orden en la confirmación de la tarjeta compacta
 * (que no lleva texto): cerrar, desbloquear (candado abierto con el arco
 * girado) y abrir (candado abierto de contorno).
 */
export const COMMAND_ICONS = {
  lock: 'mdi:lock',
  unlock: 'mdi:lock-open-variant',
  open: 'mdi:lock-open-outline',
} as const;
