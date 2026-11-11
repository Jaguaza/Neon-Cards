import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { EDITOR_ACTIONS } from '../../ha/types';
import type { HomeAssistant, ValueChangedEvent } from '../../ha/types';
import { INFO_OPTIONS, actionConfigFor, getInfoLabels, localize } from '../../core';
import type { ActionKey } from '../../core';
import { NEON_EDITOR_FORM_STYLES, SHARED_TRANSLATIONS, renderHaloSection } from '../../shared';
import type { SharedTranslations } from '../../shared';
import { enabledOptions, nextFavoriteColor, renderFavoritesEditor, renderFooterOptions, toggleOption } from './footer-editor';
import { parseFavorites } from './favorites';
import { NEON_LIGHT_EDITOR_STYLES } from './neon-light-card-editor.styles';
import { LIGHT_SIZES, MAX_FAVORITES } from './constants';
import { resolveLightSize } from './light-state';
import { LIGHT_TRANSLATIONS } from './translations';
import type { LightTranslations } from './translations';
import type { FooterItem, LightSize, NeonLightCardConfig } from './types';

/** Texto de cada tamaño en el selector. */
const SIZE_LABEL_KEYS: Record<LightSize, keyof LightTranslations> = { large: 'size_large', compact: 'size_compact' };

