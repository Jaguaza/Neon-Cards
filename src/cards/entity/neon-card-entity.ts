import type { HomeAssistant } from '../../ha/types';
import {
  CARD_AUTHOR,
  CARD_VERSION,
  DOUBLE_TAP_DELAY_MS,
  HOLD_DELAY_MS,
  NEON_PRESETS,
} from './constants';
import type { EntityItemConfig, GradientColors, NeonCardEntityConfig } from './types';

/**
 * Neón Card Entity
 * ------------------------------------------------------------
 * Creador: Jaguaza
 *
 * Tarjeta de tipo interruptor con un aro neón degradado de 3 colores.
 * Custom Element nativo (sin LitElement) — ver acuerdo nº10 ("sin magia").
 */
export class NeonCardEntity extends HTMLElement {
  private _config!: NeonCardEntityConfig;
  private _entities: EntityItemConfig[] = [];
  private _columns = 1;
  private _hass?: HomeAssistant;
  private _built = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

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
    this._entities = config.entities ?? [{ entity: config.entity as string, name: config.name }];
    this._columns = config.columns || this._entities.length || 1;
    this._render();
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    if (!this._built) {
      this._render();
      return;
    }
    this._entities.forEach((ent, i) => {
      const stateObj = hass.states[ent.entity];
      const isOn = !!stateObj && stateObj.state === 'on';
      const isUnavailable = !stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown';

      const input = this.shadowRoot!.getElementById(`input-${i}`) as HTMLInputElement | null;
      const label = this.shadowRoot!.getElementById(`label-${i}`);
      const switchEl = this.shadowRoot!.getElementById(`switch-${i}`);

      if (input) {
        input.checked = isOn;
        input.disabled = isUnavailable;
      }
      if (switchEl) switchEl.classList.toggle('unavailable', isUnavailable);
      if (label) {
        label.textContent = stateObj
          ? ent.name || stateObj.attributes.friendly_name || ent.entity
          : `${ent.entity} (no disponible)`;
      }
    });
  }

  getCardSize(): number {
    return 1;
  }

  getGridOptions(): { rows: number; columns: number } {
    return { rows: 1, columns: 12 };
  }

  private _toggle(entityId: string): void {
    if (!this._hass) return;
    const [domain] = entityId.split('.');
    void this._hass.callService(
      domain === 'light' || domain === 'switch' ? domain : 'homeassistant',
      'toggle',
      { entity_id: entityId }
    );
  }

  private _handleAction(entityConfig: EntityItemConfig, actionType: string): void {
    const actionConfig = {
      entity: entityConfig.entity,
      tap_action: this._config.tap_action || { action: 'more-info' },
      hold_action: this._config.hold_action || { action: 'none' },
      double_tap_action: this._config.double_tap_action || { action: 'none' },
    };

    const event = new CustomEvent('hass-action', {
      bubbles: true,
      composed: true,
      detail: {
        config: actionConfig,
        action: actionType,
      },
    });
    this.dispatchEvent(event);
  }

  private _getGradientColors(): GradientColors {
    const palette = this._config.neon_palette || 'emerald';
    if (palette !== 'custom' && NEON_PRESETS[palette]) {
      return NEON_PRESETS[palette];
    }
    return {
      c1: this._config.neon_color1 || '#39e07a',
      c2: this._config.neon_color2 || '#2dd6b8',
      c3: this._config.neon_color3 || '#1ecdf2',
    };
  }

  private _render(): void {
    this._built = true;
    const { c1, c2, c3 } = this._getGradientColors();

    const items = this._entities
      .map(
        (ent, i) => `
      <div class="item" id="item-${i}">
        <label class="switch" id="switch-${i}">
          <input id="input-${i}" type="checkbox" role="switch">
          <span class="track"></span>
          <span class="knob"></span>
          <span class="error-ring"></span>
          <svg class="neon" viewBox="0 0 64 34" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="neonGrad${i}" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="${c1}"/>
                <stop offset="50%" stop-color="${c2}"/>
                <stop offset="100%" stop-color="${c3}"/>
              </linearGradient>
              <filter id="neonBlur${i}" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="0.8" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <path class="ring-normal ring-normal-top" pathLength="50" d="M 1.5 17 A 15.5 15.5 0 0 1 17 1.5 L 47 1.5 A 15.5 15.5 0 0 1 62.5 17" fill="none" stroke="url(#neonGrad${i})" stroke-width="1.6" filter="url(#neonBlur${i})"/>
            <path class="ring-normal ring-normal-bottom" pathLength="50" d="M 1.5 17 A 15.5 15.5 0 0 0 17 32.5 L 47 32.5 A 15.5 15.5 0 0 0 62.5 17" fill="none" stroke="url(#neonGrad${i})" stroke-width="1.6" filter="url(#neonBlur${i})"/>
          </svg>
          <span class="dot"></span>
        </label>
        <span class="name" id="label-${i}">${ent.name || ent.entity}</span>
      </div>`
      )
      .join('');

    this.shadowRoot!.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { box-sizing: border-box; padding: 16px 20px; }
        .grid { display: grid; grid-template-columns: repeat(${this._columns}, minmax(0, auto)); gap: 20px; justify-items: start; width: 100%; }
        .item { display: flex; flex-direction: row; align-items: center; gap: 14px; min-width: 0; cursor: pointer; user-select: none; -webkit-user-select: none; }
        .item:hover .name { opacity: 0.8; }
        .name { font-size: 14px; color: var(--primary-text-color, #e5e5e5); text-align: left; flex: 1 1 auto; min-width: 0; transition: opacity 0.2s ease; }
        .switch { position: relative; width: 64px; height: 34px; flex: 0 0 64px; display: inline-block; cursor: pointer; }
        .switch input { opacity: 0; width: 0; height: 0; position: absolute; }
        .track { position: absolute; inset: 0; border-radius: 34px; background: #2a2a31; box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06); transition: background 0.3s ease; }
        .knob { position: absolute; top: 6px; left: 6px; width: 22px; height: 22px; border-radius: 50%; background: #34343b; box-shadow: 0 0 3px rgba(0, 0, 0, 0.5); transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s ease; }
        .error-ring { position: absolute; top: 3px; left: 3px; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #ff4444; opacity: 0; pointer-events: none; transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
        .neon { position: absolute; top: 0; left: 0; width: 64px; height: 34px; overflow: visible; pointer-events: none; }
        .ring-normal { stroke-dasharray: 50; stroke-dashoffset: 50; transition: stroke-dashoffset 0.9s ease-in-out; }

        .dot {
          position: absolute; top: -7px; left: 5px; width: 6px; height: 6px; border-radius: 50%;
          background: #ff4444; box-shadow: 0 0 5px #ff4444; transition: background 0.3s ease, box-shadow 0.3s ease;
        }

        input:checked ~ .track { background: #16241f; }
        input:checked ~ .knob { transform: translateX(30px); background: #34343b; box-shadow: 0 0 3px rgba(0, 0, 0, 0.5); }
        input:checked ~ .error-ring { transform: translateX(30px); }
        input:checked ~ .neon .ring-normal { stroke-dashoffset: 0; }

        input:checked ~ .dot {
          background: ${c1};
          box-shadow: 0 0 6px ${c1};
        }

        .switch.unavailable { cursor: not-allowed; }
        .switch.unavailable .track { opacity: 0.6; }
        .switch.unavailable .knob { opacity: 0.5; }
        .switch.unavailable .ring-normal { opacity: 0 !important; }
        .switch.unavailable .error-ring { opacity: 1 !important; }
      </style>
      <ha-card><div class="grid">${items}</div></ha-card>
    `;

    this._entities.forEach((ent, i) => {
      const input = this.shadowRoot!.getElementById(`input-${i}`) as HTMLInputElement;
      const itemRow = this.shadowRoot!.getElementById(`item-${i}`) as HTMLElement;

      input.addEventListener('change', () => this._toggle(ent.entity));

      let holdTimer: ReturnType<typeof setTimeout> | undefined;
      let isHoldActive = false;
      let lastTapTime = 0;
      let tapTimeout: ReturnType<typeof setTimeout> | undefined;

      itemRow.addEventListener('pointerdown', (ev) => {
        if ((ev.target as HTMLElement).closest('.switch')) return;
        isHoldActive = false;
        holdTimer = setTimeout(() => {
          isHoldActive = true;
          this._handleAction(ent, 'hold');
        }, HOLD_DELAY_MS);
      });

      const cancelHold = () => clearTimeout(holdTimer);
      itemRow.addEventListener('pointerup', cancelHold);
      itemRow.addEventListener('pointercancel', cancelHold);

      itemRow.addEventListener('click', (ev) => {
        if ((ev.target as HTMLElement).closest('.switch')) return;

        if (isHoldActive) {
          isHoldActive = false;
          return;
        }

        const now = Date.now();

        if (now - lastTapTime < DOUBLE_TAP_DELAY_MS) {
          clearTimeout(tapTimeout);
          lastTapTime = 0;
          this._handleAction(ent, 'double_tap');
        } else {
          lastTapTime = now;
          const hasDoubleTap = this._config.double_tap_action && this._config.double_tap_action.action !== 'none';
          if (hasDoubleTap) {
            tapTimeout = setTimeout(() => {
              this._handleAction(ent, 'tap');
            }, DOUBLE_TAP_DELAY_MS);
          } else {
            this._handleAction(ent, 'tap');
          }
        }
      });
    });
    if (this._hass) this.hass = this._hass;
  }
}

export { CARD_AUTHOR, CARD_VERSION };
