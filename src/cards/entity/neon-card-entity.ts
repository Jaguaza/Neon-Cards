import { html, css, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import {
  BaseNeonCard,
  createGestureState,
  handlePointerDown,
  cancelHold,
  handleClick,
  dispatchHassAction,
  computeInfoDisplay,
} from '../../core';
import type { GestureState, InfoOption } from '../../core';
import { CARD_AUTHOR, CARD_VERSION, NEON_PRESETS } from './constants';
import type { EntityItemConfig, GradientColors, NeonCardEntityConfig } from './types';

/**
 * Neón Card Entity
 * ------------------------------------------------------------
 * Creador: Jaguaza
 *
 * Tarjeta de tipo interruptor con un aro neón degradado de 3 colores.
 */
export class NeonCardEntity extends BaseNeonCard {
  static properties = {
    ...BaseNeonCard.properties,
    _config: { state: true },
  };

  private _config?: NeonCardEntityConfig;
  private _gestures = new Map<string, GestureState>();

  static styles = css`
    :host {
      display: block;
    }
    ha-card {
      box-sizing: border-box;
      padding: 16px 20px;
    }
    .grid {
      display: grid;
      gap: 20px;
      justify-items: stretch;
      width: 100%;
    }
    .item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 14px;
      min-width: 0;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
    }
    .item.split {
      justify-content: space-between;
      width: 100%;
    }
    .item.split .switch {
      order: 2;
    }
    .item.split .text {
      order: 1;
    }
    .item:hover .name {
      opacity: 0.8;
    }
    .text {
      display: flex;
      flex-direction: column;
      text-align: left;
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
    }
    .name {
      font-size: 14px;
      color: var(--primary-text-color, #e5e5e5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 0.2s ease;
    }
    .secondary {
      font-size: 12px;
      color: var(--secondary-text-color, #9a9a9a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .switch {
      position: relative;
      width: 64px;
      height: 34px;
      flex: 0 0 64px;
      display: inline-block;
      cursor: pointer;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
    }
    .track {
      position: absolute;
      inset: 0;
      border-radius: 34px;
      background: #2a2a31;
      box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06);
      transition: background 0.3s ease;
    }
    .knob {
      position: absolute;
      top: 6px;
      left: 6px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #34343b;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s ease;
    }
    .error-ring {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid #ff4444;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .neon {
      position: absolute;
      top: 0;
      left: 0;
      width: 64px;
      height: 34px;
      overflow: visible;
      pointer-events: none;
    }
    .ring-normal {
      stroke-dasharray: 50;
      stroke-dashoffset: 50;
      transition: stroke-dashoffset 0.9s ease-in-out;
    }
    .dot {
      position: absolute;
      top: -7px;
      left: 5px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ff4444;
      box-shadow: 0 0 5px #ff4444;
      transition: background 0.3s ease, box-shadow 0.3s ease;
    }
    input:checked ~ .track {
      background: #16241f;
    }
    input:checked ~ .knob {
      transform: translateX(30px);
      background: #34343b;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
    }
    input:checked ~ .error-ring {
      transform: translateX(30px);
    }
    input:checked ~ .neon .ring-normal {
      stroke-dashoffset: 0;
    }
    input:checked ~ .dot {
      background: var(--neon-c1);
      box-shadow: 0 0 6px var(--neon-c1);
    }
    .switch.unavailable {
      cursor: not-allowed;
    }
    .switch.unavailable .track {
      opacity: 0.6;
    }
    .switch.unavailable .knob {
      opacity: 0.5;
    }
    .switch.unavailable .ring-normal {
      opacity: 0 !important;
    }
    .switch.unavailable .error-ring {
      opacity: 1 !important;
    }
  `;

  static getConfigElement(): HTMLElement {
    return document.createElement('neon-card-entity-editor');
  }

  static getStubConfig(): NeonCardEntityConfig {
    return {
      entity: '',
      name: '',
      neon_palette: 'emerald',
      neon_color1: '#39e07a',
      neon_color2: '#2dd6b8',
      neon_color3: '#1ecdf2',
      show_status_dot: true,
      primary_info: 'name',
      secondary_info: 'none',
      tap_action: { action: 'more-info' },
      hold_action: { action: 'none' },
      double_tap_action: { action: 'none' },
    };
  }

  setConfig(config: NeonCardEntityConfig): void {
    if (!config.entity && !config.entities) {
      throw new Error("Debes definir 'entity' o 'entities' en la Neón Card Entity.");
    }
    this._config = config;
  }

  private get _entities(): EntityItemConfig[] {
    if (!this._config) return [];
    return this._config.entities ?? [{ entity: this._config.entity as string, name: this._config.name }];
  }

  private get _columns(): number {
    return this._config?.columns || this._entities.length || 1;
  }

  private get _hasSecondaryInfo(): boolean {
    return !!this._config?.secondary_info && this._config.secondary_info !== 'none';
  }

  private get _rows(): number {
    return Math.max(1, Math.ceil(this._entities.length / this._columns));
  }

  getCardSize(): number {
    // +1 si hay información secundaria: la fila ocupa más alto (dos
    // líneas de texto en vez de una) del que el tamaño base de
    // BaseNeonCard asume.
    return this._rows + (this._hasSecondaryInfo ? 1 : 0);
  }

  getGridOptions(): { rows: number; columns: number } {
    return {
      rows: this._rows + (this._hasSecondaryInfo ? 1 : 0),
      columns: 12,
    };
  }

  private _toggle(entityId: string): void {
    if (!this.hass) return;
    const [domain] = entityId.split('.');
    void this.hass.callService(
      domain === 'light' || domain === 'switch' ? domain : 'homeassistant',
      'toggle',
      { entity_id: entityId }
    );
  }

  private _handleAction(entityConfig: EntityItemConfig, actionType: string): void {
    dispatchHassAction(
      this,
      {
        entity: entityConfig.entity,
        tap_action: this._config?.tap_action || { action: 'more-info' },
        hold_action: this._config?.hold_action || { action: 'none' },
        double_tap_action: this._config?.double_tap_action || { action: 'none' },
      },
      actionType
    );
  }

  private _getGradientColors(): GradientColors {
    const palette = this._config?.neon_palette || 'emerald';
    if (palette !== 'custom' && NEON_PRESETS[palette]) {
      return NEON_PRESETS[palette];
    }
    return {
      c1: this._config?.neon_color1 || '#39e07a',
      c2: this._config?.neon_color2 || '#2dd6b8',
      c3: this._config?.neon_color3 || '#1ecdf2',
    };
  }

  private _gestureFor(entityId: string): GestureState {
    let state = this._gestures.get(entityId);
    if (!state) {
      state = createGestureState();
      this._gestures.set(entityId, state);
    }
    return state;
  }

  private _renderItem(ent: EntityItemConfig, i: number, c1: string, c2: string, c3: string): TemplateResult {
    const stateObj = this.hass?.states[ent.entity];
    const isOn = !!stateObj && stateObj.state === 'on';
    const isUnavailable = !stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown';
    const name = ent.name || stateObj?.attributes.friendly_name || ent.entity;
    const primaryInfo = ((this._config?.primary_info as InfoOption) || 'name') as InfoOption;
    const secondaryInfo = ((this._config?.secondary_info as InfoOption) || 'none') as InfoOption;
    const primaryText =
      stateObj && this.hass
        ? computeInfoDisplay(primaryInfo, name, stateObj.state, stateObj, this.hass)
        : `${ent.entity} (no disponible)`;
    const hasSecondary = !!stateObj && !!this.hass && secondaryInfo !== 'none';
    const secondaryText = hasSecondary ? computeInfoDisplay(secondaryInfo, name, stateObj!.state, stateObj!, this.hass!) : nothing;
    const isSplit = (this._config?.card_orientation ?? 'left') === 'right';
    const gesture = this._gestureFor(ent.entity);
    const hasDoubleTap = !!this._config?.double_tap_action && this._config.double_tap_action.action !== 'none';
    const showDot = this._config?.show_status_dot ?? true;

    return html`
      <div
        class="item ${isSplit ? 'split' : ''}"
        @pointerdown=${(ev: PointerEvent) => handlePointerDown(gesture, ev, '.switch', () => this._handleAction(ent, 'hold'))}
        @pointerup=${() => cancelHold(gesture)}
        @pointercancel=${() => cancelHold(gesture)}
        @click=${(ev: MouseEvent) =>
          handleClick(gesture, ev, '.switch', {
            onTap: () => this._handleAction(ent, 'tap'),
            onDoubleTap: () => this._handleAction(ent, 'double_tap'),
            hasDoubleTap,
          })}
      >
        <label class="switch ${isUnavailable ? 'unavailable' : ''}">
          <input
            type="checkbox"
            role="switch"
            .checked=${isOn}
            .disabled=${isUnavailable}
            @change=${() => this._toggle(ent.entity)}
          />
          <span class="track"></span>
          <span class="knob"></span>
          <span class="error-ring"></span>
          <svg class="neon" viewBox="0 0 64 34" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="neonGrad${i}" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color=${c1} />
                <stop offset="50%" stop-color=${c2} />
                <stop offset="100%" stop-color=${c3} />
              </linearGradient>
              <filter id="neonBlur${i}" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="0.8" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path
              class="ring-normal ring-normal-top"
              pathLength="50"
              d="M 1.5 17 A 15.5 15.5 0 0 1 17 1.5 L 47 1.5 A 15.5 15.5 0 0 1 62.5 17"
              fill="none"
              stroke="url(#neonGrad${i})"
              stroke-width="1.6"
              filter="url(#neonBlur${i})"
            />
            <path
              class="ring-normal ring-normal-bottom"
              pathLength="50"
              d="M 1.5 17 A 15.5 15.5 0 0 0 17 32.5 L 47 32.5 A 15.5 15.5 0 0 0 62.5 17"
              fill="none"
              stroke="url(#neonGrad${i})"
              stroke-width="1.6"
              filter="url(#neonBlur${i})"
            />
          </svg>
          ${showDot ? html`<span class="dot"></span>` : nothing}
        </label>
        <div class="text">
          <span class="name">${primaryText}</span>
          ${hasSecondary ? html`<span class="secondary">${secondaryText}</span>` : nothing}
        </div>
      </div>
    `;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    const { c1, c2, c3 } = this._getGradientColors();

    return html`
      <ha-card>
        <div
          class="grid"
          style="grid-template-columns: repeat(${this._columns}, minmax(0, 1fr)); --neon-c1: ${c1}; --neon-c2: ${c2}; --neon-c3: ${c3};"
        >
          ${this._entities.map((ent, i) => this._renderItem(ent, i, c1, c2, c3))}
        </div>
      </ha-card>
    `;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    // Limpia el estado de gestos de entidades que ya no están en la config
    // (evita timers colgados si se quita una entidad en el editor).
    const currentIds = new Set(this._entities.map((e) => e.entity));
    for (const id of this._gestures.keys()) {
      if (!currentIds.has(id)) this._gestures.delete(id);
    }
  }
}

export { CARD_AUTHOR, CARD_VERSION };
