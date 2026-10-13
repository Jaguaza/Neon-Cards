import type { HomeAssistant } from '../../ha/types';
import { DEFAULT_ICON, HA_LOCK_STATES, LOCK_ICONS } from './constants';
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
 * halo neón encendido y el icono pulsa. En reposo (`locked`, `unlocked`,
 * `open`) la tarjeta no lleva halo — este es el único estado, junto con
 * el destello al pulsar (ver ACTION_FLASH_MS), que lo enciende.
 */
export function isLockMoving(state: LockVisualState | undefined): boolean {
  return state === 'locking' || state === 'unlocking' || state === 'opening';
}

export function resolveLockIcon(state: LockVisualState | undefined): string {
  return state ? LOCK_ICONS[state] : DEFAULT_ICON;
}
