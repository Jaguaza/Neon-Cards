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
import { DEFAULT_GRAPH_HOURS, DEFAULT_SINGLE_COLOR, DEFAULT_THRESHOLD_COLORS } from './constants';
import { ALLOWED_DOMAINS } from './sensor-state';
import { SENSOR_TRANSLATIONS } from './translations';
import type { SensorTranslations } from './translations';
import { resolveEffect } from './sensor-colors';
import { hasGraph, resolveSize } from './sensor-size';
import type { NeonEffect, NeonSensorCardConfig, ThresholdLevel, ThresholdNames, SensorSize } from './types';

const ALLOWED_ACTIONS = ['more-info', 'toggle', 'navigate', 'url', 'call-service', 'assist', 'none'];
const PALETTES = ['emerald', 'cyberpunk', 'electric', 'sunset', 'toxic'];
const SIZES: Array<[SensorSize, keyof SensorTranslations]> = [
  ['large', 'size_large'],
  ['normal', 'size_normal'],
  ['compact', 'size_compact'],
];
const EFFECTS: Array<[NeonEffect, keyof SensorTranslations]> = [
  ['normal', 'effect_normal'],
  ['halo', 'effect_halo'],
  ['single', 'effect_single'],
];
const LEVEL_LABELS: Array<[ThresholdLevel, keyof SensorTranslations]> = [
  ['low', 'level_low'],
  ['ok', 'level_ok'],
  ['high', 'level_high'],
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

  /** Se guarda tal cual (sin recortar) para no comerse los espacios mientras
      se escribe; la tarjeta recorta al mostrarlo. Vacío = vuelve al texto
      por defecto y, si no queda ninguno, se elimina la clave. */
  private _thresholdNameChanged(level: ThresholdLevel, value: string): void {
    if (!this._config) return;
    const next: ThresholdNames = { ...this._config.threshold_names, [level]: value };
    if (value === '') delete next[level];
    this._configChanged('threshold_names', Object.keys(next).length ? next : undefined);
  }

  private _thresholdColorChanged(level: ThresholdLevel, value: string): void {
    if (!this._config) return;
    this._configChanged('threshold_colors', { ...this._config.threshold_colors, [level]: value });
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
        <label class="native-select-label">
          <input
            type="checkbox"
            id="show-subtitle"
            .checked=${config.show_subtitle !== false}
            @change=${(ev: Event) => this._configChanged('show_subtitle', (ev.target as HTMLInputElement).checked ? undefined : false)}
          />
          ${this._t('show_subtitle_label')}
        </label>
        ${config.show_subtitle === false
          ? nothing
          : this._textField('subtitle', this._t('subtitle_label'), 'subtitle', config.subtitle || '')}
        <ha-icon-picker
          .hass=${this.hass}
          .value=${config.icon || ''}
          label=${this._t('icon_label')}
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged('icon', ev.detail.value)}
        ></ha-icon-picker>
        ${
          // El tamaño pequeño siempre muestra un decimal (xx.x): sin opción.
          resolveSize(config) === 'compact'
            ? nothing
            : this._numberField('decimals', this._t('decimals_label'), 'decimals', config.decimals, 0, 4)
        }
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

  private _renderThresholdColors(config: NeonSensorCardConfig, levels: ThresholdLevel[]): TemplateResult {
    return html`
      <div class="custom-colors-grid">
        ${LEVEL_LABELS.filter(([level]) => levels.includes(level)).map(([level, labelKey]) =>
          this._colorPicker(this._t(labelKey), config.threshold_colors?.[level] || DEFAULT_THRESHOLD_COLORS[level], (v) =>
            this._thresholdColorChanged(level, v)
          )
        )}
      </div>
    `;
  }

  private _renderThresholdNames(config: NeonSensorCardConfig, levels: ThresholdLevel[], isBinary: boolean): TemplateResult {
    const defaults: Record<ThresholdLevel, keyof SensorTranslations> = {
      low: 'status_low',
      ok: 'status_ok',
      high: isBinary ? 'status_alert' : 'status_high',
    };
    return html`${LEVEL_LABELS.filter(([level]) => levels.includes(level)).map(
      ([level, labelKey]) => html`
        <label class="native-select-label" for=${`th-name-${level}`}>${this._t('name_label')} · ${this._t(labelKey)}</label>
        <input
          id=${`th-name-${level}`}
          type="text"
          class="native-input"
          placeholder=${this._t(defaults[level])}
          .value=${config.threshold_names?.[level] ?? ''}
          @input=${(ev: InputEvent) => this._thresholdNameChanged(level, (ev.target as HTMLInputElement).value)}
        />
      `
    )}`;
  }

  private _renderAppearance(config: NeonSensorCardConfig): TemplateResult {
    const effect = resolveEffect(config);
    const size = resolveSize(config);
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_appearance')}</div>
        <label class="native-select-label" for="size">${this._t('size_label')}</label>
        <select
          id="size"
          class="native-select"
          .value=${size}
          @change=${(ev: Event) => {
            const value = (ev.target as HTMLSelectElement).value;
            this._configChanged('size', value === 'normal' ? undefined : value);
          }}
        >
          ${SIZES.map(([id, key]) => html`<option value=${id} ?selected=${id === size}>${this._t(key)}</option>`)}
        </select>
        ${hasGraph(size)
          ? this._numberField('graph-hours', this._t('graph_hours_label'), 'graph_hours', config.graph_hours ?? DEFAULT_GRAPH_HOURS, 1, 168)
          : nothing}
        <label class="native-select-label" for="effect">${this._t('effect_label')}</label>
        <select
          id="effect"
          class="native-select"
          .value=${effect}
          @change=${(ev: Event) => {
            const value = (ev.target as HTMLSelectElement).value;
            this._configChanged('neon_effect', value === 'halo' ? undefined : value);
          }}
        >
          ${EFFECTS.map(([id, key]) => html`<option value=${id} ?selected=${id === effect}>${this._t(key)}</option>`)}
        </select>
        ${effect === 'halo' ? this._renderPalette(config) : nothing}
        ${effect === 'single'
          ? html`<div class="custom-colors-grid">
              ${this._colorPicker(this._t('single_color_label'), config.neon_color || DEFAULT_SINGLE_COLOR, (v) =>
                this._configChanged('neon_color', v)
              )}
            </div>`
          : nothing}
      </div>
    `;
  }

  private _renderThresholds(config: NeonSensorCardConfig): TemplateResult {
    const isBinary = (config.entity ?? '').startsWith('binary_sensor.');
    const enabled = config.thresholds_enabled === true;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_thresholds')}</div>
        <label class="native-select-label">
          <input
            type="checkbox"
            .checked=${enabled}
            @change=${(ev: Event) => this._configChanged('thresholds_enabled', (ev.target as HTMLInputElement).checked ? true : undefined)}
          />
          ${this._t('thresholds_enable_label')}
        </label>
        ${enabled
          ? isBinary
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
                ${this._renderThresholdColors(config, ['ok', 'high'])}
                ${this._renderThresholdNames(config, ['ok', 'high'], true)}
              `
            : html`
                ${this._numberField('th-low', this._t('threshold_low_label'), 'threshold_low', config.threshold_low)}
                ${this._numberField('th-high', this._t('threshold_high_label'), 'threshold_high', config.threshold_high)}
                ${this._renderThresholdColors(config, ['low', 'ok', 'high'])}
                ${this._renderThresholdNames(config, ['low', 'ok', 'high'], false)}
              `
          : nothing}
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