/** Editor visual de la Neón Light Card: entidad y textos, halo y acciones. */
export class NeonLightCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: NeonLightCardConfig;

  static styles = [NEON_EDITOR_FORM_STYLES, NEON_LIGHT_EDITOR_STYLES];

  setConfig(config: NeonLightCardConfig): void {
    this._config = config;
  }

  private _configChanged(key: string, value: unknown): void {
    if (!this._config) return;
    const config: NeonLightCardConfig = { ...this._config };
    if (value === '' || value === undefined) delete config[key];
    else config[key] = value;
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  }

  private _t(key: keyof LightTranslations): string {
    return localize(this.hass, LIGHT_TRANSLATIONS, key);
  }

  /** Igual que `_t()`, pero para las claves de `src/shared` (acciones). */
  private _ts(key: keyof SharedTranslations): string {
    return localize(this.hass, SHARED_TRANSLATIONS, key);
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <div class="editor-container">
        ${this._renderMainSection()} ${this._renderFooterSection()}
        ${renderHaloSection(this.hass, this._config, { section: this._t('section_halo'), palette: this._t('palette_label') }, (key, value) => this._configChanged(key, value))}
        ${this._renderActionsSection()}
      </div>
    `;
  }

  private _renderMainSection(): TemplateResult {
    const config = this._config!;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_main')}</div>
        ${this._renderSizeField(config)}
        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.entity || ''}
          .includeDomains=${['light']}
          label=${this._t('entity_label')}
          allow-custom-entity
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged('entity', ev.detail.value)}
        ></ha-entity-picker>
        <label class="native-select-label" for="name">${this._t('name_label')}</label>
        <input id="name" type="text" class="native-input" .value=${config.name || ''} @input=${(ev: InputEvent) => this._configChanged('name', (ev.target as HTMLInputElement).value)} />
        ${this._renderSubtitleFields(config)}
        <ha-icon-picker id="icon" .hass=${this.hass} .value=${config.icon || ''} label=${this._t('icon_label')} @value-changed=${(ev: ValueChangedEvent) => this._configChanged('icon', ev.detail.value)}></ha-icon-picker>
      </div>
    `;
  }

  private _renderSizeField(config: NeonLightCardConfig): TemplateResult {
    const size = resolveLightSize(config);
    return html`
      <label class="native-select-label" for="size">${this._t('size_label')}</label>
      <select
        id="size"
        class="native-select"
        .value=${size}
        @change=${(ev: Event) => {
          const value = (ev.target as HTMLSelectElement).value;
          if (value && value !== size) this._configChanged('size', value === 'large' ? undefined : value);
        }}
      >
        ${LIGHT_SIZES.map((option) => html`<option value=${option} ?selected=${option === size}>${this._t(SIZE_LABEL_KEYS[option])}</option>`)}
      </select>
    `;
  }

  /** Sección del pie; con la compacta no hay pie, así que no sale (sus valores se conservan en la config por si se vuelve a la grande). */
  private _renderFooterSection(): TemplateResult | typeof nothing {
    if (resolveLightSize(this._config) === 'compact') return nothing;
    const names: Record<FooterItem, string> = {
      brightness: this._t('control_brightness'),
      color_temp: this._t('control_color_temp'),
      color: this._t('control_color'),
      favorites: this._t('control_favorites'),
      effects: this._t('control_effects'),
    };
    const favorites = parseFavorites(this._config?.favorite_colors).map((favorite) => favorite.hex);
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_footer')}</div>
        ${renderFooterOptions(enabledOptions(this._config?.footer_options), { label: this._t('footer_options_label'), hint: this._t('footer_options_hint'), names }, (option, on) =>
          this._configChanged('footer_options', toggleOption(enabledOptions(this._config?.footer_options), option, on))
        )}
        ${renderFavoritesEditor(
          favorites,
          { label: this._t('favorites_label'), hint: this._t('favorites_hint'), color: this._t('favorite_color'), add: this._t('favorite_add'), remove: this._t('favorite_remove') },
          {
            onChange: (index, hex) => this._setFavorites(favorites.map((current, i) => (i === index ? hex : current))),
            onAdd: () => favorites.length < MAX_FAVORITES && this._setFavorites([...favorites, nextFavoriteColor(favorites)]),
            onRemove: (index) => this._setFavorites(favorites.filter((_, i) => i !== index)),
          }
        )}
      </div>
    `;
  }

  /** Guarda los colores favoritos; sin ninguno, quita la clave. */
  private _setFavorites(favorites: string[]): void {
    this._configChanged('favorite_colors', favorites.length > 0 ? favorites : undefined);
  }

  private _renderSubtitleFields(config: NeonLightCardConfig): TemplateResult {
    const type = config.subtitle_type || 'custom';
    const labels = getInfoLabels(this.hass);
    return html`
      <label class="native-select-label" for="subtitle-type">${this._t('subtitle_label')}</label>
      <select
        id="subtitle-type"
        class="native-select"
        .value=${type}
        @change=${(ev: Event) => {
          const value = (ev.target as HTMLSelectElement).value;
          if (!value || value === type) return;
          this._configChanged('subtitle_type', value === 'custom' ? undefined : value);
        }}
      >
        <option value="custom" ?selected=${type === 'custom'}>${this._t('subtitle_type_custom')}</option>
        ${INFO_OPTIONS.filter((option) => option !== 'none').map((option) => html`<option value=${option} ?selected=${option === type}>${labels[option]}</option>`)}
      </select>
      ${type === 'custom'
        ? html`<input id="subtitle" type="text" class="native-input" placeholder=${this._t('subtitle_placeholder')} .value=${config.subtitle || ''} @input=${(ev: InputEvent) => this._configChanged('subtitle', (ev.target as HTMLInputElement).value)} />`
        : html`<span class="native-select-label">${this._t('subtitle_computed_hint')}</span>`}
    `;
  }

  private _renderAction(key: ActionKey, title: string, fallback: string): TemplateResult {
    return html`
      <div class="action-item">
        <span class="action-title">${title}</span>
        <hui-action-editor
          .hass=${this.hass}
          .config=${actionConfigFor(this._config, key, fallback)}
          .actions=${EDITOR_ACTIONS}
          .configValue=${key}
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged(key, ev.detail.value)}
        ></hui-action-editor>
      </div>
    `;
  }

  private _renderActionsSection(): TemplateResult {
    return html`
      <div class="editor-section">
        <div class="section-header">${this._ts('section_actions')}</div>
        ${this._renderAction('tap_action', this._ts('action_tap'), 'toggle')} ${this._renderAction('hold_action', this._ts('action_hold'), 'more-info')}
        ${this._renderAction('double_tap_action', this._ts('action_double_tap'), 'none')}
      </div>
    `;
  }
}
