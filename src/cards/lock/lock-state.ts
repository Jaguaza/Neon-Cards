import type { HomeAssistant } from '../../ha/types';
import { HA_LOCK_STATES } from './constants';
import type { LockVisualState, NeonLockCardConfig } from './types';

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
