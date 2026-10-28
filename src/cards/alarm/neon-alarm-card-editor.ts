import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { EDITOR_ACTIONS } from '../../ha/types';
import type { ActionConfig, HomeAssistant, ValueChangedEvent } from '../../ha/types';
import { DEFAULT_PALETTE, getPaletteName, getPaletteCustomLabel, SHARED_TRANSLATIONS, NEON_EDITOR_FORM_STYLES } from '../../shared';
import type { SharedTranslations } from '../../shared';
import { getInfoLabels, localize } from '../../core';
import { FOOTER_MAX, SECURITY_SENSOR_TYPES } from './constants';
import { DEFAULT_ALARM_SIZE, ALARM_SIZES, resolveAlarmSize } from './alarm-size';
import { allSensorsOfType, normalizeExcluded, normalizeFooterTypes } from './alarm-sensors';
import { NEON_ALARM_EDITOR_STYLES } from './neon-alarm-card-editor.styles';
import { ALARM_TRANSLATIONS } from './translations';
import type { AlarmTranslations } from './translations';
import type { AlarmSize, AlarmSubtitleType, NeonAlarmCardConfig } from './types';

/** Orden de las opciones del selector de subtítulo; 'none' es el valor por defecto (el estado ya va arriba a la derecha). */
const SUBTITLE_TYPES: readonly AlarmSubtitleType[] = ['none', 'state', 'custom', 'last-changed', 'last-updated'];

const PALETTES = ['emerald', 'cyberpunk', 'electric', 'sunset', 'toxic'];

