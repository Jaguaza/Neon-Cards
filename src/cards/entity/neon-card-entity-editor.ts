import type { HomeAssistant } from '../../ha/types';
import { DEFAULT_PALETTE } from './constants';
import type {
  ActionConfig,
  HaEntityPickerElement,
  HaTextFieldElement,
  HuiActionEditorElement,
  NeonCardEntityConfig,
  ValueChangedEvent,
} from './types';

const ALLOWED_ACTIONS = ['more-info', 'toggle', 'navigate', 'url', 'call-service', 'assist', 'none'];

export class NeonCardEntityEditor extends HTMLElement {
  private _config?: NeonCardEntityConfig;
  private _hass?: HomeAssistant;
  private _built = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config: NeonCardEntityConfig): void {
    this._config = config;
    if (this._built) {
      this._updateFields();
    } else {
      this._render();
    }
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    if (this._built) {
      this._updateFields();
    } else {
      this._render();
    }
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

  private _render(): void {
    if (!this._hass || !this._config) return;
    this._built = true;
    this.shadowRoot!.innerHTML = `
      <style>
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
          display: none;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 6px;
        }
        .color-picker-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        input[type="color"] {
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
      </style>
      <div class="editor-container">
        <div class="mushroom-section">
          <div class="section-header">Configuración Principal</div>
          <ha-entity-picker id="entity" label="Entidad (Requerida)" allow-custom-entity></ha-entity-picker>
          <ha-textfield id="name" label="Nombre personalizado (Opcional)"></ha-textfield>
        </div>
        <div class="mushroom-section">
          <div class="section-header">Paleta del Aro Neón (3 Colores)</div>
          <label class="native-select-label" for="palette">Estilo de degradado</label>
          <select id="palette" class="native-select">
            <option value="emerald">Cyber Emerald (Verde / Turquesa / Azul)</option>
            <option value="cyberpunk">Cyberpunk Pink (Rosa / Carmesí / Púrpura)</option>
            <option value="electric">Electric Blue (Cian / Azul / Oscuro)</option>
            <option value="sunset">Sunset Amber (Naranja / Amarillo / Rosa)</option>
            <option value="toxic">Toxic Purple (Violeta / Púrpura / Azul)</option>
            <option value="custom">Personalizado (Elegir 3 colores)</option>
          </select>
          <div class="custom-colors-grid" id="custom-colors-grid">
            <div class="color-picker-wrapper">
              <span>Inicio (0%)</span>
              <input type="color" id="c1">
            </div>
            <div class="color-picker-wrapper">
              <span>Medio (50%)</span>
              <input type="color" id="c2">
            </div>
            <div class="color-picker-wrapper">
              <span>Fin (100%)</span>
              <input type="color" id="c3">
            </div>
          </div>
        </div>
        <div class="mushroom-section">
          <div class="section-header">Acciones al pulsar</div>
          <div class="action-item">
            <span class="action-title">1 Toque (Tap)</span>
            <hui-action-editor id="tap-editor"></hui-action-editor>
          </div>
          <div class="action-item">
            <span class="action-title">Mantener pulsado (Hold)</span>
            <hui-action-editor id="hold-editor"></hui-action-editor>
          </div>
          <div class="action-item">
            <span class="action-title">Doble toque (Double Tap)</span>
            <hui-action-editor id="double-tap-editor"></hui-action-editor>
          </div>
        </div>
      </div>
    `;
    this._attachListeners();
    this._updateFields();
  }

  private _attachListeners(): void {
    const entityPicker = this.shadowRoot!.getElementById('entity') as HaEntityPickerElement;
    const nameField = this.shadowRoot!.getElementById('name') as HaTextFieldElement;
    const paletteSelect = this.shadowRoot!.getElementById('palette') as HTMLSelectElement;
    const c1 = this.shadowRoot!.getElementById('c1') as HTMLInputElement;
    const c2 = this.shadowRoot!.getElementById('c2') as HTMLInputElement;
    const c3 = this.shadowRoot!.getElementById('c3') as HTMLInputElement;

    entityPicker.addEventListener('value-changed', (ev) =>
      this._configChanged('entity', (ev as ValueChangedEvent).detail.value)
    );
    nameField.addEventListener('input', (ev) =>
      this._configChanged('name', (ev.target as HTMLInputElement).value)
    );

    paletteSelect.addEventListener('change', (ev) => {
      const selectedValue = (ev.target as HTMLSelectElement).value;
      if (!selectedValue || selectedValue === (this._config?.neon_palette || DEFAULT_PALETTE)) return;
      this._configChanged('neon_palette', selectedValue);
    });

    c1.addEventListener('input', (ev) => this._configChanged('neon_color1', (ev.target as HTMLInputElement).value));
    c2.addEventListener('input', (ev) => this._configChanged('neon_color2', (ev.target as HTMLInputElement).value));
    c3.addEventListener('input', (ev) => this._configChanged('neon_color3', (ev.target as HTMLInputElement).value));

    const actionKeys: Array<{ id: string; key: 'tap_action' | 'hold_action' | 'double_tap_action' }> = [
      { id: 'tap-editor', key: 'tap_action' },
      { id: 'hold-editor', key: 'hold_action' },
      { id: 'double-tap-editor', key: 'double_tap_action' },
    ];
    actionKeys.forEach(({ id, key }) => {
      const elem = this.shadowRoot!.getElementById(id) as HuiActionEditorElement;
      elem.addEventListener('value-changed', (ev) =>
        this._configChanged(key, (ev as ValueChangedEvent).detail.value)
      );
    });
  }

  private _updateFields(): void {
    if (!this._built || !this._hass || !this._config) return;
    const currentPalette = this._config.neon_palette || DEFAULT_PALETTE;
    const isCustom = currentPalette === 'custom';

    const entityPicker = this.shadowRoot!.getElementById('entity') as HaEntityPickerElement;
    const nameField = this.shadowRoot!.getElementById('name') as HaTextFieldElement;
    const paletteSelect = this.shadowRoot!.getElementById('palette') as HTMLSelectElement;
    const customGrid = this.shadowRoot!.getElementById('custom-colors-grid') as HTMLElement;
    const c1 = this.shadowRoot!.getElementById('c1') as HTMLInputElement;
    const c2 = this.shadowRoot!.getElementById('c2') as HTMLInputElement;
    const c3 = this.shadowRoot!.getElementById('c3') as HTMLInputElement;

    entityPicker.hass = this._hass;
    if (entityPicker.value !== (this._config.entity || '')) {
      entityPicker.value = this._config.entity || '';
    }
    if (nameField.value !== (this._config.name || '')) {
      nameField.value = this._config.name || '';
    }
    if (paletteSelect.value !== currentPalette) {
      paletteSelect.value = currentPalette;
    }
    customGrid.style.display = isCustom ? 'grid' : 'none';
    c1.value = this._config.neon_color1 || '#39e07a';
    c2.value = this._config.neon_color2 || '#2dd6b8';
    c3.value = this._config.neon_color3 || '#1ecdf2';

    const actionEditors: Array<{ elem: HuiActionEditorElement; key: string; defaultVal: string }> = [
      {
        elem: this.shadowRoot!.getElementById('tap-editor') as HuiActionEditorElement,
        key: 'tap_action',
        defaultVal: 'more-info',
      },
      {
        elem: this.shadowRoot!.getElementById('hold-editor') as HuiActionEditorElement,
        key: 'hold_action',
        defaultVal: 'none',
      },
      {
        elem: this.shadowRoot!.getElementById('double-tap-editor') as HuiActionEditorElement,
        key: 'double_tap_action',
        defaultVal: 'none',
      },
    ];
    actionEditors.forEach(({ elem, key, defaultVal }) => {
      elem.hass = this._hass;
      elem.config = (this._config![key] as ActionConfig) || { action: defaultVal };
      elem.actions = ALLOWED_ACTIONS;
      elem.configValue = key;
    });
  }
}
