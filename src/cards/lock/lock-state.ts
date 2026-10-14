import type { HomeAssistant } from '../../ha/types';
import { HA_LOCK_STATES } from './constants';
import type { LockVisualState, NeonLockCardConfig } from './types';
import type { ActionConfig } from '../../ha/types';
import { OPERATING_ACTIONS } from './constants';

/**
 * Estado visual de la cerradura a partir de la config y de `hass`.
 *
 * - `undefined`: todavía no hay `hass` (primer render o vista previa del
 *   editor) — no es un error, la tarjeta se pinta neutra.
 * - `'error'`: sin `entity:`, entidad inexistente, `unavailable`/`unknown`
 *   o un estado que el dominio `lock` no define (p. ej. una entidad `on`/`off`).
 */
export function resolveLockState(
  config: NeonLockCardConfig | undefined,
  hass: HomeAssistant | undefined
): LockVisualState | undefined {
  if (!hass) return undefined;
  if (!config?.entity) return 'error';
  const state = hass.states[config.entity]?.state;
  return (HA_LOCK_STATES as readonly string[]).includes(state ?? '') ? (state as LockVisualState) : 'error';
}

/** Rojo de alerta (`.neon-halo-error` de src/shared): atascada o entidad rota. */
export function isLockAlert(state: LockVisualState | undefined): boolean {
  return state === 'jammed' || state === 'error';
}

/**
 * Cerradura accionándose (cerrando, abriendo el pestillo o la puerta):
 * el icono pulsa mientras dura el movimiento.
 */
export function isLockMoving(state: LockVisualState | undefined): boolean {
  return state === 'locking' || state === 'unlocking' || state === 'opening';
}

/**
 * Pose del candado: abierto (arco levantado y girado) en `unlocking`,
 * `unlocked`, `open` y `opening`; cerrado en `locked`, `locking`,
 * `jammed` y mientras no hay `hass`. Los estados transitorios adoptan ya
 * la pose de destino, así la animación arranca en cuanto la cerradura
 * empieza a moverse.
 */
export function isLockOpenPose(state: LockVisualState | undefined): boolean {
  return state === 'unlocking' || state === 'unlocked' || state === 'open' || state === 'opening';
}

/**
 * Halo neón encendido: desde que la cerradura se abre (`unlocking`,
 * `unlocked`, `opening`, `open`) y se mantiene mientras siga abierta,
 * también al cerrarse (`locking`), hasta que llega a `locked`. Cerrada,
 * atascada (que lleva el rojo de alerta aparte) y sin datos no hay halo.
 * Depende solo del estado de la entidad, así que todas las tarjetas de la
 * misma entidad lo muestran a la vez y no hay temporizadores que lo
 * apaguen y lo vuelvan a encender.
 */
export function isLockHaloOn(state: LockVisualState | undefined): boolean {
  return state === 'unlocking' || state === 'unlocked' || state === 'open' || state === 'opening' || state === 'locking';
}

/**
 * ¿Esta acción, con la cerradura en este estado, la va a ABRIR? Es lo que
 * pide confirmación (ver `confirm_open`). `toggle` abre si está cerrada
 * (`locked`); un servicio explícito se decide por su nombre
 * (`lock.unlock` y `lock.open` abren, `lock.lock` no) y, si es otro
 * (un script, por ejemplo), por el estado: cerrada → se entiende que abre.
 * Más info, navegar, etc. no operan la cerradura y nunca piden confirmación.
 */
export function isOpeningAction(action: ActionConfig, state: LockVisualState | undefined): boolean {
  if (!OPERATING_ACTIONS.includes(action.action) || !state || state === 'error') return false;
  if (action.action === 'toggle') return state === 'locked';
  const service = String(action.perform_action ?? action.service ?? '');
  if (service === 'lock.lock') return false;
  if (service === 'lock.unlock' || service === 'lock.open') return true;
  return state === 'locked';
}

/** Órdenes del dominio `lock` que la tarjeta sabe lanzar (servicios `lock.<orden>`). */
export type LockCommand = 'lock' | 'unlock' | 'open';

/** Bit de `supported_features` de una cerradura que indica que soporta `lock.open`. */
export const LOCK_SUPPORT_OPEN = 1;

/** ¿La entidad soporta además `lock.open` (abrir el pestillo/puerta)? Según su atributo `supported_features`. */
export function lockSupportsOpen(attributes: Record<string, unknown> | undefined): boolean {
  const features = Number(attributes?.supported_features ?? 0);
  return Number.isFinite(features) && (features & LOCK_SUPPORT_OPEN) !== 0;
}

/**
 * Opciones entre las que elegir al pulsar. Solo hay elección cuando la
 * acción es `toggle` (la tarjeta decide qué hacer) y la cerradura soporta
 * abrir: cerrada → desbloquear o abrir; desbloqueada → bloquear o abrir.
 * En cualquier otro caso (sin soporte de abrir, otros estados, una acción
 * con servicio explícito) no hay nada que elegir y devuelve `[]`.
 */
export function lockChoices(action: ActionConfig, state: LockVisualState | undefined, supportsOpen: boolean): LockCommand[] {
  if (action.action !== 'toggle' || !supportsOpen) return [];
  if (state === 'locked') return ['unlock', 'open'];
  if (state === 'unlocked') return ['lock', 'open'];
  return [];
}
