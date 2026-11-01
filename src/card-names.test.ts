// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

interface RegisteredCard {
  type: string;
  name: string;
  description: string;
}

/** Nombre con el que cada tarjeta sale en el selector de tarjetas de Home Assistant. */
const EXPECTED_NAMES: Record<string, string> = {
  'neon-card-entity': 'Neón Entity Card',
  'neon-button-card': 'Neón Button Card',
  'neon-thermostat-card': 'Neón Thermostat Card',
  'neon-sensor-card': 'Neón Sensor Card',
  'neon-lock-card': 'Neón Lock Card',
  'neon-alarm-card': 'Neón Alarm Card',
};

async function registered(): Promise<RegisteredCard[]> {
  await import('./neon-cards');
  return (window as unknown as { customCards: RegisteredCard[] }).customCards;
}

describe('nombres de las tarjetas en el selector de Home Assistant', () => {
  it('cada tarjeta sale con su nombre acordado', async () => {
    const cards = await registered();
    const names = Object.fromEntries(cards.map((card) => [card.type, card.name]));
    expect(names).toEqual(EXPECTED_NAMES);
  });

  it('todas siguen el patrón «Neón <Tipo> Card»', async () => {
    for (const card of await registered()) expect(card.name, card.type).toMatch(/^Neón [A-Za-z]+ Card$/);
  });

  it('la descripción de ninguna tarjeta usa el nombre antiguo de la entity', async () => {
    for (const card of await registered()) expect(card.description, card.type).not.toContain('Card Entity');
  });

  it('el identificador de YAML de la entity no cambia: los dashboards existentes siguen funcionando', async () => {
    await registered();
    expect(customElements.get('neon-card-entity')).toBeDefined();
  });
});
