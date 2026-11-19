// @vitest-environment jsdom
import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import type { HomeAssistant } from '../ha/types';
import { BaseNeonCard } from './base-card';

class TestCard extends BaseNeonCard {
  protected render() {
    return html``;
  }
}
customElements.define('neon-base-card-test', TestCard);

const hassWith = (themes?: { darkMode?: boolean }): HomeAssistant => ({ states: {}, themes, callService: async () => undefined });

async function mount(hass: HomeAssistant): Promise<TestCard> {
  const el = document.createElement('neon-base-card-test') as TestCard;
  document.body.appendChild(el);
  el.hass = hass;
  await el.updateComplete;
  return el;
}

describe('BaseNeonCard: marca de tema claro', () => {
  it('con tema claro (darkMode false) pone data-neon-light en el host', async () => {
    const el = await mount(hassWith({ darkMode: false }));
    expect(el.hasAttribute('data-neon-light')).toBe(true);
  });

  it('con tema oscuro no la pone', async () => {
    const el = await mount(hassWith({ darkMode: true }));
    expect(el.hasAttribute('data-neon-light')).toBe(false);
  });

  it('sin dato del tema se queda como en oscuro', async () => {
    const el = await mount(hassWith(undefined));
    expect(el.hasAttribute('data-neon-light')).toBe(false);
  });

  it('sigue al tema cuando cambia en caliente', async () => {
    const el = await mount(hassWith({ darkMode: true }));
    el.hass = hassWith({ darkMode: false });
    await el.updateComplete;
    expect(el.hasAttribute('data-neon-light')).toBe(true);
    el.hass = hassWith({ darkMode: true });
    await el.updateComplete;
    expect(el.hasAttribute('data-neon-light')).toBe(false);
  });
});
