import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant, ValueChangedEvent } from '../../ha/types';
import { localize } from '../../core';
import { isCssColor, NEON_EDITOR_FORM_STYLES, renderHaloSection, resolveGradientColors, toHex6 } from '../../shared';
import { COVER_TYPES, ICON_COLOR_KEY, STATUS_COLOR_GROUPS, STATUS_COLOR_KEYS, STATUS_DOT_COLORS } from './constants';
import { resolveCoverType } from './cover-visual';
import { renderGlyph } from './cover-glyph';
import { NEON_COVER_GLYPH_STYLES } from './cover-glyph.styles';
import { NEON_COVER_EDITOR_STYLES } from './neon-cover-card-editor.styles';
import { COVER_TRANSLATIONS } from './translations';
import type { CoverTranslations } from './translations';
import type { CoverType, NeonCoverCardConfig } from './types';

/** Editor visual de la Neón Cover Card: entidad, nombre, tipo de cover, colores y halo. */
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
   * Selector de tipo: una ficha por dibujo (medio abierto) con su nombre. La
   * persiana enrollable es el valor por defecto, por eso no se guarda en la
   * config. Es un grupo de radio accesible.
   */
  private _renderTypePicker(): TemplateResult {
    const selected = resolveCoverType(this._config?.cover_type);
    const tile = (type: CoverType) => html`
      <button
        type="button"
        class="type-tile ${type === selected ? 'selected' : ''}"
        data-type=${type}
        role="radio"
        aria-checked=${type === selected ? 'true' : 'false'}
        @click=${() => this._configChanged('cover_type', type === 'shutter' ? undefined : type)}
      >
        ${renderGlyph({ glyph: type, open: 0.5, tilt: 0.3, uid: `editor-${type}` })}
        <span>${this._t(`type_${type}`)}</span>
      </button>
    `;
    return html`
      <span class="native-select-label" id="type-label">${this._t('type_label')}</span>
      <div class="type-picker" role="radiogroup" aria-labelledby="type-label">${COVER_TYPES.map(tile)}</div>
    `;
  }

  /** Un selector de color. Solo entiende `#rrggbb`: con otro formato en YAML muestra el de por defecto, pero la tarjeta usa el de YAML hasta que se toque. */
  private _renderColorRow(configKey: string, fallback: string, label: string): TemplateResult {
    const configured = this._config?.[configKey];
    const value = isCssColor(configured) ? (toHex6(configured) ?? fallback) : fallback;
    return html`
      <div class="color-picker-wrapper">
        <span>${label}</span>
        <input type="color" data-color=${configKey} .value=${value} @input=${(ev: Event) => this._configChanged(configKey, (ev.target as HTMLInputElement).value)} />
      </div>
    `;
  }

  /** Colores: el del icono (por defecto, el del halo) y el del punto de cada estado. */
  private _renderColorsSection(): TemplateResult {
    const keys = [ICON_COLOR_KEY, ...STATUS_COLOR_GROUPS.map((group) => STATUS_COLOR_KEYS[group])];
    const anySet = keys.some((key) => this._config?.[key] !== undefined);
    const haloColor = resolveGradientColors(this._config).c1;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_colors')}</div>
        <span class="data-hint">${this._t('icon_color_hint')}</span>
        <div class="color-list">${this._renderColorRow(ICON_COLOR_KEY, toHex6(haloColor) ?? haloColor, this._t('icon_color_label'))}</div>
        <span class="native-select-label">${this._t('status_color_label')}</span>
        <span class="data-hint">${this._t('status_color_hint')}</span>
        <div class="color-list">${STATUS_COLOR_GROUPS.map((group) => this._renderColorRow(STATUS_COLOR_KEYS[group], STATUS_DOT_COLORS[group], this._t(`status_color_${group}`)))}</div>
        ${anySet ? html`<button type="button" class="reset-colors" @click=${() => this._resetColors(keys)}>${this._t('colors_reset')}</button>` : nothing}
      </div>
    `;
  }

  /** Quita todos los colores de una vez (un solo `config-changed`). */
  private _resetColors(keys: string[]): void {
    if (!this._config) return;
    const config: NeonCoverCardConfig = { ...this._config };
    for (const key of keys) delete config[key];
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
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
        ${this._renderColorsSection()}
        ${renderHaloSection(this.hass, config, { section: this._t('section_halo'), palette: this._t('palette_label') }, (key, value) => this._configChanged(key, value))}
      </div>
    `;
  }
}
