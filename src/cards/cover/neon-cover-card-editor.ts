import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant, ValueChangedEvent } from '../../ha/types';
import { localize } from '../../core';
import { NEON_EDITOR_FORM_STYLES, renderHaloSection } from '../../shared';
import { COVER_TRANSLATIONS } from './translations';
import type { CoverTranslations } from './translations';
import type { NeonCoverCardConfig } from './types';

/** Editor visual de la Neón Cover Card: entidad, nombre y halo. */
export class NeonCoverCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: NeonCoverCardConfig;

  static styles = [NEON_EDITOR_FORM_STYLES];

  setConfig(config: NeonCoverCardConfig): void {
    this._config = config;
  }

  private _configChanged(key: string, value: unknown): void {
    if (!this._config) return;
    const config: NeonCoverCardConfig = { ...this._config };
    if (value === '' || value === undefined) delete config[key];
    else config[key] = value;
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  }

  private _t(key: keyof CoverTranslations): string {
    return localize(this.hass, COVER_TRANSLATIONS, key);
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const config = this._config;
    return html`
      <div class="editor-container">
        <div class="editor-section">
          <div class="section-header">${this._t('section_main')}</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${config.entity || ''}
            .includeDomains=${['cover']}
            label=${this._t('entity_label')}
            allow-custom-entity
            @value-changed=${(ev: ValueChangedEvent) => this._configChanged('entity', ev.detail.value)}
          ></ha-entity-picker>
          <label class="native-select-label" for="name">${this._t('name_label')}</label>
          <input id="name" type="text" class="native-input" .value=${config.name || ''} @input=${(ev: InputEvent) => this._configChanged('name', (ev.target as HTMLInputElement).value)} />
        </div>
        ${renderHaloSection(this.hass, config, { section: this._t('section_halo'), palette: this._t('palette_label') }, (key, value) => this._configChanged(key, value))}
      </div>
    `;
  }
}
