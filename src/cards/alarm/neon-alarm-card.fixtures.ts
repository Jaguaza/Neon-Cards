/**
 * Apoyo común de los tests de la Alarm card: montaje de la tarjeta en jsdom
 * con un `hass` simulado y consultas al DOM de su shadow root.
 */

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

export type Card = HTMLElement & {
  setConfig(c: unknown): void;
  hass: unknown;
  updateComplete: Promise<boolean>;
};

export interface FakeHassOptions {
  language?: string;
  attributes?: Record<string, unknown>;
  calls?: unknown[][];
  extraStates?: Record<string, { state: string; attributes?: Record<string, unknown> }>;
  /** Si se da, `callService` lo rechaza con este error (código incorrecto). */
  reject?: Error;
}

/** Bits de modos de armado: casa (1), fuera (2), noche (4), personalizado (16), vacaciones (32). */
export const ALL_MODES = 1 | 2 | 4 | 16 | 32;

export function hassWith(state: string, options: FakeHassOptions = {}) {
  const { language = 'es', attributes = {}, calls = [], extraStates = {}, reject } = options;
  const states: Record<string, unknown> = {
    'alarm_control_panel.casa': {
      entity_id: 'alarm_control_panel.casa',
      state,
      last_changed: '',
      last_updated: '',
      attributes: { friendly_name: 'Alarma casa', supported_features: ALL_MODES, ...attributes },
    },
  };
  for (const [id, extra] of Object.entries(extraStates)) {
    states[id] = { entity_id: id, state: extra.state, last_changed: '', last_updated: '', attributes: extra.attributes ?? {} };
  }
  return {
    locale: { language },
    states,
    callService: async (...args: unknown[]) => {
      calls.push(args);
      if (reject) throw reject;
    },
  };
}

export async function mount(config: Record<string, unknown>, hass: unknown = hassWith('disarmed')): Promise<Card> {
  await import('./index');
  const el = document.createElement('neon-alarm-card') as Card;
  el.setConfig({ entity: 'alarm_control_panel.casa', ...config });
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

export const card = (el: Card) => el.shadowRoot!.querySelector('ha-card')!;
export const shield = (el: Card) => el.shadowRoot!.querySelector('svg.alarm-icon');
export const status = (el: Card) => el.shadowRoot!.querySelector('.status-text')?.textContent?.trim();
export const statusState = (el: Card) => el.shadowRoot!.querySelector('.status')?.getAttribute('data-state');
export const subtitle = (el: Card) => el.shadowRoot!.querySelector('.subtitle')?.textContent?.trim();
export const active = (el: Card) => card(el).classList.contains('neon-halo-active');
export const click = (el: Card) => card(el).dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
export const view = (el: Card) => el.shadowRoot!.querySelector('.view');
export const viewButtons = (el: Card) => Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.view .view-btn:not(.cancel)'));
export const key = (el: Card, name: string) => el.shadowRoot!.querySelector<HTMLButtonElement>(`.key[data-key="${name}"]`)!;
