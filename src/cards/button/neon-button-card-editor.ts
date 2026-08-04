import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import { DEFAULT_PALETTE } from '../../shared';
import { MAX_GROUPED_SENSORS } from './constants';
import type { SensorItemConfig, ValueChangedEvent, NeonButtonCardConfig } from './types';
import type { ActionConfig } from '../../ha/types';

const ALLOWED_ACTIONS = ['more-info', 'toggle', 'navigate', 'url', 'call-service', 'assist', 'none'];

export class NeonButtonCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: NeonButtonCardConfig;

  static styles = css`
    .editor-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 4px 0;
    }
    .editor-section {
      background: var(--card-background-color, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .section-header {
      font-weight: 600;
      font-size: 14px;
      color: var(--primary-text-color);
      margin-bottom: 2px;
    }
    .action-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: rgba(0, 0, 0, 0.15);
      padding: 12px;
      border-radius: 8px;
      border-left: 3px solid #39e07a;
    }
    .action-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color);
    }
    .custom-colors-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 6px;
    }
    .native-select-label {
      font-size: 12px;
      color: var(--secondary-text-color);
      display: block;
    }
    .native-select {
      width: 100%;
      height: 40px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.2));
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e5e5e5);
      padding: 0 10px;
      font-size: 14px;
      cursor: pointer;
    }
    .native-input {
      width: 100%;
      height: 40px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.2));
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color, #e5e5e5);
      padding: 0 10px;
      font-size: 14px;
      box-sizing: border-box;
      font-family: inherit;
    }
    .color-picker-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    input[type='color'] {
      border: none;
      width: 100%;
      height: 38px;
      border-radius: 6px;
      cursor: pointer;
      background: transparent;
    }
    .sensor-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sensor-row ha-entity-picker {
      flex: 1;
    }
    .remove-sensor {
      background: none;
      border: none;
      color: var(--secondary-text-color);
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
    }
    .add-sensor {
      align-self: flex-start;
      background: none;
      border: 1px dashed var(--divider-color, rgba(255, 255, 255, 0.3));
      color: var(--primary-text-color);
      border-radius: 8px;
      padding: 8px 14px;
      cursor: pointer;
      font-size: 13px;
    }
  `;

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

  private _sensorChanged(index: number, entity: string): void {
    if (!this._config) return;
    const sensors = this._sensors.map((s, i) => (i === index ? { entity } : s));
    this._emit({ ...this._config, sensors });
  }

  private _topSensorChanged(entity: string): void {
    if (!this._config) return;
    const newConfig: NeonButtonCardConfig = { ...this._config };
    if (!entity) delete newConfig.top_sensor;
    else newConfig.top_sensor = { entity };
    this._emit(newConfig);
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;

    const currentPalette = this._config.neon_palette || DEFAULT_PALETTE;
    const isCustom = currentPalette === 'custom';

    return html`
      <div class="editor-container">
        <div class="editor-section">
          <div class="section-header">Configuración Principal</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.entity || ''}
            label="Entidad (Opcional)"
            allow-custom-entity
            @value-changed=${(ev: ValueChangedEvent) => this._configChanged('entity', ev.detail.value)}
          ></ha-entity-picker>
          <label class="native-select-label" for="name">Nombre</label>
          <input
            id="name"
            type="text"
            class="native-input"
            .value=${this._config.name || ''}
            @input=${(ev: InputEvent) => this._configChanged('name', (ev.target as HTMLInputElement).value)}
          />
          <label class="native-select-label" for="subtitle">Subtítulo</label>
          <input
            id="subtitle"
            type="text"
            class="native-input"
            .value=${this._config.subtitle || ''}
            @input=${(ev: InputEvent) => this._configChanged('subtitle', (ev.target as HTMLInputElement).value)}
          />
          <label class="native-select-label" for="icon">Icono (mdi:...)</label>
          <input
            id="icon"
            type="text"
            class="native-input"
            placeholder="mdi:sofa"
            .value=${this._config.icon || ''}
            @input=${(ev: InputEvent) => this._configChanged('icon', (ev.target as HTMLInputElement).value)}
          />
        </div>

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
                      .value=${this._config.neon_color1 || '#39e07a'}
                      @input=${(ev: Event) => this._configChanged('neon_color1', (ev.target as HTMLInputElement).value)}
                    />
                  </div>
                  <div class="color-picker-wrapper">
                    <span>Medio (50%)</span>
                    <input
                      type="color"
                      .value=${this._config.neon_color2 || '#2dd6b8'}
                      @input=${(ev: Event) => this._configChanged('neon_color2', (ev.target as HTMLInputElement).value)}
                    />
                  </div>
                  <div class="color-picker-wrapper">
                    <span>Fin (100%)</span>
                    <input
                      type="color"
                      .value=${this._config.neon_color3 || '#1ecdf2'}
                      @input=${(ev: Event) => this._configChanged('neon_color3', (ev.target as HTMLInputElement).value)}
                    />
                  </div>
                </div>
              `
            : nothing}
        </div>

        <div class="editor-section">
          <div class="section-header">Sensor suelto (opcional, encima del divisor)</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.top_sensor?.entity || ''}
            .includeDomains=${['sensor', 'binary_sensor']}
            label="Sensor destacado"
            allow-custom-entity
            @value-changed=${(ev: ValueChangedEvent) => this._topSensorChanged(ev.detail.value)}
          ></ha-entity-picker>
        </div>

        <div class="editor-section">
          <div class="section-header">Sensores agrupados (máx. ${MAX_GROUPED_SENSORS}, con separador)</div>
          ${this._sensors.map(
            (s, i) => html`
              <div class="sensor-row">
                <ha-entity-picker
                  .hass=${this.hass}
                  .value=${s.entity}
                  .includeDomains=${['sensor', 'binary_sensor']}
                  allow-custom-entity
                  @value-changed=${(ev: ValueChangedEvent) => this._sensorChanged(i, ev.detail.value)}
                ></ha-entity-picker>
                <button class="remove-sensor" @click=${() => this._removeSensor(i)} title="Quitar sensor">✕</button>
              </div>
            `
          )}
          ${this._sensors.length < MAX_GROUPED_SENSORS
            ? html`<button class="add-sensor" @click=${() => this._addSensor()}>+ Añadir sensor</button>`
            : html`<span class="native-select-label">Máximo de ${MAX_GROUPED_SENSORS} sensores para mantenerlo legible.</span>`}
        </div>

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
      </div>
    `;
  }
}
