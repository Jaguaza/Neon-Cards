import { html, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import type { ActionConfig, HomeAssistant } from '../../ha/types';
import { BaseNeonCard, createGestureState, handlePointerDown, cancelHold, handleClick, dispatchHassAction, computeInfoDisplay, localize } from '../../core';
import type { GestureState } from '../../core';
import { resolveGradientColors, NEON_HALO_STYLES, NEON_RING_SPLIT_STYLES, neonHaloVars, neonRingSplitTemplate, RingSizeController } from '../../shared';
import { ACTION_PENDING_MS, ALARM_GRID, COMMAND_SERVICES, TRIGGERED_HALO } from './constants';
import { AlarmFlow } from './alarm-flow';
import { commandChoices, commandNeedsCode, codeFormat, isAlarmAlert, isAlarmHaloOn, isAlarmMoving, isToggleAction, resolveAlarmState } from './alarm-state';
import { resolveAlarmSize } from './alarm-size';
import { footerSensorView, normalizeFooterTypes } from './alarm-sensors';
import type { FooterSensorView } from './alarm-sensors';
import { renderFooterSensor } from './footer-view';
import { renderConfirmView, renderModesView } from './flow-views';
import type { ViewContext } from './flow-views';
import { renderKeypadView } from './keypad-view';
import { renderSensorsView } from './sensors-view';
import { renderShield } from './shield-icon';
import { NEON_SHIELD_ICON_STYLES } from './shield-icon.styles';
import { NEON_ALARM_CARD_STYLES } from './neon-alarm-card.styles';
import { NEON_ALARM_SIZE_STYLES } from './neon-alarm-card.size.styles';
import { NEON_ALARM_VIEWS_STYLES } from './neon-alarm-views.styles';
import { ALARM_TRANSLATIONS } from './translations';
import type { AlarmTranslations } from './translations';
import type { AlarmCommand, AlarmSubtitleType, AlarmVisualState, NeonAlarmCardConfig } from './types';

/**
 * Neón Alarm Card
 * ------------------------------------------------------------
 * Creador: Jaguaza
 *
 * Tarjeta para entidades `alarm_control_panel` de Home Assistant: escudo
 * animado que cambia con el estado (un dibujo y un color por cada modo
 * armado, transición, disparada…), halo neón mientras la alarma vigila,
 * selección del modo de armado con los modos que soporta la entidad, teclado
 * numérico cuando la entidad exige código y pie con el recuento de sensores
 * de seguridad. Ver `src/cards/alarm/README.md` para la especificación.
 */
export class NeonAlarmCard extends BaseNeonCard {
  static properties = {
    ...BaseNeonCard.properties,
    _config: { state: true },
  };

  private _config?: NeonAlarmCardConfig;
  private _gesture: GestureState = createGestureState();
  /** Id estable por instancia para el degradado del aro SVG (varias tarjetas en el mismo dashboard). */
  private readonly _ringUid = Math.random().toString(36).slice(2);
  private readonly _ring = new RingSizeController(this);
  private readonly _flow = new AlarmFlow(() => this.requestUpdate());
  /** Instante (performance.now) hasta el que el halo espera encendido el cambio de estado tras lanzar una orden. */
  private _pendingUntil = 0;
  private _pendingTimer?: ReturnType<typeof setTimeout>;
  private _lastSeen?: { entity: string | undefined; state: AlarmVisualState };
  private _focusedView?: string;

  static styles = [NEON_HALO_STYLES, NEON_RING_SPLIT_STYLES, NEON_SHIELD_ICON_STYLES, NEON_ALARM_CARD_STYLES, NEON_ALARM_SIZE_STYLES, NEON_ALARM_VIEWS_STYLES];

  static getConfigElement(): HTMLElement {
    return document.createElement('neon-alarm-card-editor');
  }

  static getStubConfig(hass?: HomeAssistant, entities?: string[], entitiesFallback?: string[]): NeonAlarmCardConfig {
    const candidates = [...(entities ?? []), ...(entitiesFallback ?? [])];
    const isAlarm = (id: string) => id.startsWith('alarm_control_panel.');
    const found = candidates.find(isAlarm) || (hass ? Object.keys(hass.states).find(isAlarm) : undefined);
    return {
      entity: found || 'alarm_control_panel.example_alarm',
      neon_palette: 'emerald',
      neon_color1: '#39e07a',
      neon_color2: '#2dd6b8',
      neon_color3: '#1ecdf2',
      tap_action: { action: 'toggle' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'none' },
    };
  }

  setConfig(config: NeonAlarmCardConfig): void {
    // Sin lanzar error si falta la entidad: la vista previa del selector de
    // tarjetas y el editor llaman a setConfig con configs incompletas.
    this._config = config;
    // Solo en modo desarrollo (acuerdo nº22).
    if (__DEV__) {
      if (!config.entity) console.warn('[neon-alarm-card] falta `entity:` — la tarjeta se muestra como "No disponible".');
      else if (!config.entity.startsWith('alarm_control_panel.')) console.warn(`[neon-alarm-card] entity ("${config.entity}") no es del dominio alarm_control_panel.`);
    }
  }

  getCardSize(): number {
    return 3;
  }

  /** Columnas de inicio: grande 12, mediana 6 y compacta 3; alto automático. */
  getGridOptions(): { rows: 'auto'; columns: number; min_columns: number } {
    return { rows: 'auto', ...ALARM_GRID[resolveAlarmSize(this._config)] };
  }

  private get _stateObj() {
    return this._config?.entity ? this.hass?.states[this._config.entity] : undefined;
  }

  private get _name(): string {
    return this._config?.name || (this._stateObj?.attributes.friendly_name as string | undefined) || '';
  }

  private _t(key: keyof AlarmTranslations): string {
    return localize(this.hass, ALARM_TRANSLATIONS, key);
  }

  /** Nombre traducido de un tipo de sensor del pie; uno desconocido se muestra tal cual. */
  private _sensorTypeLabel(type: string): string {
    const key = `sensor_type_${type}`;
    return key in ALARM_TRANSLATIONS.es ? this._t(key as keyof AlarmTranslations) : type;
  }

  /** Subtítulo (tamaño grande): 'none' no muestra nada, 'state' el estado traducido, 'custom' el texto libre y el resto delega en `computeInfoDisplay`. */
  private _subtitle(state: AlarmVisualState | undefined): string | TemplateResult | typeof nothing {
    const type: AlarmSubtitleType = this._config?.subtitle_type || 'none';
    if (type === 'none') return nothing;
    if (type === 'custom') return this._config?.subtitle || nothing;
    if (type === 'state') return state ? this._t(`state_${state}`) : nothing;
    const stateObj = this._stateObj;
    if (!stateObj || !this.hass) return nothing;
    return computeInfoDisplay(type, this._name, stateObj.state, stateObj, this.hass);
  }

  private _actionFor(actionType: string): ActionConfig {
    if (actionType === 'hold') return this._config?.hold_action || { action: 'more-info' };
    if (actionType === 'double_tap') return this._config?.double_tap_action || { action: 'none' };
    return this._config?.tap_action || { action: 'toggle' };
  }

  private _handleAction(actionType: string): void {
    const action = this._actionFor(actionType);
    if (!isToggleAction(action)) {
      this._dispatch(action, actionType);
      return;
    }
    this._toggle();
  }

  private _dispatch(action: ActionConfig, actionType: string): void {
    const config = { entity: this._config?.entity, tap_action: this._actionFor('tap'), hold_action: this._actionFor('hold'), double_tap_action: this._actionFor('double_tap') };
    if (action.action === 'toggle') return;
    dispatchHassAction(this, config, actionType);
  }

  /**
   * Pulsar (acción `toggle`): desarmada → elegir modo (o armar directo si la
   * entidad solo soporta uno); armada, en transición o disparada → desarmar.
   */
  private _toggle(): void {
    if (this._flow.view) return;
    const state = resolveAlarmState(this._config, this.hass);
    const choices = commandChoices(state, this._stateObj?.attributes);
    if (choices.length > 1) this._flow.open({ kind: 'modes', choices });
    else if (choices.length === 1) this._begin(choices[0], true);
  }

  /** Confirmación (si está activada y la orden no salió de elegir un modo) y, después, código. */
  private _begin(command: AlarmCommand, askConfirm: boolean): void {
    if (askConfirm && this._config?.confirmation) this._flow.open({ kind: 'confirm', command });
    else this._afterConfirm(command);
  }

  private _afterConfirm(command: AlarmCommand): void {
    const attributes = this._stateObj?.attributes;
    const format = codeFormat(attributes);
    if (format && commandNeedsCode(command, attributes)) this._flow.open({ kind: 'keypad', command, format });
    else void this._run(command);
  }

  private _startPending(): void {
    this._pendingUntil = performance.now() + ACTION_PENDING_MS;
    this._schedulePendingEnd(ACTION_PENDING_MS);
    this.requestUpdate();
  }

  /** Lanza el servicio. Con código, si HA lo rechaza (código incorrecto) la vista sigue abierta y lo avisa. */
  private async _run(command: AlarmCommand, code?: string): Promise<void> {
    if (!this._config?.entity || !this.hass) return;
    this._startPending();
    const data: Record<string, unknown> = { entity_id: this._config.entity };
    if (code !== undefined) data.code = code;
    try {
      await this.hass.callService('alarm_control_panel', COMMAND_SERVICES[command], data);
      this._flow.close();
    } catch {
      this._pendingUntil = 0;
      if (code === undefined) this._flow.close();
      else this._flow.markError();
    }
  }

  private _submitCode(): void {
    const view = this._flow.view;
    if (view?.kind !== 'keypad' || this._flow.code === '') return;
    void this._run(view.command, this._flow.code);
  }

  private _renderStatus(state: AlarmVisualState): TemplateResult {
    return html`<span class="status" data-state=${state}><span class="status-dot"></span><span class="status-text">${this._t(`state_${state}`)}</span></span>`;
  }

  /** Los tres puntos: abre el diálogo «más información» de la entidad sin disparar la acción de la tarjeta. */
  private _renderMenu(): TemplateResult {
    const stop = (ev: Event) => ev.stopPropagation();
    return html`
      <button type="button" class="menu" aria-label=${this._t('more_info')} title=${this._t('more_info')} @pointerdown=${stop} @pointerup=${stop} @pointercancel=${stop} @click=${(ev: Event) => { ev.stopPropagation(); this._openMoreInfo(); }}>
        <ha-icon icon="mdi:dots-vertical"></ha-icon>
      </button>
    `;
  }

  private _openMoreInfo(): void {
    dispatchHassAction(this, { entity: this._config?.entity, tap_action: { action: 'more-info' }, hold_action: { action: 'none' }, double_tap_action: { action: 'none' } }, 'tap');
  }

  /** Cabecera: escudo, nombre y estado. Ni la mediana ni la compacta tienen subtítulo: el estado ocupa su sitio. */
  private _renderHeader(state: AlarmVisualState | undefined, large: boolean, compact: boolean): TemplateResult {
    const icon = renderShield(state);
    if (!large) {
      return html`<div class="header">${icon}<div class="text"><span class="name">${this._name}</span>${state ? this._renderStatus(state) : nothing}</div>${state && state !== 'error' && !compact ? this._renderMenu() : nothing}</div>`;
    }
    const subtitle = this._subtitle(state);
    const menu = state && state !== 'error' ? this._renderMenu() : html`<span class="menu-spacer"></span>`;
    return html`
      <div class="header">
        ${icon}
        <div class="text"><span class="name">${this._name}</span>${subtitle !== nothing ? html`<span class="subtitle">${subtitle}</span>` : nothing}</div>
        ${state ? html`<div class="top-right">${this._renderStatus(state)}${menu}</div>` : nothing}
      </div>
    `;
  }

  private _renderFooter(size: ReturnType<typeof resolveAlarmSize>): TemplateResult | typeof nothing {
    const types = normalizeFooterTypes(this._config?.footer_sensors, size);
    if (!types.length) return nothing;
    const items = types.map((type) => {
      const sensor = footerSensorView(this.hass, type);
      return renderFooterSensor(sensor, { label: this._sensorTypeLabel(type), ...this._sensorCount(sensor), onOpen: (t) => this._flow.open({ kind: 'sensors', type: t }) });
    });
    return html`<div class="footer">${items}</div>`;
  }

  /** Recuento y texto de un dato del pie: «2 activos», «1 activo», «0 En reposo» o «—» sin sensores. */
  private _sensorCount(sensor: FooterSensorView): { count: string; word: string } {
    if (sensor.total === 0) return { count: '—', word: '' };
    if (sensor.activeCount === 0) return { count: '0', word: this._t('sensors_idle') };
    return { count: String(sensor.activeCount), word: this._t(sensor.activeCount === 1 ? 'sensors_active_one' : 'sensors_active') };
  }

  private _viewContext(compact: boolean): ViewContext {
    return { name: this._name, compact, translate: (key) => this._t(key), onCancel: () => this._flow.close() };
  }

  /** La vista abierta (modos, confirmación, teclado o lista de sensores). */
  private _renderView(compact: boolean): TemplateResult | typeof nothing {
    const view = this._flow.view;
    if (!view || !this._flow.shown) return nothing;
    const ctx = this._viewContext(compact);
    if (view.kind === 'modes') return renderModesView(ctx, view.choices, (command) => this._begin(command, false));
    if (view.kind === 'confirm') return renderConfirmView(ctx, view.command, () => this._afterConfirm(view.command));
    if (view.kind === 'sensors') return renderSensorsView(ctx, footerSensorView(this.hass, view.type), this._sensorTypeLabel(view.type));
    return renderKeypadView({
      ...ctx,
      code: this._flow.code,
      error: this._flow.codeError,
      format: view.format,
      onDigit: (digit) => this._flow.append(digit),
      onBackspace: () => this._flow.backspace(),
      onText: (value) => this._flow.setCode(value),
      onAccept: () => this._submitCode(),
    });
  }

  private _haloClasses(state: AlarmVisualState | undefined): string {
    const on = isAlarmHaloOn(state) || this._isPending() || !!this._flow.view;
    return [on ? 'neon-halo-active' : '', isAlarmAlert(state) ? 'neon-halo-error' : '', isAlarmMoving(state) ? 'alarm-moving' : '', state === 'triggered' ? 'alarm-triggered' : ''].join(' ');
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    const colors = resolveGradientColors(this._config);
    const state = resolveAlarmState(this._config, this.hass);
    const size = resolveAlarmSize(this._config);
    const viewing = !!this._flow.view && this._flow.shown;
    const hasDoubleTap = !!this._config.double_tap_action && this._config.double_tap_action.action !== 'none';
    return html`
      <ha-card
        class="neon-ring-host size-${size} ${viewing ? 'viewing' : ''} ${this._haloClasses(state)}"
        style=${neonHaloVars(state === 'triggered' ? TRIGGERED_HALO : colors)}
        @pointerdown=${(ev: PointerEvent) => handlePointerDown(this._gesture, ev, '.-none-', () => this._handleAction('hold'))}
        @pointerup=${() => cancelHold(this._gesture)}
        @pointercancel=${() => cancelHold(this._gesture)}
        @click=${(ev: MouseEvent) => handleClick(this._gesture, ev, '.-none-', { onTap: () => this._handleAction('tap'), onDoubleTap: () => this._handleAction('double_tap'), hasDoubleTap })}
      >
        ${neonRingSplitTemplate(this._ringUid, this._ring.size.width, this._ring.size.height, this._ring.size.radius)}
        <div class="content ${viewing ? 'content--hidden' : ''}" aria-hidden=${viewing ? 'true' : 'false'}>
          ${this._renderHeader(state, size === 'large', size === 'compact')} ${size === 'compact' ? nothing : this._renderFooter(size)}
        </div>
        ${this._renderView(size === 'compact')}
      </ha-card>
    `;
  }

  /** Si la alarma cambia de estado mientras hay una vista abierta, la vista ya no vale: manda el estado. */
  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    const state = resolveAlarmState(this._config, this.hass);
    if (!state || state === 'error') {
      this._lastSeen = undefined;
      this._flow.drop();
      return;
    }
    const entity = this._config?.entity;
    const last = this._lastSeen;
    if (last && last.entity === entity && last.state !== state) {
      this._pendingUntil = 0;
      if (this._flow.view?.kind !== 'sensors') this._flow.drop();
    }
    this._lastSeen = { entity, state };
  }

  private _isPending(): boolean {
    return performance.now() < this._pendingUntil;
  }

  private _schedulePendingEnd(ms: number): void {
    clearTimeout(this._pendingTimer);
    this._pendingTimer = setTimeout(() => this.requestUpdate(), ms);
  }

  /** Al abrirse una vista de confirmación el foco va a «Cancelar»: Intro o Espacio no arman ni desarman por accidente. */
  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    const kind = this._flow.shown ? this._flow.view?.kind : undefined;
    if (kind === 'confirm' && this._focusedView !== 'confirm') this.renderRoot.querySelector<HTMLElement>('.view .cancel')?.focus();
    this._focusedView = kind;
  }

  connectedCallback(): void {
    super.connectedCallback();
    const remaining = this._pendingUntil - performance.now();
    if (remaining > 0) this._schedulePendingEnd(remaining);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this._pendingTimer);
    this._flow.drop();
  }
}
