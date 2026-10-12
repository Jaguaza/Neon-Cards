import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { ActionConfig, HomeAssistant, ValueChangedEvent } from '../../ha/types';
import { DEFAULT_PALETTE, getPaletteName, getPaletteCustomLabel, SHARED_TRANSLATIONS, NEON_EDITOR_FORM_STYLES } from '../../shared';
import type { SharedTranslations } from '../../shared';
import { getInfoLabels, localize } from '../../core';
import { LOCK_TRANSLATIONS } from './translations';
import type { LockTranslations } from './translations';
import type { LockSubtitleType, NeonLockCardConfig } from './types';

const ALLOWED_ACTIONS = ['more-info', 'toggle', 'navigate', 'url', 'call-service', 'assist', 'none'];

/** Orden de las opciones del selector de subtítulo; 'state' es el valor por defecto. */
const SUBTITLE_TYPES: readonly LockSubtitleType[] = ['state', 'custom', 'last-changed', 'last-updated', 'none'];

export class NeonLockCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: NeonLockCardConfig;

  static styles = [NEON_EDITOR_FORM_STYLES];

  setConfig(config: NeonLockCardConfig): void {
    this._config = config;
  }

  private _configChanged(key: string, value: unknown): void {
    if (!this._config) return;
    const newConfig: NeonLockCardConfig = { ...this._config };
    if (value === '' || value === undefined) delete newConfig[key];
    else newConfig[key] = value;
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: newConfig }, bubbles: true, composed: true }));
  }

  private _actionFor(key: 'tap_action' | 'hold_action' | 'double_tap_action', defaultAction: string): ActionConfig {
    return (this._config?.[key] as ActionConfig | undefined) || { action: defaultAction };
  }

  private _t(key: keyof LockTranslations): string {
    return localize(this.hass, LOCK_TRANSLATIONS, key);
  }

  /** Claves de src/shared/translations (paleta y acciones, compartidas con otras tarjetas). */
  private _ts(key: keyof SharedTranslations): string {
    return localize(this.hass, SHARED_TRANSLATIONS, key);
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <div class="editor-container">
        ${this._renderMainSection()} ${this._renderHaloSection()} ${this._renderActionsSection()}
      </div>
    `;
  }

  private _renderMainSection(): TemplateResult {
    const config = this._config!;
    const current: LockSubtitleType = config.subtitle_type || 'state';
    const labels = getInfoLabels(this.hass);
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_main')}</div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.entity || ''}
          .includeDomains=${['lock']}
          label=${this._t('entity_label')}
          allow-custom-entity
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged('entity', ev.detail.value)}
        ></ha-entity-picker>
        <label class="native-select-label" for="name">${this._t('name_label')}</label>
        <input
          id="name"
          type="text"
          class="native-input"
          .value=${config.name || ''}
          @input=${(ev: InputEvent) => this._configChanged('name', (ev.target as HTMLInputElement).value)}
        />
        <label class="native-select-label" for="subtitle-type">${this._t('subtitle_label')}</label>
        <select
          id="subtitle-type"
          class="native-select"
          .value=${current}
          @change=${(ev: Event) => {
            const value = (ev.target as HTMLSelectElement).value;
            if (!value || value === (this._config?.subtitle_type || 'state')) return;
            this._configChanged('subtitle_type', value === 'state' ? undefined : value);
          }}
        >
          ${SUBTITLE_TYPES.map(
            (opt) => html`<option value=${opt} ?selected=${opt === current}>${opt === 'custom' ? this._t('subtitle_type_custom') : labels[opt as keyof typeof labels]}</option>`
          )}
        </select>
        ${current === 'custom'
          ? html`
              <input
                id="subtitle"
                type="text"
                class="native-input"
                placeholder=${this._t('subtitle_placeholder')}
                .value=${config.subtitle || ''}
                @input=${(ev: InputEvent) => this._configChanged('subtitle', (ev.target as HTMLInputElement).value)}
              />
            `
          : nothing}
      </div>
    `;
  }

  private _renderHaloSection(): TemplateResult {
    const config = this._config!;
    const currentPalette = config.neon_palette || DEFAULT_PALETTE;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_halo')}</div>
        <label class="native-select-label" for="palette">${this._t('palette_label')}</label>
        <select
          id="palette"
          class="native-select"
          .value=${currentPalette}
          @change=${(ev: Event) => {
            const value = (ev.target as HTMLSelectElement).value;
            if (!value || value === currentPalette) return;
            this._configChanged('neon_palette', value);
          }}
        >
          ${['emerald', 'cyberpunk', 'electric', 'sunset', 'toxic'].map(
            (id) => html`<option value=${id} ?selected=${id === currentPalette}>${getPaletteName(this.hass, id)}</option>`
          )}
          <option value="custom" ?selected=${currentPalette === 'custom'}>${getPaletteCustomLabel(this.hass)}</option>
        </select>
        ${currentPalette === 'custom' ? this._renderCustomColors(config) : nothing}
      </div>
    `;
  }

  private _renderCustomColors(config: NeonLockCardConfig): TemplateResult {
    return html`
      <div class="custom-colors-grid">
        ${this._renderColorPicker('color_start', 'neon_color1', config.neon_color1 || '#39e07a')}
        ${this._renderColorPicker('color_middle', 'neon_color2', config.neon_color2 || '#2dd6b8')}
        ${this._renderColorPicker('color_end', 'neon_color3', config.neon_color3 || '#1ecdf2')}
      </div>
    `;
  }

  private _renderColorPicker(
    labelKey: 'color_start' | 'color_middle' | 'color_end',
    configKey: 'neon_color1' | 'neon_color2' | 'neon_color3',
    value: string
  ): TemplateResult {
    return html`
      <div class="color-picker-wrapper">
        <span>${this._ts(labelKey)}</span>
        <input type="color" .value=${value} @input=${(ev: Event) => this._configChanged(configKey, (ev.target as HTMLInputElement).value)} />
      </div>
    `;
  }

  private _renderActionsSection(): TemplateResult {
    return html`
      <div class="editor-section">
        <div class="section-header">${this._ts('section_actions')}</div>
        ${this._renderActionEditor('action_tap', 'tap_action', 'toggle')}
        ${this._renderActionEditor('action_hold', 'hold_action', 'more-info')}
        ${this._renderActionEditor('action_double_tap', 'double_tap_action', 'none')}
      </div>
    `;
  }

  private _renderActionEditor(
    titleKey: 'action_tap' | 'action_hold' | 'action_double_tap',
    configKey: 'tap_action' | 'hold_action' | 'double_tap_action',
    defaultAction: string
  ): TemplateResult {
    return html`
      <div class="action-item">
        <span class="action-title">${this._ts(titleKey)}</span>
        <hui-action-editor
          .hass=${this.hass}
          .config=${this._actionFor(configKey, defaultAction)}
          .actions=${ALLOWED_ACTIONS}
          .configValue=${configKey}
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged(configKey, ev.detail.value)}
        ></hui-action-editor>
      </div>
    `;
  }
}
