import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import { DEFAULT_PALETTE } from '../../shared';
import { INFO_OPTIONS, INFO_LABELS } from '../../core';
import { MAX_GROUPED_SENSORS } from './constants';
import type { ValueChangedEvent } from '../../ha/types';
import type { SensorItemConfig, NeonButtonCardConfig } from './types';
import type { ActionConfig } from '../../ha/types';
import { NEON_BUTTON_CARD_EDITOR_STYLES } from './neon-button-card-editor.styles';

const ALLOWED_ACTIONS = ['more-info', 'toggle', 'navigate', 'url', 'call-service', 'assist', 'none'];

export class NeonButtonCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: NeonButtonCardConfig;

  static styles = NEON_BUTTON_CARD_EDITOR_STYLES;

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
        <div class="section-header">Configuración Principal</div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.entity || ''}
          label="Entidad (Opcional)"
          allow-custom-entity
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged('entity', ev.detail.value)}
        ></ha-entity-picker>
        <label class="native-select-label" for="name">Nombre</label>
        <input
          id="name"
          type="text"
          class="native-input"
          .value=${config.name || ''}
          @input=${(ev: InputEvent) => this._configChanged('name', (ev.target as HTMLInputElement).value)}
        />
        <label class="native-select-label" for="subtitle-type">Subtítulo</label>
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
          <option value="custom" ?selected=${(config.subtitle_type || 'custom') === 'custom'}>Personalizado</option>
          ${INFO_OPTIONS.filter((opt) => opt !== 'none').map(
            (opt) => html`<option value=${opt} ?selected=${opt === config.subtitle_type}>${INFO_LABELS[opt]}</option>`
          )}
        </select>
        ${(config.subtitle_type || 'custom') === 'custom'
          ? html`
              <input
                id="subtitle"
                type="text"
                class="native-input"
                placeholder="Texto libre"
                .value=${config.subtitle || ''}
                @input=${(ev: InputEvent) => this._configChanged('subtitle', (ev.target as HTMLInputElement).value)}
              />
            `
          : html`<span class="native-select-label">Se calcula a partir de la entidad — requiere que "Entidad" esté configurada.</span>`}
        <label class="native-select-label" for="icon">Icono (mdi:...)</label>
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
        <div class="section-header">Apariencia del halo</div>
        <label class="native-select-label" for="palette">Paleta del halo (estado activo)</label>
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
          <option value="emerald">Cyber Emerald (Verde / Turquesa / Azul)</option>
          <option value="cyberpunk">Cyberpunk Pink (Rosa / Carmesí / Púrpura)</option>
          <option value="electric">Electric Blue (Cian / Azul / Oscuro)</option>
          <option value="sunset">Sunset Amber (Naranja / Amarillo / Rosa)</option>
          <option value="toxic">Toxic Purple (Violeta / Púrpura / Azul)</option>
          <option value="custom">Personalizado (Elegir 3 colores)</option>
        </select>
        ${isCustom
          ? html`
              <div class="custom-colors-grid">
                <div class="color-picker-wrapper">
                  <span>Inicio (0%)</span>
                  <input
                    type="color"
                    .value=${config.neon_color1 || '#39e07a'}
                    @input=${(ev: Event) => this._configChanged('neon_color1', (ev.target as HTMLInputElement).value)}
                  />
                </div>
                <div class="color-picker-wrapper">
                  <span>Medio (50%)</span>
                  <input
                    type="color"
                    .value=${config.neon_color2 || '#2dd6b8'}
                    @input=${(ev: Event) => this._configChanged('neon_color2', (ev.target as HTMLInputElement).value)}
                  />
                </div>
                <div class="color-picker-wrapper">
                  <span>Fin (100%)</span>
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
        <div class="section-header">Sensor suelto (opcional, encima del divisor)</div>
        <div class="sensor-card">
          <ha-entity-picker
            .hass=${this.hass}
            .value=${config.top_sensor?.entity || ''}
            .includeDomains=${['sensor', 'binary_sensor']}
            label="Sensor destacado"
            allow-custom-entity
            @value-changed=${(ev: ValueChangedEvent) => this._topSensorChanged(ev.detail.value)}
          ></ha-entity-picker>
          ${config.top_sensor
            ? html`
                <div class="sensor-extra-fields">
                  <div class="field">
                    <label class="field-label" for="top-sensor-icon">Icono (vacío = automático)</label>
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
                    <label class="field-label" for="top-sensor-decimals">Nº decimales</label>
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
        <div class="section-header">Sensores agrupados (máx. ${MAX_GROUPED_SENSORS}, con separador)</div>
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
                <button class="remove-sensor" @click=${() => this._removeSensor(i)} title="Quitar sensor">✕</button>
              </div>
              <div class="sensor-extra-fields">
                <div class="field">
                  <label class="field-label" for="sensor-icon-${i}">Icono (vacío = automático)</label>
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
                  <label class="field-label" for="sensor-decimals-${i}">Nº decimales</label>
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
          ? html`<button class="add-sensor" @click=${() => this._addSensor()}>+ Añadir sensor</button>`
          : html`<span class="native-select-label">Máximo de ${MAX_GROUPED_SENSORS} sensores para mantenerlo legible.</span>`}
      </div>
    `;
  }

  private _renderActionsSection(): TemplateResult {
    return html`
      <div class="editor-section">
        <div class="section-header">Acciones al pulsar</div>
        <div class="action-item">
          <span class="action-title">1 Toque (Tap)</span>
          <hui-action-editor
            .hass=${this.hass}
            .config=${this._actionFor('tap_action', 'more-info')}
            .actions=${ALLOWED_ACTIONS}
            .configValue=${'tap_action'}
            @value-changed=${(ev: ValueChangedEvent) => this._configChanged('tap_action', ev.detail.value)}
          ></hui-action-editor>
        </div>
        <div class="action-item">
          <span class="action-title">Mantener pulsado (Hold)</span>
          <hui-action-editor
            .hass=${this.hass}
            .config=${this._actionFor('hold_action', 'none')}
            .actions=${ALLOWED_ACTIONS}
            .configValue=${'hold_action'}
            @value-changed=${(ev: ValueChangedEvent) => this._configChanged('hold_action', ev.detail.value)}
          ></hui-action-editor>
        </div>
        <div class="action-item">
          <span class="action-title">Doble toque (Double Tap)</span>
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
