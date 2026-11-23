/**
 * Apoyo común de los tests de la Cover card: montaje de la tarjeta en jsdom
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
}

/** `supported_features` de una persiana con abrir, cerrar, parar y fijar posición. */
export const BASIC_FEATURES = 1 | 2 | 4 | 8;
/** La misma con inclinación de lamas (abrir, cerrar y fijar inclinación). */
export const TILT_FEATURES = BASIC_FEATURES | 128;

export function hassWith(state: string, options: FakeHassOptions = {}) {
  const { language = 'es', attributes = {}, calls = [] } = options;
  return {
    locale: { language },
    states: {
      'cover.salon': {
        entity_id: 'cover.salon',
        state,
        last_changed: '',
        last_updated: '',
        attributes: { friendly_name: 'Persiana Salón', device_class: 'shutter', current_position: 72, supported_features: BASIC_FEATURES, ...attributes },
      },
    },
    callService: async (...args: unknown[]) => {
      calls.push(args);
    },
  };
}

export async function mount(config: Record<string, unknown> = {}, hass: unknown = hassWith('open')): Promise<Card> {
  await import('./index');
  const el = document.createElement('neon-cover-card') as Card;
  el.setConfig({ entity: 'cover.salon', ...config });
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

export const root = (el: Card) => el.shadowRoot!;
export const card = (el: Card) => root(el).querySelector('ha-card')!;
export const text = (el: Card, selector: string) => root(el).querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
