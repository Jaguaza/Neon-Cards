import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import { INFO_OPTIONS, INFO_LABELS } from '../../core';
import { DEFAULT_PALETTE } from './constants';
import type { ActionConfig, NeonCardEntityConfig, ValueChangedEvent } from './types';

const ALLOWED_ACTIONS = ['more-info', 'toggle', 'navigate', 'url', 'call-service', 'assist', 'none'];

export class NeonCardEntityEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: NeonCardEntityConfig;

  static styles = css`
    .editor-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 4px 0;
    }
    .mushroom-section {
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
    ha-formfield {
      display: flex;
    }
  `;

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

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;

    const currentPalette = this._config.neon_palette || DEFAULT_PALETTE;
    const isCustom = currentPalette === 'custom';

    return html`
      <div class="editor-container">
        <div class="mushroom-section">
          <div class="section-header">Configuración Principal</div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.entity || ''}
            label="Entidad (Requerida)"
            allow-custom-entity
            @value-changed=${(ev: ValueChangedEvent) => this._configChanged('entity', ev.detail.value)}
          ></ha-entity-picker>
          <ha-textfield
            .value=${this._config.name || ''}
            label="Nombre personalizado (Opcional)"
            @input=${(ev: InputEvent) => this._configChanged('name', (ev.target as HTMLInputElement).value)}
          ></ha-textfield>
        </div>
        <div class="mushroom-section">
          <div class="section-header">Apariencia</div>
          <label class="native-select-label" for="palette">Estilo de degradado del aro</label>
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
          <div class="two-col-grid">
            <div class="field-col">
              <label class="native-select-label" for="primary-info">Información primaria</label>
              <select
                id="primary-info"
                class="native-select"
                @change=${(ev: Event) => this._configChanged('primary_info', (ev.target as HTMLSelectElement).value)}
              >
                ${INFO_OPTIONS.map(
                  (opt) =>
                    html`<option value=${opt} ?selected=${opt === (this._config!.primary_info || 'name')}>${INFO_LABELS[opt]}</option>`
                )}
              </select>
            </div>
            <div class="field-col">
              <label class="native-select-label" for="secondary-info">Información secundaria</label>
              <select
                id="secondary-info"
                class="native-select"
                @change=${(ev: Event) => this._configChanged('secondary_info', (ev.target as HTMLSelectElement).value)}
              >
                ${INFO_OPTIONS.map(
                  (opt) =>
                    html`<option value=${opt} ?selected=${opt === (this._config!.secondary_info || 'none')}>${INFO_LABELS[opt]}</option>`
                )}
              </select>
            </div>
          </div>
          <ha-formfield label="Mostrar punto de estado">
            <ha-switch
              .checked=${this._config.show_status_dot ?? true}
              @change=${(ev: Event) => this._configChanged('show_status_dot', (ev.target as HTMLInputElement).checked)}
            ></ha-switch>
          </ha-formfield>
          <label class="native-select-label" for="orientation">Orientación de la Tarjeta</label>
          <select
            id="orientation"
            class="native-select"
            @change=${(ev: Event) => this._configChanged('card_orientation', (ev.target as HTMLSelectElement).value)}
          >
            <option value="left" ?selected=${(this._config.card_orientation ?? 'left') === 'left'}>Vista izquierda</option>
            <option value="right" ?selected=${this._config.card_orientation === 'right'}>Vista derecha</option>
          </select>
        </div>
        <div class="mushroom-section">
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
