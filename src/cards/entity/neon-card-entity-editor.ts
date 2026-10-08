import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import { INFO_OPTIONS, getInfoLabels, localize } from '../../core';
import { DEFAULT_PALETTE, getPaletteName, getPaletteCustomLabel, SHARED_TRANSLATIONS, NEON_EDITOR_FORM_STYLES } from '../../shared';
import type { SharedTranslations } from '../../shared';
import type { ValueChangedEvent } from '../../ha/types';
import type { ActionConfig, NeonCardEntityConfig } from './types';
import { ENTITY_TRANSLATIONS } from './translations';
import type { EntityTranslations } from './translations';

const ALLOWED_ACTIONS = ['more-info', 'toggle', 'navigate', 'url', 'call-service', 'assist', 'none'];

export class NeonCardEntityEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: NeonCardEntityConfig;

  static styles = [
    NEON_EDITOR_FORM_STYLES,
    css`
      .two-col-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 6px;
      }
      .field-col {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      ha-formfield {
        display: flex;
      }
    `,
  ];

  setConfig(config: NeonCardEntityConfig): void {
    this._config = config;
  }

  private _configChanged(key: string, value: unknown): void {
    if (!this._config) return;
    const newConfig: NeonCardEntityConfig = { ...this._config };
    if (value === '') delete newConfig[key];
    else newConfig[key] = value;
    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private _actionFor(key: 'tap_action' | 'hold_action' | 'double_tap_action', defaultAction: string): ActionConfig {
    return this._config?.[key] as ActionConfig | undefined || { action: defaultAction };
  }

  private _t(key: keyof EntityTranslations): string {
    return localize(this.hass, ENTITY_TRANSLATIONS, key);
  }

  /** Igual que _t(), pero para claves de src/shared/translations —
      contenido genuinamente compartido con Button (paleta, acciones),
      no propio de Entity. Ver el porqué en
      src/shared/translations/types.ts. */
  private _ts(key: keyof SharedTranslations): string {
    return localize(this.hass, SHARED_TRANSLATIONS, key);
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;

    return html`
      <div class="editor-container">
        ${this._renderMainSection()} ${this._renderAppearanceSection()} ${this._renderActionsSection()}
      </div>
    `;
  }

  private _renderMainSection(): TemplateResult {
    const config = this._config!;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_main')}</div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.entity || ''}
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
      </div>
    `;
  }

  private _renderAppearanceSection(): TemplateResult {
    const config = this._config!;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_appearance')}</div>
        ${this._renderPaletteFields(config)} ${this._renderInfoSelectors(config)}
        <ha-formfield label=${this._t('show_status_dot_label')}>
          <ha-switch
            .checked=${config.show_status_dot ?? true}
            @change=${(ev: Event) => this._configChanged('show_status_dot', (ev.target as HTMLInputElement).checked)}
          ></ha-switch>
        </ha-formfield>
        <label class="native-select-label" for="orientation">${this._t('orientation_label')}</label>
        <select
          id="orientation"
          class="native-select"
          @change=${(ev: Event) => this._configChanged('card_orientation', (ev.target as HTMLSelectElement).value)}
        >
          <option value="left" ?selected=${(config.card_orientation ?? 'left') === 'left'}>${this._t('orientation_left')}</option>
          <option value="right" ?selected=${config.card_orientation === 'right'}>${this._t('orientation_right')}</option>
        </select>
      </div>
    `;
  }

  private _renderPaletteFields(config: NeonCardEntityConfig): TemplateResult {
    const currentPalette = config.neon_palette || DEFAULT_PALETTE;
    return html`
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
        <option value="emerald">${getPaletteName(this.hass, 'emerald')}</option>
        <option value="cyberpunk">${getPaletteName(this.hass, 'cyberpunk')}</option>
        <option value="electric">${getPaletteName(this.hass, 'electric')}</option>
        <option value="sunset">${getPaletteName(this.hass, 'sunset')}</option>
        <option value="toxic">${getPaletteName(this.hass, 'toxic')}</option>
        <option value="custom">${getPaletteCustomLabel(this.hass)}</option>
      </select>
      ${currentPalette === 'custom' ? this._renderCustomColors(config) : nothing}
    `;
  }

  private _renderCustomColors(config: NeonCardEntityConfig): TemplateResult {
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
        <input
          type="color"
          .value=${value}
          @input=${(ev: Event) => this._configChanged(configKey, (ev.target as HTMLInputElement).value)}
        />
      </div>
    `;
  }

  private _renderInfoSelectors(config: NeonCardEntityConfig): TemplateResult {
    return html`
      <div class="two-col-grid">
        ${this._renderInfoSelect('primary-info', 'primary_info_label', 'primary_info', config.primary_info || 'name')}
        ${this._renderInfoSelect('secondary-info', 'secondary_info_label', 'secondary_info', config.secondary_info || 'none')}
      </div>
    `;
  }

  private _renderInfoSelect(
    id: string,
    labelKey: 'primary_info_label' | 'secondary_info_label',
    configKey: 'primary_info' | 'secondary_info',
    current: string
  ): TemplateResult {
    return html`
      <div class="field-col">
        <label class="native-select-label" for=${id}>${this._t(labelKey)}</label>
        <select
          id=${id}
          class="native-select"
          @change=${(ev: Event) => this._configChanged(configKey, (ev.target as HTMLSelectElement).value)}
        >
          ${INFO_OPTIONS.map(
            (opt) => html`<option value=${opt} ?selected=${opt === current}>${getInfoLabels(this.hass)[opt]}</option>`
          )}
        </select>
      </div>
    `;
  }

  private _renderActionsSection(): TemplateResult {
    return html`
      <div class="editor-section">
        <div class="section-header">${this._ts('section_actions')}</div>
        ${this._renderActionEditor('tap_action', 'action_tap', 'more-info')}
        ${this._renderActionEditor('hold_action', 'action_hold', 'none')}
        ${this._renderActionEditor('double_tap_action', 'action_double_tap', 'none')}
      </div>
    `;
  }

  private _renderActionEditor(
    key: 'tap_action' | 'hold_action' | 'double_tap_action',
    titleKey: 'action_tap' | 'action_hold' | 'action_double_tap',
    defaultAction: string
  ): TemplateResult {
    return html`
      <div class="action-item">
        <span class="action-title">${this._ts(titleKey)}</span>
        <hui-action-editor
          .hass=${this.hass}
          .config=${this._actionFor(key, defaultAction)}
          .actions=${ALLOWED_ACTIONS}
          .configValue=${key}
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged(key, ev.detail.value)}
        ></hui-action-editor>
      </div>
    `;
  }
}
