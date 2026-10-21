import { LitElement, html, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import type { ActionConfig, HomeAssistant, ValueChangedEvent } from '../../ha/types';
import { DEFAULT_PALETTE, getPaletteName, getPaletteCustomLabel, SHARED_TRANSLATIONS, NEON_EDITOR_FORM_STYLES } from '../../shared';
import type { SharedTranslations } from '../../shared';
import { getInfoLabels, localize } from '../../core';
import { LOCK_ICON_TYPES, LOCK_ICONS, resolveLockIconType } from './icons';
import { NEON_LOCK_ICON_STYLES } from './lock-icon.styles';
import { NEON_LOCK_EDITOR_STYLES } from './neon-lock-card-editor.styles';
import { LOCK_TRANSLATIONS } from './translations';
import type { LockTranslations } from './translations';
import { FOOTER_ORDER, footerItemTypes, normalizeFooterItems } from './footer';
import { STATUS_DOT_DEFAULTS } from './constants';
import { isCssColor } from './lock-state';
import type { LockFooterItem, LockSize, LockSubtitleType, NeonLockCardConfig } from './types';
import { DEFAULT_LOCK_SIZE, LOCK_SIZES, resolveLockSize } from './lock-size';

const ALLOWED_ACTIONS = ['more-info', 'toggle', 'navigate', 'url', 'call-service', 'assist', 'none'];

/** Orden de las opciones del selector de subtítulo; 'none' es el valor por defecto (el estado ya va arriba a la derecha). */
const SUBTITLE_TYPES: readonly LockSubtitleType[] = ['none', 'state', 'custom', 'last-changed', 'last-updated'];

/** `#rgb` o `#rrggbb` → `#rrggbb` (lo único que acepta `<input type=color>`); otro formato → `undefined`. */
function toHex6(color: string): string | undefined {
  const value = color.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(value)) return value;
  if (/^#[0-9a-f]{3}$/.test(value)) return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  return undefined;
}

/** Dominios que ofrece el selector de entidad de cada dato del pie. */
const FOOTER_ENTITY_DOMAINS = {
  door: ['binary_sensor'],
  battery: ['sensor'],
  last_user: ['sensor', 'input_text', 'text', 'input_select', 'select'],
} as const;

/** Cómo se dibuja y se configura cada dato del pie en el editor. */
interface FooterRow {
  icon: string;
  entityKey: 'door_entity' | 'battery_entity' | 'last_user_entity';
  domains: readonly string[];
}

const FOOTER_ROWS: Record<LockFooterItem, FooterRow> = {
  battery: { icon: 'mdi:battery', entityKey: 'battery_entity', domains: FOOTER_ENTITY_DOMAINS.battery },
  last_user: { icon: 'mdi:account', entityKey: 'last_user_entity', domains: FOOTER_ENTITY_DOMAINS.last_user },
  door: { icon: 'mdi:door-closed', entityKey: 'door_entity', domains: FOOTER_ENTITY_DOMAINS.door },
};

export class NeonLockCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: NeonLockCardConfig;

  static styles = [
    NEON_EDITOR_FORM_STYLES,
    NEON_LOCK_ICON_STYLES,
    NEON_LOCK_EDITOR_STYLES,
  ];

  setConfig(config: NeonLockCardConfig): void {
    this._config = config;
  }

  private _configChanged(key: string, value: unknown): void {
    if (!this._config) return;
    const newConfig: NeonLockCardConfig = { ...this._config };
    if (value === '' || value === undefined) delete newConfig[key];
    else newConfig[key] = value;
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: newConfig }, bubbles: true, composed: true }));
  }

  private _actionFor(key: 'tap_action' | 'hold_action' | 'double_tap_action', defaultAction: string): ActionConfig {
    return (this._config?.[key] as ActionConfig | undefined) || { action: defaultAction };
  }

  private _t(key: keyof LockTranslations): string {
    return localize(this.hass, LOCK_TRANSLATIONS, key);
  }

  /** Claves de src/shared/translations (paleta y acciones, compartidas con otras tarjetas). */
  private _ts(key: keyof SharedTranslations): string {
    return localize(this.hass, SHARED_TRANSLATIONS, key);
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <div class="editor-container">
        ${this._renderMainSection()} ${resolveLockSize(this._config) === 'compact' ? this._renderStatusDoorSection('footer_hint_compact') : this._renderFooterSection()} ${this._renderHaloSection()} ${this._renderStatusColorsSection()} ${this._renderActionsSection()}
      </div>
    `;
  }

  private _renderMainSection(): TemplateResult {
    const config = this._config!;
    const size = resolveLockSize(config);
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_main')}</div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.entity || ''}
          .includeDomains=${['lock']}
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
        <label class="native-select-label" for="size">${this._t('size_label')}</label>
        <select
          id="size"
          class="native-select"
          .value=${size}
          @change=${(ev: Event) => {
            const value = (ev.target as HTMLSelectElement).value as LockSize;
            if (!value || value === resolveLockSize(this._config)) return;
            this._configChanged('size', value === DEFAULT_LOCK_SIZE ? undefined : value);
          }}
        >
          ${LOCK_SIZES.map((opt) => html`<option value=${opt} ?selected=${opt === size}>${this._t(`size_${opt}`)}</option>`)}
        </select>
        ${this._renderIconPicker()}
        ${size === 'large' ? this._renderSubtitleFields() : nothing}
      </div>
    `;
  }

  /** Subtítulo (solo en la tarjeta grande: la mediana y la compacta no lo llevan). */
  private _renderSubtitleFields(): TemplateResult {
    const config = this._config!;
    const current: LockSubtitleType = config.subtitle_type || 'none';
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
          ${SUBTITLE_TYPES.map(
            (opt) => html`<option value=${opt} ?selected=${opt === current}>${opt === 'custom' ? this._t('subtitle_type_custom') : labels[opt as keyof typeof labels]}</option>`
          )}
        </select>
        ${current === 'custom'
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
          : nothing}
    `;
  }

  /**
   * Selector de icono: una ficha por icono con su dibujo (cerrado) y su
   * nombre. Es un grupo de radio accesible; el candado es el valor por
   * defecto y por eso no se guarda en la config.
   */
  private _renderIconPicker(): TemplateResult {
    const selected = resolveLockIconType(this._config?.lock_icon);
    return html`
      <span class="native-select-label" id="icon-label">${this._t('icon_label')}</span>
      <div class="icon-picker" role="radiogroup" aria-labelledby="icon-label">
        ${LOCK_ICON_TYPES.map((type) => {
          const label = this._t(`icon_${type}`);
          return html`
            <button
              type="button"
              class="icon-tile ${type === selected ? 'selected' : ''}"
              data-icon=${type}
              role="radio"
              aria-checked=${type === selected ? 'true' : 'false'}
              @click=${() => this._configChanged('lock_icon', type === 'padlock' ? undefined : type)}
            >
              ${LOCK_ICONS[type].template(false)}
              <span>${label}</span>
            </button>
          `;
        })}
      </div>
    `;
  }

  /** Las fichas llevan el icono sin geometría variable: se pinta cerrado tras cada render. */
  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    const tiles = Array.from(this.renderRoot.querySelectorAll('.icon-tile')) as HTMLElement[];
    for (const tile of tiles) {
      const svg = tile.querySelector('svg.lock-icon') as SVGElement | null;
      if (svg) LOCK_ICONS[resolveLockIconType(tile.dataset.icon)].paint(svg, 0);
    }
  }

  /**
   * Pie de la tarjeta: una tarjeta por dato (batería, último acceso, puerta),
   * cada una con su interruptor «mostrar» y, dentro, su entidad. Siempre en
   * el orden en que aparecen en la tarjeta (`FOOTER_ORDER`). La mediana solo
   * muestra batería y último acceso: el sensor de puerta va aparte, con el
   * aviso de que no se pinta en el pie (ver `_renderStatusDoorSection`).
   */
  private _renderFooterSection(): TemplateResult {
    const size = resolveLockSize(this._config);
    const types = footerItemTypes(size);
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_footer')}</div>
        <span class="data-hint">${this._t(size === 'medium' ? 'footer_hint_medium' : 'footer_hint')}</span>
        ${FOOTER_ORDER.filter((type) => types.includes(type)).map((type) => this._renderFooterCard(type))}
      </div>
      ${size === 'medium' ? this._renderStatusDoorSection('door_hint_medium', true) : nothing}
    `;
  }

  /**
   * Tamaños sin el sensor de puerta en el pie (compacta, que no tiene pie, y
   * mediana, donde solo caben dos datos): el sensor se puede elegir igualmente
   * porque sirve para mostrar «Puerta abierta» en el estado de la tarjeta. Se
   * avisa de que no se pinta; en la mediana el aviso va resaltado.
   */
  private _renderStatusDoorSection(hintKey: 'footer_hint_compact' | 'door_hint_medium', warn = false): TemplateResult {
    const entity = (this._config?.door_entity as string | undefined) || '';
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('door_entity_label')}</div>
        <span class=${warn ? 'data-warning' : 'data-hint'}>${this._t(hintKey)}</span>
        ${this._renderFooterEntity('door', FOOTER_ROWS.door, entity, false)}
      </div>
    `;
  }

  private _renderFooterCard(type: LockFooterItem): TemplateResult {
    const row = FOOTER_ROWS[type];
    const on = normalizeFooterItems(this._config?.footer_items, resolveLockSize(this._config)).includes(type);
    const entity = (this._config?.[row.entityKey] as string | undefined) || '';
    const title = this._t(`footer_${type}`);
    // El sensor de puerta también alimenta el estado «Puerta abierta» aunque
    // el dato no se muestre, así que, si ya hay uno elegido, no se esconde.
    const expanded = on || (type === 'door' && entity !== '');
    return html`
      <div class="data-card ${on ? 'on' : ''}" data-footer=${type}>
        <div class="data-head">
          <span class="data-icon"><ha-icon icon=${row.icon}></ha-icon></span>
          <div class="data-text">
            <span class="data-title">${title}</span>
            <span class="data-desc">${this._t(`footer_${type}_desc`)}</span>
          </div>
          <ha-switch
            aria-label=${`${this._t('footer_show')}: ${title}`}
            .checked=${on}
            @change=${(ev: Event) => this._setFooterItem(type, (ev.target as HTMLInputElement).checked)}
          ></ha-switch>
        </div>
        ${expanded ? this._renderFooterEntity(type, row, entity, on) : nothing}
      </div>
    `;
  }

  private _renderFooterEntity(type: LockFooterItem, row: FooterRow, entity: string, on: boolean): TemplateResult {
    return html`
      <ha-entity-picker
        .hass=${this.hass}
        .value=${entity}
        .includeDomains=${row.domains}
        label=${this._t(`${type}_entity_label`)}
        allow-custom-entity
        @value-changed=${(ev: ValueChangedEvent) => this._configChanged(row.entityKey, ev.detail.value)}
      ></ha-entity-picker>
      <span class="data-hint">${this._t(`${type}_entity_hint`)}</span>
      ${on && type === 'door' && !entity ? html`<span class="data-warning">${this._t('door_entity_missing')}</span>` : nothing}
    `;
  }

  /**
   * Activa o desactiva un dato del pie; `footer_items` se escribe siempre en
   * `FOOTER_ORDER`. Un dato que el tamaño actual no pinta (la puerta en la
   * mediana) se conserva en la config por si se vuelve a la grande.
   */
  private _setFooterItem(type: LockFooterItem, on: boolean): void {
    const chosen = new Set(normalizeFooterItems(this._config?.footer_items));
    if (on) chosen.add(type);
    else chosen.delete(type);
    const next = FOOTER_ORDER.filter((item) => chosen.has(item));
    this._configChanged('footer_items', next.length ? next : undefined);
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
          ${['emerald', 'cyberpunk', 'electric', 'sunset', 'toxic'].map(
            (id) => html`<option value=${id} ?selected=${id === currentPalette}>${getPaletteName(this.hass, id)}</option>`
          )}
          <option value="custom" ?selected=${currentPalette === 'custom'}>${getPaletteCustomLabel(this.hass)}</option>
        </select>
        ${currentPalette === 'custom' ? this._renderCustomColors(config) : nothing}
      </div>
    `;
  }

  private _renderCustomColors(config: NeonLockCardConfig): TemplateResult {
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
        <input type="color" .value=${value} @input=${(ev: Event) => this._configChanged(configKey, (ev.target as HTMLInputElement).value)} />
      </div>
    `;
  }

  /**
   * Colores del punto de estado: uno por grupo de estados. El selector de
   * color del navegador solo entiende `#rrggbb`: si en YAML hay otro formato
   * (un nombre, rgb(), var(--x)) se muestra el color por defecto en el
   * selector, pero la tarjeta sigue usando el valor de YAML hasta que se toque.
   */
  private _renderStatusColorsSection(): TemplateResult {
    const config = this._config!;
    const anySet = (['status_color_closed', 'status_color_open', 'status_color_alert'] as const).some((key) => config[key] !== undefined);
    return html`
      <div class="editor-section">
        <div class="section-header">${this._t('section_status')}</div>
        <span class="native-select-label">${this._t('status_color_hint')}</span>
        <div class="custom-colors-grid">
          ${this._renderStatusColor('status_color_closed', 'closed')} ${this._renderStatusColor('status_color_open', 'open')}
          ${this._renderStatusColor('status_color_alert', 'alert')}
        </div>
        ${anySet
          ? html`<button type="button" class="reset-colors" @click=${() => this._resetStatusColors()}>${this._t('status_color_reset')}</button>`
          : nothing}
      </div>
    `;
  }

  private _renderStatusColor(configKey: 'status_color_closed' | 'status_color_open' | 'status_color_alert', group: keyof typeof STATUS_DOT_DEFAULTS): TemplateResult {
    const configured = this._config?.[configKey];
    const value = isCssColor(configured) ? toHex6(configured) ?? STATUS_DOT_DEFAULTS[group] : STATUS_DOT_DEFAULTS[group];
    return html`
      <div class="color-picker-wrapper">
        <span>${this._t(`status_color_${group}`)}</span>
        <input type="color" .value=${value} @input=${(ev: Event) => this._configChanged(configKey, (ev.target as HTMLInputElement).value)} />
      </div>
    `;
  }

  /** Quita los tres colores de una vez (un solo `config-changed`). */
  private _resetStatusColors(): void {
    if (!this._config) return;
    const newConfig: NeonLockCardConfig = { ...this._config };
    delete newConfig.status_color_closed;
    delete newConfig.status_color_open;
    delete newConfig.status_color_alert;
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: newConfig }, bubbles: true, composed: true }));
  }

  private _renderActionsSection(): TemplateResult {
    return html`
      <div class="editor-section">
        <div class="section-header">${this._ts('section_actions')}</div>
        <ha-formfield label=${this._t('confirm_open_label')}>
          <ha-switch
            .checked=${this._config?.confirm_open !== false}
            @change=${(ev: Event) => this._configChanged('confirm_open', (ev.target as HTMLInputElement).checked ? undefined : false)}
          ></ha-switch>
        </ha-formfield>
        ${this._renderActionEditor('action_tap', 'tap_action', 'toggle')}
        ${this._renderActionEditor('action_hold', 'hold_action', 'more-info')}
        ${this._renderActionEditor('action_double_tap', 'double_tap_action', 'none')}
      </div>
    `;
  }

  private _renderActionEditor(
    titleKey: 'action_tap' | 'action_hold' | 'action_double_tap',
    configKey: 'tap_action' | 'hold_action' | 'double_tap_action',
    defaultAction: string
  ): TemplateResult {
    return html`
      <div class="action-item">
        <span class="action-title">${this._ts(titleKey)}</span>
        <hui-action-editor
          .hass=${this.hass}
          .config=${this._actionFor(configKey, defaultAction)}
          .actions=${ALLOWED_ACTIONS}
          .configValue=${configKey}
          @value-changed=${(ev: ValueChangedEvent) => this._configChanged(configKey, ev.detail.value)}
        ></hui-action-editor>
      </div>
    `;
  }
}
