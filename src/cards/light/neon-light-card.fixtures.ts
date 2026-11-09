/**
 * Apoyo común de los tests de la Light card: montaje de la tarjeta en jsdom
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
  /** Si se da, `callService` lo rechaza con este error. */
  reject?: Error;
}

/** Atributos de una luz con brillo, temperatura de color, color y efectos. */
export const FULL_LIGHT = {
  supported_color_modes: ['color_temp', 'hs'],
  min_color_temp_kelvin: 2000,
  max_color_temp_kelvin: 6500,
  effect_list: ['rainbow', 'pulse'],
};

export function hassWith(state: string, options: FakeHassOptions = {}) {
  const { language = 'es', attributes = {}, calls = [], extraStates = {}, reject } = options;
  const states: Record<string, unknown> = {
    'light.sala': { entity_id: 'light.sala', state, last_changed: '', last_updated: '', attributes: { friendly_name: 'Luz sala', ...attributes } },
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

export async function mount(config: Record<string, unknown>, hass: unknown = hassWith('on', { attributes: FULL_LIGHT })): Promise<Card> {
  await import('./index');
  const el = document.createElement('neon-light-card') as Card;
  el.setConfig({ entity: 'light.sala', ...config });
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const root = (el: Card) => el.shadowRoot!;
export const card = (el: Card) => root(el).querySelector('ha-card')!;
export const subtitle = (el: Card) => root(el).querySelector('.subtitle')?.textContent?.trim();
export const iconName = (el: Card) => root(el).querySelector('.icon-base')?.getAttribute('icon');
export const fill = (el: Card) => root(el).querySelector<HTMLElement>('.light-icon')!.style.getPropertyValue('--fill');
export const lightColor = (el: Card) => root(el).querySelector<HTMLElement>('.light-icon')!.style.getPropertyValue('--light-color');
export const active = (el: Card) => card(el).classList.contains('neon-halo-active');
export const errored = (el: Card) => card(el).classList.contains('neon-halo-error');
export const click = (el: Card) => card(el).dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
export const footerItems = (el: Card) => Array.from(root(el).querySelectorAll<HTMLElement>('.footer-buttons .foot-btn[data-item]')).map((b) => b.dataset.item);
export const footerButton = (el: Card, item: string) => root(el).querySelector<HTMLButtonElement>(`.foot-btn[data-item="${item}"]`)!;
export const slider = (el: Card) => root(el).querySelector<HTMLInputElement>('.control .slider');
export const closeButton = (el: Card) => root(el).querySelector<HTMLButtonElement>('.foot-btn[data-action="close"]')!;
export const view = (el: Card) => root(el).querySelector('.view');
export const effectButtons = (el: Card) => Array.from(root(el).querySelectorAll<HTMLButtonElement>('.view .effect'));

/** Mueve la barra y suelta: lanza `input` y luego `change`, como el navegador. */
export function dragSlider(input: HTMLInputElement, value: number): void {
  input.value = String(value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

export const nextButton = (el: Card) => root(el).querySelector<HTMLButtonElement>('.foot-btn[data-action="next"]');

/** jsdom no calcula layout: se fija la medida que tendría la tarjeta (ver `RingSizeController`, que descarta lecturas de 0 px y la conserva). */
export async function setCardWidth(el: Card, width: number): Promise<void> {
  const ring = (el as unknown as { _ring: { size: { width: number; height: number; radius: number } } })._ring;
  ring.size = { ...ring.size, width, height: 164 };
  (el as unknown as { requestUpdate(): void }).requestUpdate();
  await el.updateComplete;
}
