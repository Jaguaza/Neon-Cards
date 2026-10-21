/**
 * Apoyo común de los tests de la Lock card: montaje de la tarjeta en jsdom con un
 * `hass` simulado y consultas al DOM de su shadow root.
 */

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

export type Card = HTMLElement & {
  setConfig(c: unknown): void;
  hass: unknown;
  updateComplete: Promise<boolean>;
};

export function hassWith(state: string, language = 'es', attributes: Record<string, unknown> = {}, calls: unknown[][] = []) {
  return {
    locale: { language },
    states: { 'lock.puerta': { entity_id: 'lock.puerta', state, last_changed: '', last_updated: '', attributes: { friendly_name: 'Puerta', ...attributes } } },
    callService: async (...args: unknown[]) => {
      calls.push(args);
    },
  };
}

export async function mount(config: Record<string, unknown>, hass: unknown = hassWith('locked')): Promise<Card> {
  await import('./index');
  const el = document.createElement('neon-lock-card') as Card;
  el.setConfig({ entity: 'lock.puerta', ...config });
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

export const card = (el: Card) => el.shadowRoot!.querySelector('ha-card')!;
export const padlock = (el: Card) => el.shadowRoot!.querySelector('svg.lock-icon');
export const isOpen = (el: Card) => !!padlock(el)?.classList.contains('is-open');
export const errorIcon = (el: Card) => el.shadowRoot!.querySelector('ha-icon.neon-halo-icon')?.getAttribute('icon');
export const subtitle = (el: Card) => el.shadowRoot!.querySelector('.subtitle')?.textContent?.trim();
export const status = (el: Card) => el.shadowRoot!.querySelector('.status-text')?.textContent?.trim();
export const xIcon = (el: Card) => el.shadowRoot!.querySelector('ha-icon.neon-halo-icon');

export const shackleD = (el: Card) => el.shadowRoot!.querySelector('path.shackle')!.getAttribute('d');
export const active = (el: Card) => card(el).classList.contains('neon-halo-active');
export const click = (el: Card) => card(el).dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
