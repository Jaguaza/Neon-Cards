import type { HomeAssistant } from '../../ha/types';
import { HA_LOCK_STATES } from './constants';
import { isCssColor } from '../../shared';
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

/**
 * Estado del sensor de puerta configurado (`door_entity`, un `binary_sensor`):
 * `true` si está activo (`on`, puerta abierta), `false` si no (`off`) y
 * `undefined` si no hay sensor, no existe o no da un valor válido
 * (`unavailable`, `unknown`). Funciona aunque el pie no muestre el sensor.
 */
export function doorSensorOpen(config: NeonLockCardConfig | undefined, hass: HomeAssistant | undefined): boolean | undefined {
  const id = config?.door_entity;
  if (!id || !hass) return undefined;
  const state = hass.states[id]?.state;
  if (state === 'on') return true;
  if (state === 'off') return false;
  return undefined;
}

/**
 * Estado que se MUESTRA en el rótulo de estado (arriba a la derecha y, si
 * se pide, en el subtítulo). No siempre es el de la entidad:
 *
 *  - «Puerta abierta» (`open`) solo sale con el sensor de puerta activo
 *    (`doorOpen`) y la cerradura sin cerrar con llave (`unlocked`,
 *    `unlocking`, `open`, `opening`). Sin sensor no sale nunca.
 *  - El estado `open` de la cerradura (pestillo liberado) sin el sensor
 *    activo es «Abriendo puerta…» (`opening`): la puerta aún no está abierta.
 *  - Con `openingPending` (se acaba de pulsar «Abrir» y la entidad todavía
 *    no ha cambiado) también sale «Abriendo puerta…» desde ya.
 *  - `error` y `jammed` no se tocan; el resto es el estado de la entidad.
 */
export function displayState(
  state: LockVisualState | undefined,
  doorOpen: boolean | undefined,
  openingPending = false
): LockVisualState | undefined {
  if (!state || state === 'error' || state === 'jammed') return state;
  if (doorOpen && (state === 'unlocked' || state === 'unlocking' || state === 'open' || state === 'opening')) return 'open';
  if (state === 'open') return 'opening';
  if (openingPending && (state === 'locked' || state === 'unlocked')) return 'opening';
  return state;
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

/** Grupo de estados que comparten el color del punto de estado. */
export type StatusColorGroup = 'closed' | 'open' | 'alert';

/** Cerrada y cerrándose → `closed`; desbloqueada, abierta o abriéndose → `open`; avería → `alert`. */
export function statusColorGroup(state: LockVisualState): StatusColorGroup {
  if (state === 'locked' || state === 'locking') return 'closed';
  if (state === 'jammed' || state === 'error') return 'alert';
  return 'open';
}

const STATUS_COLOR_KEYS = {
  closed: 'status_color_closed',
  open: 'status_color_open',
  alert: 'status_color_alert',
} as const;

/** Color elegido en la config para el punto de este estado; `undefined` si no hay o no es válido (vale el de la hoja de estilos). */
export function statusDotColor(config: NeonLockCardConfig | undefined, state: LockVisualState): string | undefined {
  const value = config?.[STATUS_COLOR_KEYS[statusColorGroup(state)]];
  return isCssColor(value) ? value.trim() : undefined;
}
