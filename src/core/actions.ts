import type { ActionConfig } from '../ha/types';

/** Las tres acciones configurables de una tarjeta. */
export type ActionKey = 'tap_action' | 'hold_action' | 'double_tap_action';

/** Acción por defecto de cada gesto (`action` de la `ActionConfig`). */
export type ActionDefaults = Readonly<Record<ActionKey, string>>;

/** Tarjetas que operan su entidad: pulsar la alterna, mantener abre «más información». */
export const TOGGLE_ACTION_DEFAULTS: ActionDefaults = { tap_action: 'toggle', hold_action: 'more-info', double_tap_action: 'none' };

/** Tarjetas que solo informan: pulsar abre «más información», lo demás no hace nada. */
export const INFO_ACTION_DEFAULTS: ActionDefaults = { tap_action: 'more-info', hold_action: 'none', double_tap_action: 'none' };

type CardActions = Partial<Record<ActionKey, ActionConfig>>;

/**
 * La acción configurada en `key` o, si no hay ninguna, `{ action: defaultAction }`.
 * Es lo que enseñan los editores en cada selector de acción.
 */
export function actionConfigFor(config: CardActions | undefined, key: ActionKey, defaultAction: string): ActionConfig {
  return config?.[key] || { action: defaultAction };
}

/** Lo mismo a partir del gesto de la tarjeta: `'tap'`, `'hold'` o `'double_tap'` (cualquier otro cuenta como `'tap'`). */
export function gestureActionFor(config: CardActions | undefined, gesture: string, defaults: ActionDefaults): ActionConfig {
  const key: ActionKey = gesture === 'hold' ? 'hold_action' : gesture === 'double_tap' ? 'double_tap_action' : 'tap_action';
  return actionConfigFor(config, key, defaults[key]);
}

/** Las tres acciones con sus valores por defecto, listas para `dispatchHassAction`. */
export function resolveActionConfigs(config: CardActions | undefined, defaults: ActionDefaults): Record<ActionKey, ActionConfig> {
  return {
    tap_action: actionConfigFor(config, 'tap_action', defaults.tap_action),
    hold_action: actionConfigFor(config, 'hold_action', defaults.hold_action),
    double_tap_action: actionConfigFor(config, 'double_tap_action', defaults.double_tap_action),
  };
}

/**
 * Despacha el evento `hass-action` que Home Assistant escucha para
 * ejecutar `tap_action` / `hold_action` / `double_tap_action`. Toda
 * tarjeta que soporte acciones configurables lo usa igual (acuerdo nº4).
 */
export function dispatchHassAction(
  el: HTMLElement,
  actionConfig: Record<string, unknown>,
  action: string
): void {
  const event = new CustomEvent('hass-action', {
    bubbles: true,
    composed: true,
    detail: { config: actionConfig, action },
  });
  el.dispatchEvent(event);
}

/**
 * Abre el diálogo "más información" de HA para una entidad concreta,
 * directamente — sin pasar por `tap_action` (que es una acción
 * configurable de toda la tarjeta, pensada para un único objetivo). Útil
 * para un icono de acceso fijo a una entidad puntual dentro de la
 * tarjeta (p. ej. varias entidades `climate` en la misma tarjeta, cada
 * una con su propio botón). Evento estándar que la interfaz de HA ya
 * escucha en cualquier parte del árbol.
 */
export function openMoreInfo(el: HTMLElement, entityId: string): void {
  const event = new CustomEvent('hass-more-info', {
    bubbles: true,
    composed: true,
    detail: { entityId },
  });
  el.dispatchEvent(event);
}
