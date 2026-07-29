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
