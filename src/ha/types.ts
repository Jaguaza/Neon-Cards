/**
 * Tipos mínimos del objeto `hass` de Home Assistant que consumen las
 * tarjetas. Se amplía a medida que las tarjetas necesiten más superficie
 * de la API — no se copian estos tipos dentro de cada tarjeta (acuerdo nº4).
 */

export interface HassEntityState {
  entity_id: string;
  state: string;
  last_changed: string;
  last_updated: string;
  attributes: Record<string, unknown> & { friendly_name?: string };
}

export interface HomeAssistant {
  states: Record<string, HassEntityState>;
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>
  ): Promise<void>;
}