export class NeonAlarmCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: NeonAlarmCardConfig;

  static styles = [NEON_EDITOR_FORM_STYLES, NEON_ALARM_EDITOR_STYLES];

  setConfig(config: NeonAlarmCardConfig): void {
    this._config = config;
  }

  private _configChanged(key: string, value: unknown): void {
    if (!this._config) return;
    const newConfig: NeonAlarmCardConfig = { ...this._config };
    if (value === '' || value === undefined) delete newConfig[key];
    else newConfig[key] = value;
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: newConfig }, bubbles: true, composed: true }));
  }

  private _actionFor(key: 'tap_action' | 'hold_action' | 'double_tap_action', defaultAction: string): ActionConfig {
    return (this._config?.[key] as ActionConfig | undefined) || { action: defaultAction };
  }

  private _t(key: keyof AlarmTranslations): string {
    return localize(this.hass, ALARM_TRANSLATIONS, key);
  }

  /** Claves de src/shared/translations (paleta y acciones, compartidas con otras tarjetas). */
  private _ts(key: keyof SharedTranslations): string {
    return localize(this.hass, SHARED_TRANSLATIONS, key);
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <div class="editor-container">
        ${this._renderMainSection()} ${this._renderBehaviorSection()} ${this._renderSensorsSection()} ${this._renderHaloSection()} ${this._renderActionsSection()}
      </div>
    `;
  }

  private _renderMainSection(): TemplateResult {
    const config = this._config!;
    const size = resolveAlarmSize(config);
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_main')}</div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.entity || ''}
          .includeDomains=${['alarm_control_panel']}
          label=${this._t('entity_label')}
          allow-custom-entity
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged('entity', ev.detail.value)}
        ></ha-entity-picker>
        <label class="native-select-label" for="name">${this._t('name_label')}</label>
        <input id="name" type="text" class="native-input" .value=${config.name || ''} @input=${(ev: InputEvent) => this._configChanged('name', (ev.target as HTMLInputElement).value)} />
        <label class="native-select-label" for="size">${this._t('size_label')}</label>
        <select
          id="size"
          class="native-select"
          .value=${size}
          @change=${(ev: Event) => {
            const value = (ev.target as HTMLSelectElement).value as AlarmSize;
            if (!value || value === resolveAlarmSize(this._config)) return;
            this._configChanged('size', value === DEFAULT_ALARM_SIZE ? undefined : value);
          }}
        >
          ${ALARM_SIZES.map((opt) => html`<option value=${opt} ?selected=${opt === size}>${this._t(`size_${opt}`)}</option>`)}
        </select>
        ${size === 'large' ? this._renderSubtitleFields() : nothing}
      </div>
    `;
  }

  /** Subtítulo (solo en la tarjeta grande: la mediana y la compacta no lo llevan). */
  private _renderSubtitleFields(): TemplateResult {
    const config = this._config!;
    const current: AlarmSubtitleType = config.subtitle_type || 'none';
    const labels = getInfoLabels(this.hass);
    return html`
      <label class="native-select-label" for="subtitle-type">${this._t('subtitle_label')}</label>
      <select
        id="subtitle-type"
        class="native-select"
        .value=${current}
        @change=${(ev: Event) => {
          const value = (ev.target as HTMLSelectElement).value;
          if (!value || value === (this._config?.subtitle_type || 'none')) return;
          this._configChanged('subtitle_type', value === 'none' ? undefined : value);
        }}
      >
        ${SUBTITLE_TYPES.map((opt) => html`<option value=${opt} ?selected=${opt === current}>${opt === 'custom' ? this._t('subtitle_type_custom') : labels[opt as keyof typeof labels]}</option>`)}
      </select>
      ${current === 'custom'
        ? html`<input id="subtitle" type="text" class="native-input" placeholder=${this._t('subtitle_placeholder')} .value=${config.subtitle || ''} @input=${(ev: InputEvent) => this._configChanged('subtitle', (ev.target as HTMLInputElement).value)} />`
        : nothing}
    `;
  }

  private _renderBehaviorSection(): TemplateResult {
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_behavior')}</div>
        <ha-formfield label=${this._t('confirmation_label')}>
          <ha-switch .checked=${this._config?.confirmation === true} @change=${(ev: Event) => this._configChanged('confirmation', (ev.target as HTMLInputElement).checked ? true : undefined)}></ha-switch>
        </ha-formfield>
        <span class="data-hint">${this._t('confirmation_hint')}</span>
      </div>
    `;
  }

  /** Pie: un selector de tipo de sensor por hueco (hasta tres en la grande, dos en la mediana, ninguno en la compacta). */
  private _renderSensorsSection(): TemplateResult {
    const size = resolveAlarmSize(this._config);
    const hint = size === 'compact' ? 'sensors_hint_compact' : size === 'medium' ? 'sensors_hint_medium' : 'sensors_hint';
    const slots = Array.from({ length: FOOTER_MAX[size] }, (_, index) => this._renderSensorSlot(index));
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_sensors')}</div>
        <span class="data-hint">${this._t(hint)}</span>
        ${slots}
        ${size === 'compact' ? nothing : this._renderOnlyActive()}
      </div>
    `;
  }

  /** Check «mostrar solo los sensores activos» (desactivado por defecto). */
  private _renderOnlyActive(): TemplateResult {
    return html`
      <ha-formfield label=${this._t('only_active_label')}>
        <ha-checkbox .checked=${this._config?.footer_only_active === true} @change=${(ev: Event) => this._configChanged('footer_only_active', (ev.target as HTMLInputElement).checked ? true : undefined)}></ha-checkbox>
      </ha-formfield>
      <span class="data-hint">${this._t('only_active_hint')}</span>
    `;
  }

  private _renderSensorSlot(index: number): TemplateResult {
    const current = normalizeFooterTypes(this._config?.footer_sensors, 'large')[index] ?? '';
    const known = SECURITY_SENSOR_TYPES.includes(current) || current === '';
    return html`
      <div class="sensor-slot">
        <label class="native-select-label" for=${`sensor-${index}`}>${`${this._t('sensor_slot_label')} ${index + 1}`}</label>
        <select id=${`sensor-${index}`} class="native-select" .value=${current} @change=${(ev: Event) => this._setSensorSlot(index, (ev.target as HTMLSelectElement).value)}>
          <option value="" ?selected=${current === ''}>${this._t('sensor_slot_none')}</option>
          ${known ? nothing : html`<option value=${current} selected>${current}</option>`}
          ${SECURITY_SENSOR_TYPES.map((type) => html`<option value=${type} ?selected=${type === current}>${this._t(`sensor_type_${type}` as keyof AlarmTranslations)}</option>`)}
        </select>
        ${current === '' ? nothing : this._renderSensorChecks(current)}
      </div>
    `;
  }

  /**
   * Los sensores de Home Assistant de este tipo, cada uno con un check: los
   * marcados NO los muestra la tarjeta. Plegado para no alargar el editor.
   */
  private _renderSensorChecks(type: string): TemplateResult {
    const sensors = allSensorsOfType(this.hass, type);
    const excluded = normalizeExcluded(this._config?.footer_excluded);
    const rows = sensors.map(
      (sensor) => html`
        <ha-formfield label=${sensor.name}>
          <ha-checkbox data-entity=${sensor.entityId} .checked=${excluded.includes(sensor.entityId)} @change=${(ev: Event) => this._setExcluded(sensor.entityId, (ev.target as HTMLInputElement).checked)}></ha-checkbox>
        </ha-formfield>
      `
    );
    return html`
      <details class="sensor-checks">
        <summary>${`${this._t('excluded_summary')} (${sensors.length})`}</summary>
        ${sensors.length ? html`<span class="data-hint">${this._t('excluded_hint')}</span><div class="sensor-checks-list">${rows}</div>` : html`<span class="data-hint">${this._t('excluded_none')}</span>`}
      </details>
    `;
  }

  /** Añade o quita una entidad de `footer_excluded`; sin ninguna se quita la clave. */
  private _setExcluded(entityId: string, excluded: boolean): void {
    const current = normalizeExcluded(this._config?.footer_excluded).filter((id) => id !== entityId);
    const next = excluded ? [...current, entityId] : current;
    this._configChanged('footer_excluded', next.length ? next : undefined);
  }

  /** Escribe el tipo de un hueco; los huecos vacíos se compactan y, sin ninguno, se quita la clave. */
  private _setSensorSlot(index: number, value: string): void {
    const slots = [...normalizeFooterTypes(this._config?.footer_sensors, 'large')];
    while (slots.length <= index) slots.push('');
    slots[index] = value;
    const next = normalizeFooterTypes(slots, 'large');
    this._configChanged('footer_sensors', next.length ? next : undefined);
  }

  private _renderHaloSection(): TemplateResult {
    const config = this._config!;
    const currentPalette = config.neon_palette || DEFAULT_PALETTE;
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
          ${PALETTES.map((id) => html`<option value=${id} ?selected=${id === currentPalette}>${getPaletteName(this.hass, id)}</option>`)}
          <option value="custom" ?selected=${currentPalette === 'custom'}>${getPaletteCustomLabel(this.hass)}</option>
        </select>
        ${currentPalette === 'custom' ? this._renderCustomColors(config) : nothing}
      </div>
    `;
  }

  private _renderCustomColors(config: NeonAlarmCardConfig): TemplateResult {
    return html`
      <div class="custom-colors-grid">
        ${this._renderColorPicker('color_start', 'neon_color1', config.neon_color1 || '#39e07a')} ${this._renderColorPicker('color_middle', 'neon_color2', config.neon_color2 || '#2dd6b8')}
        ${this._renderColorPicker('color_end', 'neon_color3', config.neon_color3 || '#1ecdf2')}
      </div>
    `;
  }

  private _renderColorPicker(labelKey: 'color_start' | 'color_middle' | 'color_end', configKey: 'neon_color1' | 'neon_color2' | 'neon_color3', value: string): TemplateResult {
    return html`
      <div class="color-picker-wrapper">
        <span>${this._ts(labelKey)}</span>
        <input type="color" .value=${value} @input=${(ev: Event) => this._configChanged(configKey, (ev.target as HTMLInputElement).value)} />
      </div>
    `;
  }

  private _renderActionsSection(): TemplateResult {
    return html`
      <div class="editor-section">
        <div class="section-header">${this._ts('section_actions')}</div>
        ${this._renderActionEditor('action_tap', 'tap_action', 'toggle')} ${this._renderActionEditor('action_hold', 'hold_action', 'more-info')}
        ${this._renderActionEditor('action_double_tap', 'double_tap_action', 'none')}
      </div>
    `;
  }

  private _renderActionEditor(titleKey: 'action_tap' | 'action_hold' | 'action_double_tap', configKey: 'tap_action' | 'hold_action' | 'double_tap_action', defaultAction: string): TemplateResult {
    return html`
      <div class="action-item">
        <span class="action-title">${this._ts(titleKey)}</span>
        <hui-action-editor
          .hass=${this.hass}
          .config=${this._actionFor(configKey, defaultAction)}
          .actions=${EDITOR_ACTIONS}
          .configValue=${configKey}
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged(configKey, ev.detail.value)}
        ></hui-action-editor>
      </div>
    `;
  }
}
