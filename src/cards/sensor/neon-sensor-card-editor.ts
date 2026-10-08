import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { ActionConfig, HomeAssistant, ValueChangedEvent } from '../../ha/types';
import { localize } from '../../core';
import {
  DEFAULT_PALETTE,
  getPaletteName,
  getPaletteCustomLabel,
  SHARED_TRANSLATIONS,
  NEON_EDITOR_FORM_STYLES,
} from '../../shared';
import type { SharedTranslations } from '../../shared';
import { DEFAULT_GRAPH_HOURS, DEFAULT_STATE_COLORS } from './constants';
import { ALLOWED_DOMAINS } from './sensor-state';
import { SENSOR_TRANSLATIONS } from './translations';
import type { SensorTranslations } from './translations';
import type { ColorMode, NeonSensorCardConfig, SensorLevel } from './types';

const ALLOWED_ACTIONS = ['more-info', 'toggle', 'navigate', 'url', 'call-service', 'assist', 'none'];
const PALETTES = ['emerald', 'cyberpunk', 'electric', 'sunset', 'toxic'];
const COLOR_MODES: Array<[ColorMode, keyof SensorTranslations]> = [
  ['single', 'color_mode_single'],
  ['state', 'color_mode_state'],
  ['custom_state', 'color_mode_custom_state'],
];
const STATE_COLOR_LABELS: Array<[SensorLevel, keyof SensorTranslations]> = [
  ['normal', 'color_normal'],
  ['warning', 'color_warning'],
  ['critical', 'color_critical'],
  ['unavailable', 'color_unavailable'],
];
const THRESHOLDS: Array<[string, keyof SensorTranslations]> = [
  ['warning_above', 'warning_above_label'],
  ['warning_below', 'warning_below_label'],
  ['critical_above', 'critical_above_label'],
  ['critical_below', 'critical_below_label'],
];

