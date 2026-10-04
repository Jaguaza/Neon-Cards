import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant, ValueChangedEvent } from '../../ha/types';
import { getClimateState } from '../../ha/climate';
import type { HvacMode } from '../../ha/climate';
import { localize } from '../../core';
import {
  NEON_EDITOR_FORM_STYLES,
  DEFAULT_PALETTE,
  getPaletteName,
  getPaletteCustomLabel,
  SHARED_TRANSLATIONS,
} from '../../shared';
import type { SharedTranslations } from '../../shared';
import { DEFAULT_SIZE, HVAC_MODE_ICONS, HVAC_MODE_DEFAULT_COLORS, HVAC_MODE_LABEL_KEYS, MAX_FOOTER_SENSORS } from './constants';
import { THERMOSTAT_TRANSLATIONS } from './translations';
import type { ThermostatTranslations } from './translations';
import type { FooterSensorConfig, NeonThermostatCardConfig, ThermostatSize } from './types';

export class NeonThermostatCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: NeonThermostatCardConfig;

  static styles = [
    NEON_EDITOR_FORM_STYLES,
    css`
      .sensor-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      /* Fix del desbordamiento reportado: sin min-width:0 en un hijo
       flex, el picker se queda con su ancho intrínseco (el del texto
       largo de la entidad) y desborda fuera de la tarjeta del editor
       en vez de encogerse — bug clásico de flexbox. */
      .sensor-row ha-entity-picker {
        flex: 1;
        min-width: 0;
      }
      .sensor-card {
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: rgba(0, 0, 0, 0.15);
        padding: 10px;
        border-radius: 8px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .field-label {
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      .remove-sensor {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        font-size: 14px;
        padding: 4px 8px;
      }
      .add-sensor {
        align-self: flex-start;
        background: none;
        border: 1px dashed var(--divider-color, rgba(255, 255, 255, 0.3));
        border-radius: 8px;
        color: var(--secondary-text-color);
        cursor: pointer;
        font-size: 13px;
        padding: 8px 12px;
      }
      .hint {
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      /* Cuadrícula de 2 columnas (el número de filas sale solo según
       cuántos modos soporte la entidad) — antes cada modo era una fila
       suelta con el input type=color estirado a todo el ancho (regla
       compartida width:100%), quedando barras de color enormes y mucho
       hueco desaprovechado. */
      .mode-colors-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-top: 6px;
      }
      .mode-color-cell {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      .mode-color-cell-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .mode-color-cell-label ha-icon {
        --mdc-icon-size: 16px;
        flex-shrink: 0;
      }
      .native-select-label ha-icon {
        --mdc-icon-size: 14px;
        vertical-align: middle;
        margin-right: 4px;
      }
    `,
  ];

  setConfig(config: NeonThermostatCardConfig): void {
    this._config = config;
  }

  private _t(key: keyof ThermostatTranslations): string {
    return localize(this.hass, THERMOSTAT_TRANSLATIONS, key);
  }

  /** Igual que _t(), pero para claves de src/shared/translations —
      textos de la paleta neón compartidos por todo el paquete. */
  private _ts(key: keyof SharedTranslations): string {
    return localize(this.hass, SHARED_TRANSLATIONS, key);
  }

  private _modeLabel(mode: HvacMode): string {
    return this._t(HVAC_MODE_LABEL_KEYS[mode]);
  }

  private _emit(config: NeonThermostatCardConfig): void {
    this._config = config;
    const event = new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private _configChanged(key: string, value: unknown): void {
    if (!this._config) return;
    const newConfig: NeonThermostatCardConfig = { ...this._config };
    if (value === '' || value === undefined) delete newConfig[key];
    else newConfig[key] = value;
    this._emit(newConfig);
  }

  /** Modos que las entidades configuradas soportan de verdad — unión de
      ambas si hay `entity_2`. "off" se excluye aparte: siempre usa el
      neutro del tema en tiempo real, así que un swatch para él no
      tendría ningún efecto. */
  private get _supportedModes(): HvacMode[] {
    if (!this._config?.entity || !this.hass) return [];
    const modes = new Set<HvacMode>();
    for (const mode of getClimateState(this._config.entity, this.hass)?.hvacModes ?? []) modes.add(mode);
    if (this._config.entity_2) {
      for (const mode of getClimateState(this._config.entity_2, this.hass)?.hvacModes ?? []) modes.add(mode);
    }
    modes.delete('off');
    return Array.from(modes);
  }

  /** Modos que soportan LAS DOS entidades a la vez — solo estos tienen
      sentido en el selector de "quién manda" (`mode_owner`). */
  private get _sharedModes(): HvacMode[] {
    if (!this._config?.entity || !this._config?.entity_2 || !this.hass) return [];
    const first = getClimateState(this._config.entity, this.hass)?.hvacModes ?? [];
    const second = new Set(getClimateState(this._config.entity_2, this.hass)?.hvacModes ?? []);
    return first.filter((mode) => mode !== 'off' && second.has(mode));
  }

  private _modeOwnerFor(mode: HvacMode): 1 | 2 {
    return this._config?.mode_owner?.[mode] ?? 1;
  }

  private _setModeOwner(mode: HvacMode, owner: 1 | 2): void {
    if (!this._config) return;
    const modeOwner = { ...(this._config.mode_owner ?? {}), [mode]: owner };
    this._emit({ ...this._config, mode_owner: modeOwner });
  }

  private _colorForMode(mode: HvacMode): string {
    const color = this._config?.color;
    return color && typeof color === 'object' && color.mode === 'custom' && color[mode]
      ? (color[mode] as string)
      : HVAC_MODE_DEFAULT_COLORS[mode];
  }

  private _setModeColor(mode: HvacMode, value: string): void {
    if (!this._config) return;
    const current = this._config.color;
    const base = current && typeof current === 'object' && current.mode === 'custom' ? current : {};
    const color = { ...base, mode: 'custom' as const, [mode]: value };
    this._emit({ ...this._config, color });
  }

  private get _footer(): FooterSensorConfig[] {
    return this._config?.footer ?? [];
  }

  private _addFooterSensor(): void {
    if (!this._config) return;
    if (this._footer.length >= MAX_FOOTER_SENSORS) return;
    this._emit({ ...this._config, footer: [...this._footer, { entity: '' }] });
  }

  private _removeFooterSensor(index: number): void {
    if (!this._config) return;
    this._emit({ ...this._config, footer: this._footer.filter((_, i) => i !== index) });
  }

  private _footerEntityChanged(index: number, value: string): void {
    if (!this._config) return;
    const footer = this._footer.map((item, i) => (i === index ? { ...item, entity: value } : item));
    this._emit({ ...this._config, footer });
  }

  private _footerIconChanged(index: number, value: string): void {
    if (!this._config) return;
    const footer = this._footer.map((item, i) => (i === index ? { ...item, icon: value || undefined } : item));
    this._emit({ ...this._config, footer });
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const size: ThermostatSize = this._config.size ?? DEFAULT_SIZE;

    return html`
      <div class="editor-container">
        ${this._renderMainSection()} ${this._renderAppearanceSection(size)} ${this._renderHaloSection()}
        ${this._renderModeColorsSection()} ${this._renderModeOwnerSection()}
        ${size !== 'compact' ? this._renderFooterSection() : nothing}
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
          .includeDomains=${['climate']}
          label=${this._t('entity_label')}
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged('entity', ev.detail.value)}
        ></ha-entity-picker>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.entity_2 || ''}
          .includeDomains=${['climate']}
          label=${this._t('entity_2_label')}
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged('entity_2', ev.detail.value)}
        ></ha-entity-picker>
        <span class="hint">${this._t('entity_2_hint')}</span>
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

  private _renderAppearanceSection(size: ThermostatSize): TemplateResult {
    const config = this._config!;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_appearance')}</div>
        <label class="native-select-label" for="size">${this._t('size_label')}</label>
        <select
          id="size"
          class="native-select"
          .value=${size}
          @change=${(ev: Event) => this._configChanged('size', (ev.target as HTMLSelectElement).value)}
        >
          <option value="large">${this._t('size_large')}</option>
          <option value="normal">${this._t('size_normal')}</option>
          <option value="compact">${this._t('size_compact')}</option>
        </select>

        <label class="native-select-label" for="step">${this._t('step_label')}</label>
        <input
          id="step"
          type="number"
          step="0.1"
          min="0.1"
          class="native-input"
          placeholder="0.5"
          .value=${config.step?.toString() || ''}
          @input=${(ev: InputEvent) => {
            const raw = (ev.target as HTMLInputElement).value;
            this._configChanged('step', raw === '' ? undefined : Number(raw));
          }}
        />
        <span class="hint">${this._t('step_auto_hint')}</span>
      </div>
    `;
  }

  private _renderHaloSection(): TemplateResult {
    const config = this._config!;
    const currentPalette = config.neon_palette || DEFAULT_PALETTE;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_halo')}</div>
        <span class="hint">${this._t('halo_hint')}</span>
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
      </div>
    `;
  }

  private _renderCustomColors(config: NeonThermostatCardConfig): TemplateResult {
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

  private _renderModeColorsSection(): TemplateResult {
    const modes = this._supportedModes;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_colors')}</div>
        ${modes.length
          ? html`
              <span class="hint">${this._t('colors_hint')}</span>
              <div class="mode-colors-grid">
                ${modes.map(
                  (mode) => html`
                    <div class="mode-color-cell">
                      <span class="mode-color-cell-label">
                        <ha-icon icon=${HVAC_MODE_ICONS[mode]}></ha-icon>
                        ${this._modeLabel(mode)}
                      </span>
                      <input
                        type="color"
                        .value=${this._colorForMode(mode)}
                        @input=${(ev: Event) => this._setModeColor(mode, (ev.target as HTMLInputElement).value)}
                      />
                    </div>
                  `
                )}
              </div>
            `
          : html`<span class="hint">${this._t('colors_no_entity_hint')}</span>`}
      </div>
    `;
  }

  private _renderModeOwnerSection(): TemplateResult | typeof nothing {
    const sharedModes = this._sharedModes;
    if (!sharedModes.length) return nothing;
    const config = this._config!;
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_mode_owner')}</div>
        <span class="hint">${this._t('mode_owner_hint')}</span>
        ${sharedModes.map(
          (mode) => html`
            <label class="native-select-label" for="owner-${mode}">
              <ha-icon icon=${HVAC_MODE_ICONS[mode]}></ha-icon>
              ${this._modeLabel(mode)}
            </label>
            <select
              id="owner-${mode}"
              class="native-select"
              .value=${String(this._modeOwnerFor(mode))}
              @change=${(ev: Event) =>
                this._setModeOwner(mode, Number((ev.target as HTMLSelectElement).value) as 1 | 2)}
            >
              <option value="1">${config.entity}</option>
              <option value="2">${config.entity_2}</option>
            </select>
          `
        )}
      </div>
    `;
  }

  private _renderFooterSection(): TemplateResult {
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_footer')}</div>
        ${this._footer.map((item, i) => this._renderFooterSensorCard(item, i))}
        ${this._footer.length < MAX_FOOTER_SENSORS
          ? html`<button class="add-sensor" @click=${() => this._addFooterSensor()}>${this._t('add_sensor_button')}</button>`
          : html`<span class="hint">${this._t('max_sensors_hint').replace('{max}', String(MAX_FOOTER_SENSORS))}</span>`}
      </div>
    `;
  }

  private _renderFooterSensorCard(item: { entity: string; icon?: string }, index: number): TemplateResult {
    return html`
      <div class="sensor-card">
        <div class="sensor-row">
          <ha-entity-picker
            .hass=${this.hass}
            .value=${item.entity}
            .includeDomains=${['sensor', 'binary_sensor']}
            label=${this._t('footer_sensor_label')}
            @value-changed=${(ev: ValueChangedEvent) => this._footerEntityChanged(index, ev.detail.value)}
          ></ha-entity-picker>
          <button class="remove-sensor" title=${this._t('remove_sensor_title')} @click=${() => this._removeFooterSensor(index)}>
            ✕
          </button>
        </div>
        <div class="field">
          <label class="field-label" for="footer-sensor-icon-${index}">${this._t('sensor_icon_label')}</label>
          <ha-icon-picker
            id="footer-sensor-icon-${index}"
            .hass=${this.hass}
            .value=${item.icon || ''}
            @value-changed=${(ev: ValueChangedEvent) => this._footerIconChanged(index, ev.detail.value)}
          ></ha-icon-picker>
        </div>
      </div>
    `;
  }
}
