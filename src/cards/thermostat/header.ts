import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import type { ClimateState } from '../../ha/climate';
import { HVAC_MODE_ICONS } from './constants';

export interface HeaderOptions {
  climate: ClimateState;
  /** `config.name` tal cual (puede no existir). */
  configName: string | undefined;
  color: string;
  /** Botones de acceso a «más información» ya pintados. */
  actions: TemplateResult | typeof nothing;
}

/** Cabecera de las vistas grande y normal: icono de modo con halo,
    nombre (cae a la entidad si no hay `name`) y accesos a cada entidad. */
export function renderHeader(o: HeaderOptions): TemplateResult {
  const name = o.configName || o.climate.entity;
  const modeOn = o.climate.mode !== 'off';
  return html`
    <div class="header">
      <span class="icon-halo-wrap ${modeOn ? 'neon-halo-active' : ''}" style="--neon-c1: ${o.color}">
        <ha-icon class="header-icon neon-halo-icon" .icon=${HVAC_MODE_ICONS[o.climate.mode]}></ha-icon>
      </span>
      <div class="header-text">
        <span class="name">${name}</span>
      </div>
      ${o.actions}
    </div>
  `;
}

/** Cabecera de la vista compacta: en columna — fila de iconos (modo +
    accesos a cada entidad) arriba y el nombre debajo, solo si se ha
    configurado uno (aquí NO cae a la entidad, para no ocupar espacio). */
export function renderCompactHeader(o: HeaderOptions): TemplateResult {
  const modeOn = o.climate.mode !== 'off';
  return html`
    <div class="header header--compact">
      <div class="header-icons">
        <span class="icon-halo-wrap ${modeOn ? 'neon-halo-active' : ''}" style="--neon-c1: ${o.color}">
          <ha-icon class="header-icon neon-halo-icon" .icon=${HVAC_MODE_ICONS[o.climate.mode]}></ha-icon>
        </span>
        ${o.actions}
      </div>
      ${o.configName ? html`<span class="name">${o.configName}</span>` : nothing}
    </div>
  `;
}

/** Uno o dos iconos pequeños arriba a la derecha (uno por entidad
    climate configurada) que abren su diálogo de «más información»; el
    icono es el modo de ESA entidad. */
export function renderHeaderActions(
  entities: ClimateState[],
  hass: HomeAssistant,
  onOpen: (entityId: string) => void
): TemplateResult {
  return html`
    <div class="header-actions">
      ${entities.map((e) => {
        const label = hass.states[e.entity]?.attributes.friendly_name || e.entity;
        return html`
          <button
            class="header-action-btn"
            title=${label}
            aria-label=${label}
            @click=${(ev: Event) => {
              ev.stopPropagation();
              onOpen(e.entity);
            }}
          >
            <ha-icon icon=${HVAC_MODE_ICONS[e.mode]}></ha-icon>
          </button>
        `;
      })}
    </div>
  `;
}
