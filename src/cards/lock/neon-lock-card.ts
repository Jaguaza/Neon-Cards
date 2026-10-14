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
import { ACTION_FLASH_MS, ERROR_ICON } from './constants';
import { shacklePath } from './lock-geometry';
import { lockIconTemplate } from './lock-icon';
import { NEON_LOCK_ICON_STYLES } from './lock-icon.styles';
import { LockPoseAnimator } from './lock-pose-animator';
import { isLockAlert, isLockMoving, isLockOpenPose, resolveLockState } from './lock-state';
import { NEON_LOCK_CARD_STYLES } from './neon-lock-card.styles';
import { LOCK_TRANSLATIONS } from './translations';
import type { NeonLockCardConfig } from './types';

/**
 * Neón Lock Card
 * ------------------------------------------------------------
 * Creador: Jaguaza
 *
 * Tarjeta para entidades `lock` de Home Assistant: candado que se abre
 * y se cierra de verdad (el arco sube y gira) según el estado de la
 * cerradura y en reposo sin halo. El halo neón se enciende
 * al accionarla (pulsación de una acción o cerradura en movimiento) y
 * se apaga al terminar; rojo de alerta si se atasca o la entidad falla. Ver `src/cards/lock/README.md` para la especificación.
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
   * Instante (performance.now) hasta el que el halo está encendido por una
   * pulsación. Se guarda la MARCA DE TIEMPO y no un booleano: el halo se
   * decide comparando con el reloj en cada render, así que aunque el
   * temporizador de abajo no llegase a dispararse, cualquier actualización
   * de `hass` apaga el halo. El temporizador solo provoca el re-render.
   */
  private _flashUntil = 0;
  private _flashTimer?: ReturnType<typeof setTimeout>;
  /** Mueve el arco del candado (ver lock-pose-animator.ts). */
  private readonly _pose = new LockPoseAnimator((s) => this._paintShackle(s));
  private _shackleEl?: SVGPathElement;

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
      if (!config.entity) {
        console.warn('[neon-lock-card] falta `entity:` — la tarjeta se muestra como \"No disponible\".');
      } else if (!config.entity.startsWith('lock.')) {
        console.warn(`[neon-lock-card] entity (\"${config.entity}\") no es del dominio lock — se muestra como \"No disponible\".`);
      }
    }
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
    // Enciende el halo al accionar la cerradura — salvo que el gesto no
    // tenga acción (`none`) o no haya entidad válida a la que accionar.
    if (this._actionFor(actionType).action !== 'none' && resolveLockState(this._config, this.hass) !== 'error') {
      this._flashUntil = performance.now() + ACTION_FLASH_MS;
      this._scheduleFlashEnd(ACTION_FLASH_MS);
      this.requestUpdate();
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

  protected render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    const colors = resolveGradientColors(this._config);
    const state = resolveLockState(this._config, this.hass);
    const subtitle = this._subtitle(state);
    const hasDoubleTap = !!this._config.double_tap_action && this._config.double_tap_action.action !== 'none';

    return html`
      <ha-card
        class="neon-ring-host ${isLockMoving(state) || this._isFlashing() ? 'neon-halo-active' : ''} ${isLockAlert(state) ? 'neon-halo-error' : ''} ${isLockMoving(state) ? 'lock-moving' : ''}"
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
          ${state === 'error'
            ? html`<ha-icon class="neon-halo-icon" icon=${ERROR_ICON}></ha-icon>`
            : lockIconTemplate(isLockOpenPose(state))}
          <div class="text">
            <span class="name">${this._name}</span>
            ${subtitle !== nothing ? html`<span class="subtitle">${subtitle}</span>` : nothing}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _isFlashing(): boolean {
    return performance.now() < this._flashUntil;
  }

  private _scheduleFlashEnd(ms: number): void {
    clearTimeout(this._flashTimer);
    this._flashTimer = setTimeout(() => this.requestUpdate(), ms);
  }

  private _paintShackle(s: number): void {
    this._shackleEl?.setAttribute('d', shacklePath(s));
  }

  /** Tras cada render: lleva el arco a la pose del estado actual y lo repinta. */
  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    const path = this.renderRoot.querySelector<SVGPathElement>('path.shackle') ?? undefined;
    if (!path) {
      this._shackleEl = undefined;
      return;
    }
    const open = isLockOpenPose(resolveLockState(this._config, this.hass));
    if (path !== this._shackleEl) {
      // SVG recién creado (primer render o vuelta desde `error`): sin animar.
      this._shackleEl = path;
      this._pose.snap(open);
    } else {
      this._pose.set(open);
    }
    this._paintShackle(this._pose.value());
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Si se reconecta a mitad de un destello o de un movimiento, se retoman
    // desde el reloj: nada se queda a medias.
    const remaining = this._flashUntil - performance.now();
    if (remaining > 0) this._scheduleFlashEnd(remaining);
    this._pose.set(isLockOpenPose(resolveLockState(this._config, this.hass)));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this._flashTimer);
    this._pose.dispose();
  }
}
