import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant, ValueChangedEvent } from '../../ha/types';
import { localize } from '../../core';
import { NEON_EDITOR_FORM_STYLES, renderHaloSection } from '../../shared';
import { COVER_TYPES } from './constants';
import { renderGlyph } from './cover-glyph';
import { NEON_COVER_GLYPH_STYLES } from './cover-glyph.styles';
import { NEON_COVER_EDITOR_STYLES } from './neon-cover-card-editor.styles';
import { COVER_TRANSLATIONS } from './translations';
import type { CoverTranslations } from './translations';
import type { CoverType, NeonCoverCardConfig } from './types';

/** Editor visual de la Neón Cover Card: entidad, nombre, tipo de cover y halo. */
export class NeonCoverCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: NeonCoverCardConfig;

  static styles = [NEON_EDITOR_FORM_STYLES, NEON_COVER_GLYPH_STYLES, NEON_COVER_EDITOR_STYLES];

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

  /**
   * Selector de tipo: una ficha por dibujo (medio abierto) con su nombre, más
   * «Automático», que deduce el tipo del `device_class` de la entidad y es el
   * valor por defecto, por eso no se guarda en la config. Es un grupo de
   * radio accesible.
   */
  private _renderTypePicker(): TemplateResult {
    const configured = this._config?.cover_type;
    const selected: CoverType | 'auto' = configured && COVER_TYPES.includes(configured) ? configured : 'auto';
    const tile = (type: CoverType | 'auto', icon: TemplateResult) => html`
      <button
        type="button"
        class="type-tile ${type === selected ? 'selected' : ''}"
        data-type=${type}
        role="radio"
        aria-checked=${type === selected ? 'true' : 'false'}
        @click=${() => this._configChanged('cover_type', type === 'auto' ? undefined : type)}
      >
        ${icon}
        <span>${this._t(`type_${type}`)}</span>
      </button>
    `;
    return html`
      <span class="native-select-label" id="type-label">${this._t('type_label')}</span>
      <div class="type-picker" role="radiogroup" aria-labelledby="type-label">
        ${tile('auto', html`<ha-icon icon="mdi:auto-fix"></ha-icon>`)}
        ${COVER_TYPES.map((type) => tile(type, renderGlyph({ glyph: type, open: 0.5, tilt: 0.3, uid: `editor-${type}` })))}
      </div>
    `;
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
          ${this._renderTypePicker()}
        </div>
        ${renderHaloSection(this.hass, config, { section: this._t('section_halo'), palette: this._t('palette_label') }, (key, value) => this._configChanged(key, value))}
      </div>
    `;
  }
}
