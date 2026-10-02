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

    const currentPalette = this._config.neon_palette || DEFAULT_PALETTE;
    const isCustom = currentPalette === 'custom';

    return html`
      <div class="editor-container">
        <div class="editor-section">
          <div class="section-header">${this._t('section_main')}</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.entity || ''}
            label=${this._t('entity_label')}
            allow-custom-entity
            @value-changed=${(ev: ValueChangedEvent) => this._configChanged('entity', ev.detail.value)}
          ></ha-entity-picker>
          <label class="native-select-label" for="name">${this._t('name_label')}</label>
          <input
            id="name"
            type="text"
            class="native-input"
            .value=${this._config.name || ''}
            @input=${(ev: InputEvent) => this._configChanged('name', (ev.target as HTMLInputElement).value)}
          />
        </div>
        <div class="editor-section">
          <div class="section-header">${this._t('section_appearance')}</div>
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
          ${isCustom
            ? html`
                <div class="custom-colors-grid">
                  <div class="color-picker-wrapper">
                    <span>${this._ts('color_start')}</span>
                    <input
                      type="color"
                      .value=${this._config.neon_color1 || '#39e07a'}
                      @input=${(ev: Event) => this._configChanged('neon_color1', (ev.target as HTMLInputElement).value)}
                    />
                  </div>
                  <div class="color-picker-wrapper">
                    <span>${this._ts('color_middle')}</span>
                    <input
                      type="color"
                      .value=${this._config.neon_color2 || '#2dd6b8'}
                      @input=${(ev: Event) => this._configChanged('neon_color2', (ev.target as HTMLInputElement).value)}
                    />
                  </div>
                  <div class="color-picker-wrapper">
                    <span>${this._ts('color_end')}</span>
                    <input
                      type="color"
                      .value=${this._config.neon_color3 || '#1ecdf2'}
                      @input=${(ev: Event) => this._configChanged('neon_color3', (ev.target as HTMLInputElement).value)}
                    />
                  </div>
                </div>
              `
            : nothing}
          <div class="two-col-grid">
            <div class="field-col">
              <label class="native-select-label" for="primary-info">${this._t('primary_info_label')}</label>
              <select
                id="primary-info"
                class="native-select"
                @change=${(ev: Event) => this._configChanged('primary_info', (ev.target as HTMLSelectElement).value)}
              >
                ${INFO_OPTIONS.map(
                  (opt) =>
                    html`<option value=${opt} ?selected=${opt === (this._config!.primary_info || 'name')}>${getInfoLabels(this.hass)[opt]}</option>`
                )}
              </select>
            </div>
            <div class="field-col">
              <label class="native-select-label" for="secondary-info">${this._t('secondary_info_label')}</label>
              <select
                id="secondary-info"
                class="native-select"
                @change=${(ev: Event) => this._configChanged('secondary_info', (ev.target as HTMLSelectElement).value)}
              >
                ${INFO_OPTIONS.map(
                  (opt) =>
                    html`<option value=${opt} ?selected=${opt === (this._config!.secondary_info || 'none')}>${getInfoLabels(this.hass)[opt]}</option>`
                )}
              </select>
            </div>
          </div>
          <ha-formfield label=${this._t('show_status_dot_label')}>
            <ha-switch
              .checked=${this._config.show_status_dot ?? true}
              @change=${(ev: Event) => this._configChanged('show_status_dot', (ev.target as HTMLInputElement).checked)}
            ></ha-switch>
          </ha-formfield>
          <label class="native-select-label" for="orientation">${this._t('orientation_label')}</label>
          <select
            id="orientation"
            class="native-select"
            @change=${(ev: Event) => this._configChanged('card_orientation', (ev.target as HTMLSelectElement).value)}
          >
            <option value="left" ?selected=${(this._config.card_orientation ?? 'left') === 'left'}>${this._t('orientation_left')}</option>
            <option value="right" ?selected=${this._config.card_orientation === 'right'}>${this._t('orientation_right')}</option>
          </select>
        </div>
        <div class="editor-section">
          <div class="section-header">${this._ts('section_actions')}</div>
          <div class="action-item">
            <span class="action-title">${this._ts('action_tap')}</span>
            <hui-action-editor
              .hass=${this.hass}
              .config=${this._actionFor('tap_action', 'more-info')}
              .actions=${ALLOWED_ACTIONS}
              .configValue=${'tap_action'}
              @value-changed=${(ev: ValueChangedEvent) => this._configChanged('tap_action', ev.detail.value)}
            ></hui-action-editor>
          </div>
          <div class="action-item">
            <span class="action-title">${this._ts('action_hold')}</span>
            <hui-action-editor
              .hass=${this.hass}
              .config=${this._actionFor('hold_action', 'none')}
              .actions=${ALLOWED_ACTIONS}
              .configValue=${'hold_action'}
              @value-changed=${(ev: ValueChangedEvent) => this._configChanged('hold_action', ev.detail.value)}
            ></hui-action-editor>
          </div>
          <div class="action-item">
            <span class="action-title">${this._ts('action_double_tap')}</span>
            <hui-action-editor
              .hass=${this.hass}
              .config=${this._actionFor('double_tap_action', 'none')}
              .actions=${ALLOWED_ACTIONS}
              .configValue=${'double_tap_action'}
              @value-changed=${(ev: ValueChangedEvent) => this._configChanged('double_tap_action', ev.detail.value)}
            ></hui-action-editor>
          </div>
        </div>
      </div>
    `;
  }
}
