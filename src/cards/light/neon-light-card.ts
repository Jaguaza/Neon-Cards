import { html, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import type { HassEntityState, HomeAssistant } from '../../ha/types';
import { BaseNeonCard, TOGGLE_ACTION_DEFAULTS, cancelHold, computeInfoDisplay, createGestureState, dispatchHassAction, handleClick, handlePointerDown, localize, resolveActionConfigs } from '../../core';
import type { GestureState } from '../../core';
import { ActionPendingController, ERROR_ICON, NEON_HALO_STYLES, NEON_RING_SPLIT_STYLES, RingSizeController, neonHaloVars, neonRingSplitTemplate, resolveGradientColors } from '../../shared';
import { DEFAULT_ICON, LIGHT_GRID } from './constants';
import { renderEffectsView } from './effects-view';
import { carouselWindow, nextStart, visibleItemCount } from './footer-carousel';
import { renderFooterButtons, renderFooterShell, renderFooterSlider } from './footer-view';
import { lightColorCss } from './light-color';
import { renderLightIcon } from './light-icon';
import { LIGHT_ICON_STYLES } from './light-icon.styles';
import { controlCommand, effectCommand, sendLightCommand } from './light-commands';
import type { LightCommand } from './light-commands';
import { controlRange, currentEffect, effectList, fillPercent, footerItems, groupCount, isLightBroken, isLightOn } from './light-state';
import { lightStateText } from './light-text';
import { NEON_LIGHT_FOOTER_STYLES } from './neon-light-card.footer.styles';
import { NEON_LIGHT_CARD_STYLES } from './neon-light-card.styles';
import { NEON_LIGHT_VIEWS_STYLES } from './neon-light-card.views.styles';
import { LIGHT_TRANSLATIONS } from './translations';
import type { LightTranslations } from './translations';
import type { FooterControl, FooterItem, NeonLightCardConfig } from './types';

/** Texto accesible de cada icono del pie. */
const ITEM_LABEL_KEYS: Record<FooterItem, keyof LightTranslations> = {
  brightness: 'control_brightness',
  color_temp: 'control_color_temp',
  color: 'control_color',
  effects: 'control_effects',
};

/**
 * Neón Light Card
 * ------------------------------------------------------------
 * Creador: Jaguaza
 *
 * Tarjeta para entidades `light` de Home Assistant (también grupos): aspecto
 * de la Button Card sin sensores, icono que se enciende de abajo arriba hasta
 * el brillo marcado y pie con un icono por función (brillo, temperatura de
 * color, color y efectos) que despliega su barra en el propio pie. Solo hay
 * tamaño grande por ahora.
 */
export class NeonLightCard extends BaseNeonCard {
  static properties = {
    ...BaseNeonCard.properties,
    _config: { state: true },
    _open: { state: true },
    _effects: { state: true },
    _preview: { state: true },
    _start: { state: true },
  };

  private _config?: NeonLightCardConfig;
  /** Control del pie cuya barra está abierta. */
  private _open?: FooterControl;
  /** Vista flotante de efectos abierta. */
  private _effects = false;
  /** Valor de la barra mientras se arrastra y hasta que la luz confirma el cambio. */
  private _preview?: { control: FooterControl; value: number };
  /** Primer icono visible del carrusel del pie (la flecha lo avanza de uno en uno). */
  private _start = 0;
  private _lastStateObj?: HassEntityState;
  private _gesture: GestureState = createGestureState();
  /** Id estable por instancia para el degradado del aro SVG (varias tarjetas en el mismo dashboard). */
  private readonly _ringUid = Math.random().toString(36).slice(2);
  private readonly _ring = new RingSizeController(this);
  /** Espera del cambio de estado tras mandar una orden a una luz apagada (ver `ACTION_PENDING_MS`). */
  private readonly _pending = new ActionPendingController(this);

  static styles = [NEON_HALO_STYLES, NEON_RING_SPLIT_STYLES, LIGHT_ICON_STYLES, NEON_LIGHT_CARD_STYLES, NEON_LIGHT_FOOTER_STYLES, NEON_LIGHT_VIEWS_STYLES];

  static getConfigElement(): HTMLElement {
    return document.createElement('neon-light-card-editor');
  }

  static getStubConfig(hass?: HomeAssistant, entities?: string[], entitiesFallback?: string[]): NeonLightCardConfig {
    const candidates = [...(entities ?? []), ...(entitiesFallback ?? [])];
    const isLight = (id: string) => id.startsWith('light.');
    const found = candidates.find(isLight) || (hass ? Object.keys(hass.states).find(isLight) : undefined);
    return {
      entity: found || 'light.example_light',
      subtitle_type: 'state',
      neon_palette: 'emerald',
      neon_color1: '#39e07a',
      neon_color2: '#2dd6b8',
      neon_color3: '#1ecdf2',
      tap_action: { action: 'toggle' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'none' },
    };
  }

  setConfig(config: NeonLightCardConfig): void {
    // Sin lanzar error si falta la entidad: la vista previa del selector de
    // tarjetas y el editor llaman a setConfig con configs incompletas.
    this._config = config;
    // Solo en modo desarrollo (acuerdo nº22).
    if (__DEV__) {
      if (!config.entity) console.warn('[neon-light-card] falta `entity:` — la tarjeta se muestra como "No disponible".');
      else if (!config.entity.startsWith('light.')) console.warn(`[neon-light-card] entity ("${config.entity}") no es del dominio light.`);
    }
  }

  getCardSize(): number {
    return 3;
  }

  /** Columnas de inicio y mínimo; el alto es automático. */
  getGridOptions(): { rows: 'auto'; columns: number; min_columns: number } {
    return { rows: 'auto', ...LIGHT_GRID };
  }

  private get _stateObj(): HassEntityState | undefined {
    return this._config?.entity ? this.hass?.states[this._config.entity] : undefined;
  }

  private get _broken(): boolean {
    return isLightBroken(this._config, this.hass);
  }

  private get _name(): string {
    return this._config?.name || (this._stateObj?.attributes.friendly_name as string | undefined) || '';
  }

  private get _icon(): string {
    if (this._broken) return ERROR_ICON;
    return this._config?.icon || (this._stateObj?.attributes.icon as string | undefined) || DEFAULT_ICON;
  }

  private _t(key: keyof LightTranslations): string {
    return localize(this.hass, LIGHT_TRANSLATIONS, key);
  }

  /** Subtítulo: `custom` (texto libre), `state` (estado con brillo y recuento del grupo) o un dato de la entidad vía `computeInfoDisplay`. */
  private _subtitle(): string | TemplateResult | typeof nothing {
    const type = this._config?.subtitle_type || 'custom';
    if (type === 'custom') return this._config?.subtitle || nothing;
    const stateObj = this._stateObj;
    if (type === 'state') return lightStateText((key) => this._t(key), stateObj, groupCount(stateObj, this.hass));
    if (!stateObj || !this.hass) return nothing;
    return computeInfoDisplay(type, this._name, stateObj.state, stateObj, this.hass);
  }

  private _handleAction(actionType: string): void {
    dispatchHassAction(this, { entity: this._config?.entity, ...resolveActionConfigs(this._config, TOGGLE_ACTION_DEFAULTS) }, actionType);
  }

  /** Manda una orden a la luz. Si estaba apagada, el halo se enciende ya y espera a que el estado cambie. */
  private async _send(command: LightCommand): Promise<void> {
    if (!this.hass) return;
    if (!isLightOn(this._config, this.hass)) this._pending.start();
    try {
      await sendLightCommand(this.hass, command);
    } catch {
      this._pending.clear();
      this._preview = undefined;
    }
  }

  private _commit(control: FooterControl, value: number): void {
    const entity = this._config?.entity;
    if (!entity) return;
    this._preview = { control, value };
    void this._send(controlCommand(control, entity, value, this._stateObj?.attributes));
  }

  private _pickEffect(effect: string): void {
    const entity = this._config?.entity;
    this._effects = false;
    if (entity) void this._send(effectCommand(entity, effect));
  }

  private _select(item: FooterItem): void {
    this._preview = undefined;
    if (item === 'effects') this._effects = true;
    else this._open = item;
  }

  private _renderControl(control: FooterControl): TemplateResult {
    const range = controlRange(control, this._stateObj?.attributes);
    const value = this._preview?.control === control ? this._preview.value : range.value;
    return renderFooterSlider(
      { control, label: this._t(ITEM_LABEL_KEYS[control]), ...range, value },
      {
        closeLabel: this._t('control_close'),
        onClose: () => {
          this._open = undefined;
          this._preview = undefined;
        },
        onPreview: (next) => {
          this._preview = { control, value: next };
        },
        onCommit: (next) => this._commit(control, next),
      }
    );
  }

  /**
   * Pie: la fila de iconos o, con uno pulsado, su barra en el mismo hueco. Si
   * no caben todos según el ancho de la tarjeta, se ven los que quepan y una
   * flecha desliza el carrusel de uno en uno. Sin iconos (luz solo on/off) o
   * con la luz rota, no hay pie.
   */
  private _renderFooter(): TemplateResult | typeof nothing {
    if (this._broken) return nothing;
    const items = footerItems(this._stateObj?.attributes);
    if (!items.length) return nothing;
    const open = this._open && items.includes(this._open) ? this._open : undefined;
    return renderFooterShell(open ? this._renderControl(open) : this._renderButtons(items));
  }

  private _renderButtons(items: FooterItem[]): TemplateResult {
    const count = visibleItemCount(items.length, this._ring.size.width);
    const carousel = count < items.length;
    return renderFooterButtons(carousel ? carouselWindow(items, this._start % items.length, count) : items, {
      label: (item) => this._t(ITEM_LABEL_KEYS[item]),
      onSelect: (item) => this._select(item),
      onNext: carousel ? () => this._advance(items.length) : undefined,
      nextLabel: this._t('control_next'),
    });
  }

  private _advance(total: number): void {
    this._start = nextStart(this._start % total, total);
  }

  private _renderEffects(): TemplateResult | typeof nothing {
    if (!this._effects || this._broken) return nothing;
    const attributes = this._stateObj?.attributes;
    return renderEffectsView({
      title: this._t('effects_title'),
      closeLabel: this._t('control_close'),
      effects: effectList(attributes),
      current: currentEffect(attributes),
      onPick: (effect) => this._pickEffect(effect),
      onCancel: () => {
        this._effects = false;
      },
    });
  }

  private _fill(): number {
    const preview = this._preview?.control === 'brightness' ? this._preview.value : undefined;
    return this._broken ? 0 : fillPercent(this._stateObj, preview);
  }

  /** Color del icono: el de la luz (o el que arrastras en la barra); sin color, la paleta neón. */
  private _iconColor(): string | undefined {
    return this._broken ? undefined : lightColorCss(this._stateObj?.attributes, this._preview);
  }

  private _haloClasses(): string {
    const on = !this._broken && (isLightOn(this._config, this.hass) || this._pending.active);
    return `${on ? 'neon-halo-active' : ''} ${this._broken ? 'neon-halo-error' : ''}`;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    const viewing = this._effects && !this._broken;
    const subtitle = this._subtitle();
    const hasDoubleTap = !!this._config.double_tap_action && this._config.double_tap_action.action !== 'none';
    return html`
      <ha-card
        class="neon-ring-host ${this._haloClasses()}"
        style=${neonHaloVars(resolveGradientColors(this._config))}
        @pointerdown=${(ev: PointerEvent) => handlePointerDown(this._gesture, ev, '.-none-', () => this._handleAction('hold'))}
        @pointerup=${() => cancelHold(this._gesture)}
        @pointercancel=${() => cancelHold(this._gesture)}
        @click=${(ev: MouseEvent) => handleClick(this._gesture, ev, '.-none-', { onTap: () => this._handleAction('tap'), onDoubleTap: () => this._handleAction('double_tap'), hasDoubleTap })}
      >
        ${neonRingSplitTemplate(this._ringUid, this._ring.size.width, this._ring.size.height, this._ring.size.radius)}
        <div class="content ${viewing ? 'content--hidden' : ''}" aria-hidden=${viewing ? 'true' : 'false'}>
          ${renderLightIcon(this._icon, this._fill(), this._iconColor())}
          <div class="text">
            <span class="name">${this._name}</span>
            ${subtitle !== nothing ? html`<span class="subtitle">${subtitle}</span>` : nothing}
          </div>
          ${this._renderFooter()}
        </div>
        ${this._renderEffects()}
      </ha-card>
    `;
  }

  /**
   * Cuando la luz cambia de estado manda el estado: se acaba la espera y la
   * vista previa de la barra. Si la luz deja de estar disponible, se cierra
   * lo abierto. (Home Assistant crea un objeto de estado nuevo solo cuando
   * cambia ESTA entidad, no con cada actualización de `hass`.)
   */
  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    const stateObj = this._stateObj;
    if (stateObj !== this._lastStateObj) {
      this._lastStateObj = stateObj;
      this._pending.clear();
      this._preview = undefined;
    }
    if (this._broken) {
      this._open = undefined;
      this._effects = false;
    }
  }
}
