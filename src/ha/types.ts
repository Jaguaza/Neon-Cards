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

/**
 * Config de `tap_action`/`hold_action`/`double_tap_action`, común a
 * cualquier tarjeta con acciones configurables (acuerdo nº4). Vive aquí
 * en vez de en una tarjeta concreta porque ninguna tarjeta puede importar
 * código de otra (ver `src/cards/README.md`).
 */
export type ActionType = 'more-info' | 'toggle' | 'navigate' | 'url' | 'call-service' | 'assist' | 'none';

export interface ActionConfig {
  action: ActionType | string;
  [key: string]: unknown;
}
