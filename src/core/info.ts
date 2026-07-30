import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HassEntityState, HomeAssistant } from '../ha/types';

/**
 * Qué mostrar en la línea principal/secundaria de una tarjeta (acuerdo
 * nº4: mismo concepto que usa Home Assistant/Mushroom, no se reinventa
 * por tarjeta).
 */
export const INFO_OPTIONS = ['name', 'state', 'last-changed', 'last-updated', 'none'] as const;
export type InfoOption = (typeof INFO_OPTIONS)[number];

export const INFO_LABELS: Record<InfoOption, string> = {
  name: 'Nombre',
  state: 'Estado',
  'last-changed': 'Último cambio',
  'last-updated': 'Última actualización',
  none: 'Ninguno',
};

export function computeInfoDisplay(
  info: InfoOption,
  name: string,
  state: string,
  stateObj: HassEntityState,
  hass: HomeAssistant
): string | TemplateResult | typeof nothing {
  switch (info) {
    case 'name':
      return name;
    case 'state':
      return state;
    case 'last-changed':
      return html`<ha-relative-time .hass=${hass} .datetime=${stateObj.last_changed} capitalize></ha-relative-time>`;
    case 'last-updated':
      return html`<ha-relative-time .hass=${hass} .datetime=${stateObj.last_updated} capitalize></ha-relative-time>`;
    case 'none':
    default:
      return nothing;
  }
}