export class NeonSensorCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: NeonSensorCardConfig;

  static styles = [NEON_EDITOR_FORM_STYLES];

  setConfig(config: NeonSensorCardConfig): void {
    this._config = config;
  }

  private _emit(config: NeonSensorCardConfig): void {
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  }

  private _configChanged(key: string, value: unknown): void {
    if (!this._config) return;
    const next: NeonSensorCardConfig = { ...this._config };
    if (value === '' || value === undefined) delete next[key];
    else next[key] = value;
    this._emit(next);
  }

  private _stateColorChanged(level: SensorLevel, value: string): void {
    if (!this._config) return;
    this._configChanged('state_colors', { ...this._config.state_colors, [level]: value });
  }

  private _t(key: keyof SensorTranslations): string {
    return localize(this.hass, SENSOR_TRANSLATIONS, key);
  }

  private _ts(key: keyof SharedTranslations): string {
    return localize(this.hass, SHARED_TRANSLATIONS, key);
  }

  private _actionFor(key: 'tap_action' | 'hold_action' | 'double_tap_action', fallback: string): ActionConfig {
    return (this._config?.[key] as ActionConfig | undefined) || { action: fallback };
  }

  private _numberField(id: string, label: string, key: string, value: unknown, min?: number, max?: number): TemplateResult {
    return html`
      <label class="native-select-label" for=${id}>${label}</label>
      <input
        id=${id}
        type="number"
        class="native-input"
        min=${min ?? nothing}
        max=${max ?? nothing}
        .value=${value === undefined ? '' : String(value)}
        @input=${(ev: InputEvent) => {
          const raw = (ev.target as HTMLInputElement).value;
          this._configChanged(key, raw === '' ? undefined : Number(raw));
        }}
      />
    `;
  }

  private _textField(id: string, label: string, key: string, value: string): TemplateResult {
    return html`
      <label class="native-select-label" for=${id}>${label}</label>
      <input
        id=${id}
        type="text"
        class="native-input"
        .value=${value}
        @input=${(ev: InputEvent) => this._configChanged(key, (ev.target as HTMLInputElement).value)}
      />
    `;
  }

  private _colorPicker(label: string, value: string, onInput: (v: string) => void): TemplateResult {
    return html`
      <div class="color-picker-wrapper">
        <span>${label}</span>
        <input type="color" .value=${value} @input=${(ev: Event) => onInput((ev.target as HTMLInputElement).value)} />
      </div>
    `;
  }

  private _renderMain(config: NeonSensorCardConfig): TemplateResult {
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_main')}</div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.entity || ''}
          .includeDomains=${ALLOWED_DOMAINS}
          label=${this._t('entity_label')}
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged('entity', ev.detail.value)}
        ></ha-entity-picker>
        ${this._textField('name', this._t('name_label'), 'name', config.name || '')}
        <ha-icon-picker
          .hass=${this.hass}
          .value=${config.icon || ''}
          label=${this._t('icon_label')}
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged('icon', ev.detail.value)}
        ></ha-icon-picker>
        ${this._numberField('decimals', this._t('decimals_label'), 'decimals', config.decimals, 0, 4)}
      </div>
    `;
  }

  private _renderPalette(config: NeonSensorCardConfig): TemplateResult {
    const current = config.neon_palette || DEFAULT_PALETTE;
    return html`
      <select
        id="palette"
        class="native-select"
        .value=${current}
        @change=${(ev: Event) => this._configChanged('neon_palette', (ev.target as HTMLSelectElement).value)}
      >
        ${PALETTES.map((id) => html`<option value=${id} ?selected=${id === current}>${getPaletteName(this.hass, id)}</option>`)}
        <option value="custom" ?selected=${current === 'custom'}>${getPaletteCustomLabel(this.hass)}</option>
      </select>
      ${current === 'custom'
        ? html`<div class="custom-colors-grid">
            ${this._colorPicker(this._ts('color_start'), config.neon_color1 || '#39e07a', (v) => this._configChanged('neon_color1', v))}
            ${this._colorPicker(this._ts('color_middle'), config.neon_color2 || '#2dd6b8', (v) => this._configChanged('neon_color2', v))}
            ${this._colorPicker(this._ts('color_end'), config.neon_color3 || '#1ecdf2', (v) => this._configChanged('neon_color3', v))}
          </div>`
        : nothing}
    `;
  }

  private _renderStateColors(config: NeonSensorCardConfig): TemplateResult {
    return html`
      <div class="custom-colors-grid">
        ${STATE_COLOR_LABELS.map(([level, labelKey]) =>
          this._colorPicker(this._t(labelKey), config.state_colors?.[level] || DEFAULT_STATE_COLORS[level], (v) =>
            this._stateColorChanged(level, v)
          )
        )}
      </div>
    `;
  }

  private _renderAppearance(config: NeonSensorCardConfig): TemplateResult {
    const mode = config.color_mode ?? 'single';
    const graphOn = config.show_graph !== false;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_appearance')}</div>
        <label class="native-select-label">
          <input
            type="checkbox"
            .checked=${graphOn}
            @change=${(ev: Event) => this._configChanged('show_graph', (ev.target as HTMLInputElement).checked ? undefined : false)}
          />
          ${this._t('show_graph_label')}
        </label>
        ${graphOn
          ? this._numberField('graph-hours', this._t('graph_hours_label'), 'graph_hours', config.graph_hours ?? DEFAULT_GRAPH_HOURS, 1, 168)
          : nothing}
        <label class="native-select-label" for="color-mode">${this._t('color_mode_label')}</label>
        <select
          id="color-mode"
          class="native-select"
          .value=${mode}
          @change=${(ev: Event) => {
            const value = (ev.target as HTMLSelectElement).value;
            this._configChanged('color_mode', value === 'single' ? undefined : value);
          }}
        >
          ${COLOR_MODES.map(([id, key]) => html`<option value=${id} ?selected=${id === mode}>${this._t(key)}</option>`)}
        </select>
        ${mode === 'single' ? this._renderPalette(config) : nothing}
        ${mode === 'custom_state' ? this._renderStateColors(config) : nothing}
      </div>
    `;
  }

  private _renderThresholds(config: NeonSensorCardConfig): TemplateResult {
    const isBinary = (config.entity ?? '').startsWith('binary_sensor.');
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_thresholds')}</div>
        ${isBinary
          ? html`
              <label class="native-select-label" for="alert-state">${this._t('alert_state_label')}</label>
              <select
                id="alert-state"
                class="native-select"
                .value=${config.alert_state || ''}
                @change=${(ev: Event) => this._configChanged('alert_state', (ev.target as HTMLSelectElement).value)}
              >
                <option value="" ?selected=${!config.alert_state}>${this._t('alert_state_none')}</option>
                <option value="on" ?selected=${config.alert_state === 'on'}>${this._t('alert_state_on')}</option>
                <option value="off" ?selected=${config.alert_state === 'off'}>${this._t('alert_state_off')}</option>
              </select>
            `
          : THRESHOLDS.map(([key, labelKey]) => this._numberField(`th-${key}`, this._t(labelKey), key, config[key]))}
      </div>
    `;
  }

  private _renderActionItem(key: 'tap_action' | 'hold_action' | 'double_tap_action', title: string, fallback: string): TemplateResult {
    return html`
      <div class="action-item">
        <span class="action-title">${title}</span>
        <hui-action-editor
          .hass=${this.hass}
          .config=${this._actionFor(key, fallback)}
          .actions=${ALLOWED_ACTIONS}
          .configValue=${key}
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged(key, ev.detail.value)}
        ></hui-action-editor>
      </div>
    `;
  }

  private _renderActions(): TemplateResult {
    return html`
      <div class="editor-section">
        <div class="section-header">${this._ts('section_actions')}</div>
        ${this._renderActionItem('tap_action', this._ts('action_tap'), 'more-info')}
        ${this._renderActionItem('hold_action', this._ts('action_hold'), 'none')}
        ${this._renderActionItem('double_tap_action', this._ts('action_double_tap'), 'none')}
      </div>
    `;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const config = this._config;
    return html`
      <div class="editor-container">
        ${this._renderMain(config)} ${this._renderAppearance(config)} ${this._renderThresholds(config)} ${this._renderActions()}
      </div>
    `;
  }
}
