import { html, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import type { ActionConfig, HomeAssistant } from '../../ha/types';
import {
  BaseNeonCard,
  createGestureState,
  handlePointerDown,
  cancelHold,
  handleClick,
  dispatchHassAction,
  computeInfoDisplay,
  localize,
} from '../../core';
import type { GestureState } from '../../core';
import {
  resolveGradientColors,
  NEON_HALO_STYLES,
  NEON_RING_SPLIT_STYLES,
  neonHaloVars,
  neonRingSplitTemplate,
  RingSizeController,
} from '../../shared';
import { ACTION_PENDING_MS, CONFIRM_TIMEOUT_MS, ERROR_ICON, OPERATING_ACTIONS } from './constants';
import { LOCK_ICONS, resolveLockIconType } from './icons';
import type { LockIconDef } from './icons';
import { NEON_LOCK_ICON_STYLES } from './lock-icon.styles';
import { LockPoseAnimator } from './lock-pose-animator';
import { isLockAlert, isLockHaloOn, isLockMoving, isLockOpenPose, isOpeningAction, lockChoices, lockSupportsOpen, resolveLockState } from './lock-state';
import type { LockCommand } from './lock-state';
import { NEON_LOCK_CARD_STYLES } from './neon-lock-card.styles';
import { LOCK_TRANSLATIONS } from './translations';
import type { LockTranslations } from './translations';
import type { LockVisualState, NeonLockCardConfig } from './types';

/**
 * Neón Lock Card
 * ------------------------------------------------------------
 * Creador: Jaguaza
 *
 * Tarjeta para entidades `lock` de Home Assistant: icono animado que se
 * abre y se cierra de verdad según el estado de la cerradura — candado,
 * puerta, garaje con puerta enrollable o garaje con puerta corredera
 * (`lock_icon`). El halo neón sigue al estado: encendido mientras la
 * cerradura está abierta (o abriéndose/cerrándose) y apagado cuando llega
 * a cerrada; rojo de alerta si se atasca o la entidad falla. Ver `src/cards/lock/README.md` para la especificación.
 */
export class NeonLockCard extends BaseNeonCard {
  static properties = {
    ...BaseNeonCard.properties,
    _config: { state: true },
  };

  private _config?: NeonLockCardConfig;
  private _gesture: GestureState = createGestureState();
  /** Id estable por instancia para el <linearGradient> del aro SVG, evita
      colisiones cuando hay varias tarjetas en el mismo dashboard. */
  private readonly _ringUid = Math.random().toString(36).slice(2);
  /** Tamaño real de ha-card para el aro SVG (ver RingSizeController). */
  private readonly _ring = new RingSizeController(this);
  /**
   * Instante (performance.now) hasta el que el halo espera encendido el
   * cambio de estado tras pulsar una acción que opera la cerradura (ver
   * `ACTION_PENDING_MS`). Se guarda la MARCA DE TIEMPO y no un booleano: se
   * decide comparando con el reloj en cada render, así que aunque el
   * temporizador no llegase a dispararse, cualquier actualización de
   * `hass` lo da por vencido. Se anula en cuanto el estado cambia.
   */
  private _pendingUntil = 0;
  private _pendingTimer?: ReturnType<typeof setTimeout>;
  /** Vista «¿Abrir?» abierta: el gesto que la provocó, para ejecutarlo al aceptar. */
  private _confirm?: { actionType: string; choices: LockCommand[] };
  private _confirmTimer?: ReturnType<typeof setTimeout>;
  private _confirmFocused = false;
  /** Último estado visto de la entidad, para detectar su cambio (ver `willUpdate`). */
  private _lastSeen?: { entity: string | undefined; state: LockVisualState };
  /** Lleva el icono entre cerrado y abierto (ver lock-pose-animator.ts). */
  private readonly _pose = new LockPoseAnimator((s) => this._paintIcon(s));
  /** SVG del icono pintado ahora; cuando cambia (primer render, otro icono, vuelta desde `error`) se coloca sin animar. */
  private _iconEl?: SVGElement;

  static styles = [NEON_HALO_STYLES, NEON_RING_SPLIT_STYLES, NEON_LOCK_ICON_STYLES, NEON_LOCK_CARD_STYLES];

  static getConfigElement(): HTMLElement {
    return document.createElement('neon-lock-card-editor');
  }

  static getStubConfig(hass?: HomeAssistant, entities?: string[], entitiesFallback?: string[]): NeonLockCardConfig {
    const candidates = [...(entities ?? []), ...(entitiesFallback ?? [])];
    const isLock = (id: string) => id.startsWith('lock.');
    const fromCandidates = candidates.find(isLock);
    const fromHass = hass ? Object.keys(hass.states).find(isLock) : undefined;

    return {
      entity: fromCandidates || fromHass || 'lock.example_lock',
      neon_palette: 'emerald',
      neon_color1: '#39e07a',
      neon_color2: '#2dd6b8',
      neon_color3: '#1ecdf2',
      tap_action: { action: 'toggle' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'none' },
    };
  }

  setConfig(config: NeonLockCardConfig): void {
    // Sin lanzar error si falta la entidad: la vista previa del selector
    // de tarjetas de HA y el editor llaman a setConfig con configs
    // incompletas. La tarjeta lo muestra como estado `error`.
    this._config = config;
    // Solo en modo desarrollo (acuerdo nº22).
    if (__DEV__) {
      if (config.lock_icon !== undefined && resolveLockIconType(config.lock_icon) !== config.lock_icon) {
        console.warn(`[neon-lock-card] lock_icon ("${String(config.lock_icon)}") no es válido — se usa el candado.`);
      }
      if (!config.entity) {
        console.warn('[neon-lock-card] falta `entity:` — la tarjeta se muestra como \"No disponible\".');
      } else if (!config.entity.startsWith('lock.')) {
        console.warn(`[neon-lock-card] entity (\"${config.entity}\") no es del dominio lock — se muestra como \"No disponible\".`);
      }
    }
  }

  /** Icono configurado (un valor desconocido o ausente es el candado). */
  private get _iconDef(): LockIconDef {
    return LOCK_ICONS[resolveLockIconType(this._config?.lock_icon)];
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions(): { rows: 'auto'; columns: number } {
    return { rows: 'auto', columns: 3 };
  }

  private get _stateObj() {
    return this._config?.entity ? this.hass?.states[this._config.entity] : undefined;
  }

  private get _name(): string {
    return this._config?.name || (this._stateObj?.attributes.friendly_name as string | undefined) || '';
  }

  /** Subtítulo según `subtitle_type`: 'state' (por defecto) es el estado
      TRADUCIDO de la cerradura; 'custom' el texto libre; el resto delega
      en `computeInfoDisplay` de `src/core`, igual que Button y Entity. */
  private _subtitle(state: ReturnType<typeof resolveLockState>): string | TemplateResult | typeof nothing {
    const type = this._config?.subtitle_type || 'state';
    if (type === 'custom') return this._config?.subtitle || nothing;
    if (type === 'state') return state ? localize(this.hass, LOCK_TRANSLATIONS, `state_${state}`) : nothing;
    const stateObj = this._stateObj;
    if (!stateObj || !this.hass) return nothing;
    return computeInfoDisplay(type, this._name, stateObj.state, stateObj, this.hass);
  }

  /** Acción configurada para cada gesto, con los valores por defecto de la tarjeta. */
  private _actionFor(actionType: string): ActionConfig {
    if (actionType === 'hold') return this._config?.hold_action || { action: 'more-info' };
    if (actionType === 'double_tap') return this._config?.double_tap_action || { action: 'none' };
    return this._config?.tap_action || { action: 'toggle' };
  }

  private _handleAction(actionType: string): void {
    if (this._config?.confirm_open !== false) {
      const action = this._actionFor(actionType);
      const state = resolveLockState(this._config, this.hass);
      // Si la cerradura soporta varias órdenes (desbloquear/bloquear Y abrir),
      // se pregunta cuál; si solo hay una que abre, se pide confirmación.
      // Cerrar una cerradura sin función de abrir no pregunta.
      const choices = lockChoices(action, state, lockSupportsOpen(this._stateObj?.attributes));
      if (choices.length) {
        this._askConfirm(actionType, choices);
        return;
      }
      if (isOpeningAction(action, state)) {
        this._askConfirm(actionType, []);
        return;
      }
    }
    this._execute(actionType);
  }

  /** Enciende el halo en espera del cambio de estado (ver `ACTION_PENDING_MS`). */
  private _startPending(): void {
    this._pendingUntil = performance.now() + ACTION_PENDING_MS;
    this._schedulePendingEnd(ACTION_PENDING_MS);
    this.requestUpdate();
  }

  /** Lanza directamente la orden elegida (`lock.lock`, `lock.unlock` o `lock.open`). */
  private _runCommand(command: LockCommand): void {
    if (!this._config?.entity || !this.hass) return;
    this._startPending();
    void this.hass.callService('lock', command, { entity_id: this._config.entity });
  }

  private _execute(actionType: string): void {
    // Si la acción opera la cerradura, el halo se enciende ya y espera el
    // cambio de estado (ver `ACTION_PENDING_MS`); no hay entidad válida a la
    // que accionar si está en `error`.
    if (OPERATING_ACTIONS.includes(this._actionFor(actionType).action) && resolveLockState(this._config, this.hass) !== 'error') {
      this._startPending();
    }
    dispatchHassAction(
      this,
      {
        entity: this._config?.entity,
        tap_action: this._actionFor('tap'),
        hold_action: this._actionFor('hold'),
        double_tap_action: this._actionFor('double_tap'),
      },
      actionType
    );
  }

  private _askConfirm(actionType: string, choices: LockCommand[]): void {
    this._confirm = { actionType, choices };
    clearTimeout(this._confirmTimer);
    this._confirmTimer = setTimeout(() => this._cancelConfirm(), CONFIRM_TIMEOUT_MS);
    this.requestUpdate();
  }

  /** Acepta la pregunta: con elección se lanza la orden elegida; sin ella, la acción original. */
  private _acceptConfirm(command?: LockCommand): void {
    const pending = this._confirm;
    this._dropConfirm();
    this.requestUpdate();
    if (!pending) return;
    if (command) this._runCommand(command);
    else this._execute(pending.actionType);
  }

  private _cancelConfirm(): void {
    this._dropConfirm();
    this.requestUpdate();
  }

  /** Cierra la vista sin pedir render (para usarlo también desde `willUpdate`). */
  private _dropConfirm(): void {
    clearTimeout(this._confirmTimer);
    this._confirm = undefined;
  }

  /**
   * La vista «¿Abrir?» cuelga encima del contenido y recoge sus propios
   * gestos: sin cortar la propagación, el clic en un botón llegaría al
   * `ha-card` y se interpretaría como otra pulsación (y otra confirmación).
   */
  private _renderConfirm(): TemplateResult {
    const stop = (ev: Event) => ev.stopPropagation();
    const choices = this._confirm?.choices ?? [];
    const multi = choices.length > 1;
    const title = this._t(multi ? 'confirm_choose' : 'confirm_title');
    return html`
      <div
        class="confirm ${multi ? 'confirm--multi' : ''}"
        role="alertdialog"
        aria-label=${title}
        @pointerdown=${stop}
        @pointerup=${stop}
        @pointercancel=${stop}
        @click=${stop}
        @keydown=${(ev: KeyboardEvent) => {
          if (ev.key === 'Escape') this._cancelConfirm();
        }}
      >
        <div class="confirm-text">
          <span class="confirm-title">${title}</span>
          <span class="confirm-name">${this._name}</span>
        </div>
        <div class="confirm-actions">
          <button type="button" class="confirm-btn cancel" aria-label=${this._t('confirm_cancel')} title=${this._t('confirm_cancel')} @click=${() => this._cancelConfirm()}>${multi ? html`<ha-icon icon="mdi:close"></ha-icon>` : this._t('confirm_cancel')}</button>
          ${multi
            ? choices.map(
                (command) => html`<button type="button" class="confirm-btn accept" data-command=${command} @click=${() => this._acceptConfirm(command)}>${this._t(`command_${command}`)}</button>`
              )
            : html`<button type="button" class="confirm-btn accept" @click=${() => this._acceptConfirm()}>${this._t('confirm_accept')}</button>`}
        </div>
      </div>
    `;
  }

  private _t(key: keyof LockTranslations): string {
    return localize(this.hass, LOCK_TRANSLATIONS, key);
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    const colors = resolveGradientColors(this._config);
    const state = resolveLockState(this._config, this.hass);
    const subtitle = this._subtitle(state);
    const hasDoubleTap = !!this._config.double_tap_action && this._config.double_tap_action.action !== 'none';

    return html`
      <ha-card
        class="neon-ring-host ${isLockHaloOn(state) || this._isPending() || this._confirm ? 'neon-halo-active' : ''} ${isLockAlert(state) ? 'neon-halo-error' : ''} ${isLockMoving(state) ? 'lock-moving' : ''}"
        style=${neonHaloVars(colors)}
        @pointerdown=${(ev: PointerEvent) => handlePointerDown(this._gesture, ev, '.-none-', () => this._handleAction('hold'))}
        @pointerup=${() => cancelHold(this._gesture)}
        @pointercancel=${() => cancelHold(this._gesture)}
        @click=${(ev: MouseEvent) =>
          handleClick(this._gesture, ev, '.-none-', {
            onTap: () => this._handleAction('tap'),
            onDoubleTap: () => this._handleAction('double_tap'),
            hasDoubleTap,
          })}
      >
        ${neonRingSplitTemplate(this._ringUid, this._ring.size.width, this._ring.size.height, this._ring.size.radius)}
        <div class="content">
          ${isLockAlert(state)
            ? html`<ha-icon class="neon-halo-icon" icon=${ERROR_ICON}></ha-icon>`
            : this._iconDef.template(isLockOpenPose(state))}
          <div class="text">
            <span class="name">${this._name}</span>
            ${subtitle !== nothing ? html`<span class="subtitle">${subtitle}</span>` : nothing}
          </div>
        </div>
      ${this._confirm ? this._renderConfirm() : nothing}
      </ha-card>
    `;
  }

  /**
   * Cuando la entidad cambia de estado (la accionó esta tarjeta, otra, la
   * app de HA, una automatización o el propio dispositivo) manda el
   * estado: la espera de `_pendingUntil` se da por terminada. No cuenta el
   * primer estado que se ve, cambiar de entidad en la config ni volver de
   * `error`.
   */
  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    const state = resolveLockState(this._config, this.hass);
    if (!state || state === 'error') {
      this._lastSeen = undefined;
      this._dropConfirm();
      return;
    }
    const entity = this._config?.entity;
    const last = this._lastSeen;
    if (last && last.entity === entity && last.state !== state) {
      this._pendingUntil = 0;
      // Si la cerradura cambia mientras se pregunta, la pregunta ya no vale.
      this._dropConfirm();
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

  private _paintIcon(s: number): void {
    if (this._iconEl) this._iconDef.paint(this._iconEl, s);
  }

  /** Tras cada render: lleva el icono a la pose del estado actual y lo repinta. */
  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    // Al abrirse la vista «¿Abrir?» el foco va a «Cancelar»: así Intro o
    // Espacio no abren la cerradura por accidente.
    if (this._confirm && !this._confirmFocused) {
      this._confirmFocused = true;
      this.renderRoot.querySelector<HTMLElement>('.confirm .cancel')?.focus();
    } else if (!this._confirm) {
      this._confirmFocused = false;
    }
    const svg = this.renderRoot.querySelector<SVGElement>('svg.lock-icon') ?? undefined;
    if (!svg) {
      this._iconEl = undefined;
      return;
    }
    const open = isLockOpenPose(resolveLockState(this._config, this.hass));
    if (svg !== this._iconEl) {
      this._iconEl = svg;
      this._pose.durationMs = this._iconDef.durationMs;
      this._pose.snap(open);
    } else {
      this._pose.set(open);
    }
    this._paintIcon(this._pose.value());
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Si se reconecta a mitad de la espera de un cambio de estado, se
    // retoma desde el reloj: nada se queda a medias.
    const remaining = this._pendingUntil - performance.now();
    if (remaining > 0) this._schedulePendingEnd(remaining);
    this._pose.set(isLockOpenPose(resolveLockState(this._config, this.hass)));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this._pendingTimer);
    this._dropConfirm();
    this._pose.dispose();
  }
}
