import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import { DEFAULT_PALETTE, getPaletteName, getPaletteCustomLabel, SHARED_TRANSLATIONS, NEON_EDITOR_FORM_STYLES } from '../../shared';
import type { SharedTranslations } from '../../shared';
import { INFO_OPTIONS, getInfoLabels, localize } from '../../core';
import { MAX_GROUPED_SENSORS } from './constants';
import type { ValueChangedEvent } from '../../ha/types';
import type { SensorItemConfig, NeonButtonCardConfig } from './types';
import type { ActionConfig } from '../../ha/types';
import { NEON_BUTTON_CARD_EDITOR_STYLES } from './neon-button-card-editor.styles';
import { BUTTON_TRANSLATIONS } from './translations';
import type { ButtonTranslations } from './translations';

const ALLOWED_ACTIONS = ['more-info', 'toggle', 'navigate', 'url', 'call-service', 'assist', 'none'];

export class NeonButtonCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: NeonButtonCardConfig;

  static styles = [NEON_EDITOR_FORM_STYLES, NEON_BUTTON_CARD_EDITOR_STYLES];

  setConfig(config: NeonButtonCardConfig): void {
    this._config = config;
  }

  private _configChanged(key: string, value: unknown): void {
    if (!this._config) return;
    const newConfig: NeonButtonCardConfig = { ...this._config };
    if (value === '' || value === undefined) delete newConfig[key];
    else newConfig[key] = value;
    this._emit(newConfig);
  }

  private _emit(config: NeonButtonCardConfig): void {
    this._config = config;
    const event = new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private _actionFor(key: 'tap_action' | 'hold_action' | 'double_tap_action', defaultAction: string): ActionConfig {
    return (this._config?.[key] as ActionConfig | undefined) || { action: defaultAction };
  }

  private get _sensors(): SensorItemConfig[] {
    return this._config?.sensors ?? [];
  }

  private _addSensor(): void {
    if (!this._config) return;
    this._emit({ ...this._config, sensors: [...this._sensors, { entity: '' }] });
  }

  private _removeSensor(index: number): void {
    if (!this._config) return;
    const sensors = this._sensors.filter((_, i) => i !== index);
    this._emit({ ...this._config, sensors });
  }

  private _sensorFieldChanged(index: number, field: keyof SensorItemConfig, value: string | number | undefined): void {
    if (!this._config) return;
    const sensors = this._sensors.map((s, i) => {
      if (i !== index) return s;
      const next = { ...s, [field]: value };
      if (value === '' || value === undefined) delete next[field];
      return next;
    });
    this._emit({ ...this._config, sensors });
  }

  private _topSensorChanged(entity: string): void {
    if (!this._config) return;
    const newConfig: NeonButtonCardConfig = { ...this._config };
    if (!entity) delete newConfig.top_sensor;
    else newConfig.top_sensor = { ...newConfig.top_sensor, entity };
    this._emit(newConfig);
  }

  private _t(key: keyof ButtonTranslations): string {
    return localize(this.hass, BUTTON_TRANSLATIONS, key);
  }

  /** Igual que _t(), pero para claves de src/shared/translations —
      contenido genuinamente compartido con otras tarjetas (paleta,
      acciones), no propio de Button. Ver el porqué en
      src/shared/translations/types.ts. */
  private _ts(key: keyof SharedTranslations): string {
    return localize(this.hass, SHARED_TRANSLATIONS, key);
  }

  private _topSensorFieldChanged(field: 'icon' | 'decimals', value: string | number | undefined): void {
    if (!this._config?.top_sensor) return;
    const next = { ...this._config.top_sensor, [field]: value };
    if (value === '' || value === undefined) delete next[field];
    this._emit({ ...this._config, top_sensor: next });
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;

    return html`
      <div class="editor-container">
        ${this._renderMainSection()}
        ${this._renderHaloSection()}
        ${this._renderTopSensorSection()}
        ${this._renderGroupedSensorsSection()}
        ${this._renderActionsSection()}
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
        <label class="native-select-label" for="subtitle-type">${this._t('subtitle_label')}</label>
        <select
          id="subtitle-type"
          class="native-select"
          .value=${config.subtitle_type || 'custom'}
          @change=${(ev: Event) => {
            const value = (ev.target as HTMLSelectElement).value;
            if (!value || value === (this._config?.subtitle_type || 'custom')) return;
            this._configChanged('subtitle_type', value === 'custom' ? undefined : value);
          }}
        >
          <option value="custom" ?selected=${(config.subtitle_type || 'custom') === 'custom'}>${this._t('subtitle_type_custom')}</option>
          ${INFO_OPTIONS.filter((opt) => opt !== 'none').map(
            (opt) => html`<option value=${opt} ?selected=${opt === config.subtitle_type}>${getInfoLabels(this.hass)[opt]}</option>`
          )}
        </select>
        ${(config.subtitle_type || 'custom') === 'custom'
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
          : html`<span class="native-select-label">${this._t('subtitle_computed_hint')}</span>`}
        <label class="native-select-label" for="icon">${this._t('icon_label')}</label>
        <input
          id="icon"
          type="text"
          class="native-input"
          placeholder="mdi:sofa"
          .value=${config.icon || ''}
          @input=${(ev: InputEvent) => this._configChanged('icon', (ev.target as HTMLInputElement).value)}
        />
      </div>
    `;
  }

  private _renderHaloSection(): TemplateResult {
    const config = this._config!;
    const currentPalette = config.neon_palette || DEFAULT_PALETTE;
    const isCustom = currentPalette === 'custom';
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
                    .value=${config.neon_color1 || '#39e07a'}
                    @input=${(ev: Event) => this._configChanged('neon_color1', (ev.target as HTMLInputElement).value)}
                  />
                </div>
                <div class="color-picker-wrapper">
                  <span>${this._ts('color_middle')}</span>
                  <input
                    type="color"
                    .value=${config.neon_color2 || '#2dd6b8'}
                    @input=${(ev: Event) => this._configChanged('neon_color2', (ev.target as HTMLInputElement).value)}
                  />
                </div>
                <div class="color-picker-wrapper">
                  <span>${this._ts('color_end')}</span>
                  <input
                    type="color"
                    .value=${config.neon_color3 || '#1ecdf2'}
                    @input=${(ev: Event) => this._configChanged('neon_color3', (ev.target as HTMLInputElement).value)}
                  />
                </div>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderTopSensorSection(): TemplateResult {
    const config = this._config!;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_top_sensor')}</div>
        <div class="sensor-card">
          <ha-entity-picker
            .hass=${this.hass}
            .value=${config.top_sensor?.entity || ''}
            .includeDomains=${['sensor', 'binary_sensor']}
            label=${this._t('top_sensor_label')}
            allow-custom-entity
            @value-changed=${(ev: ValueChangedEvent) => this._topSensorChanged(ev.detail.value)}
          ></ha-entity-picker>
          ${config.top_sensor
            ? html`
                <div class="sensor-extra-fields">
                  <div class="field">
                    <label class="field-label" for="top-sensor-icon">${this._t('sensor_icon_label')}</label>
                    <input
                      id="top-sensor-icon"
                      type="text"
                      class="native-input"
                      placeholder="mdi:flash"
                      .value=${config.top_sensor.icon || ''}
                      @input=${(ev: InputEvent) => this._topSensorFieldChanged('icon', (ev.target as HTMLInputElement).value)}
                    />
                  </div>
                  <div class="field decimals-field">
                    <label class="field-label" for="top-sensor-decimals">${this._t('sensor_decimals_label')}</label>
                    <input
                      id="top-sensor-decimals"
                      type="number"
                      min="0"
                      max="4"
                      class="native-input"
                      placeholder="1"
                      .value=${config.top_sensor.decimals ?? ''}
                      @input=${(ev: InputEvent) => {
                        const raw = (ev.target as HTMLInputElement).value;
                        this._topSensorFieldChanged('decimals', raw === '' ? undefined : Number(raw));
                      }}
                    />
                  </div>
                </div>
              `
            : nothing}
        </div>
      </div>
    `;
  }

  private _renderGroupedSensorsSection(): TemplateResult {
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_grouped_sensors').replace('{max}', String(MAX_GROUPED_SENSORS))}</div>
        ${this._sensors.map(
          (s, i) => html`
            <div class="sensor-card">
              <div class="sensor-row">
                <ha-entity-picker
                  .hass=${this.hass}
                  .value=${s.entity}
                  .includeDomains=${['sensor', 'binary_sensor']}
                  allow-custom-entity
                  @value-changed=${(ev: ValueChangedEvent) => this._sensorFieldChanged(i, 'entity', ev.detail.value)}
                ></ha-entity-picker>
                <button class="remove-sensor" @click=${() => this._removeSensor(i)} title=${this._t('remove_sensor_title')}>✕</button>
              </div>
              <div class="sensor-extra-fields">
                <div class="field">
                  <label class="field-label" for="sensor-icon-${i}">${this._t('sensor_icon_label')}</label>
                  <input
                    id="sensor-icon-${i}"
                    type="text"
                    class="native-input"
                    placeholder="mdi:thermometer"
                    .value=${s.icon || ''}
                    @input=${(ev: InputEvent) => this._sensorFieldChanged(i, 'icon', (ev.target as HTMLInputElement).value)}
                  />
                </div>
                <div class="field decimals-field">
                  <label class="field-label" for="sensor-decimals-${i}">${this._t('sensor_decimals_label')}</label>
                  <input
                    id="sensor-decimals-${i}"
                    type="number"
                    min="0"
                    max="4"
                    class="native-input"
                    placeholder="1"
                    .value=${s.decimals ?? ''}
                    @input=${(ev: InputEvent) => {
                      const raw = (ev.target as HTMLInputElement).value;
                      this._sensorFieldChanged(i, 'decimals', raw === '' ? undefined : Number(raw));
                    }}
                  />
                </div>
              </div>
            </div>
          `
        )}
        ${this._sensors.length < MAX_GROUPED_SENSORS
          ? html`<button class="add-sensor" @click=${() => this._addSensor()}>${this._t('add_sensor_button')}</button>`
          : html`<span class="native-select-label">${this._t('max_sensors_hint').replace('{max}', String(MAX_GROUPED_SENSORS))}</span>`}
      </div>
    `;
  }

  private _renderActionsSection(): TemplateResult {
    return html`
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
    `;
  }
}
