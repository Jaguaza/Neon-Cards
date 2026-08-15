import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HassEntityState, HomeAssistant } from '../ha/types';
import { localize } from './localize';
import { CORE_TRANSLATIONS } from './translations';
import type { CoreTranslations } from './translations';

/**
 * Qué mostrar en la línea principal/secundaria de una tarjeta (acuerdo
 * nº4: no se reinventa por tarjeta).
 */
export const INFO_OPTIONS = ['name', 'state', 'last-changed', 'last-updated', 'none'] as const;
export type InfoOption = (typeof INFO_OPTIONS)[number];

const INFO_OPTION_KEYS: Record<InfoOption, keyof CoreTranslations> = {
  name: 'info_name',
  state: 'info_state',
  'last-changed': 'info_last_changed',
  'last-updated': 'info_last_updated',
  none: 'info_none',
};

/** Etiquetas de INFO_OPTIONS en el idioma resuelto de `hass` — antes un
    Record fijo en español, ahora depende de hass.locale.language (ver
    src/core/localize.ts). Los editores que antes hacían
    `INFO_LABELS[opt]` ahora hacen `getInfoLabels(this.hass)[opt]`. */
export function getInfoLabels(hass: HomeAssistant | undefined): Record<InfoOption, string> {
  return {
    name: localize(hass, CORE_TRANSLATIONS, INFO_OPTION_KEYS.name),
    state: localize(hass, CORE_TRANSLATIONS, INFO_OPTION_KEYS.state),
    'last-changed': localize(hass, CORE_TRANSLATIONS, INFO_OPTION_KEYS['last-changed']),
    'last-updated': localize(hass, CORE_TRANSLATIONS, INFO_OPTION_KEYS['last-updated']),
    none: localize(hass, CORE_TRANSLATIONS, INFO_OPTION_KEYS.none),
  };
}

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
