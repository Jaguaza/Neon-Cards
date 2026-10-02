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
