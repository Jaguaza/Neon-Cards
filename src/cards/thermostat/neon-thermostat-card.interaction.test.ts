// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Card = HTMLElement & {
  setConfig(c: unknown): void;
  hass: unknown;
  updateComplete: Promise<boolean>;
  _handleModeSelect(mode: string): void;
};
type Call = [string, string, Record<string, unknown>];

const CALOR = 'climate.salon_calor';
const FRIO = 'climate.salon_frio';

const climate = (id: string, mode: string, hvac_modes: string[]) => ({
  entity_id: id,
  state: mode,
  last_changed: '',
  last_updated: '',
  attributes: { hvac_modes, current_temperature: 21, temperature: 22, min_temp: 7, max_temp: 35, target_temp_step: 0.5, friendly_name: id },
});

/** hass con las dos entidades en los modos indicados y un registro de TODAS las llamadas a servicios. */
function hassWith(modes: { calor: string; frio: string }, calls: Call[]) {
  return {
    language: 'es',
    locale: { language: 'es' },
    callService: (domain: string, service: string, data: Record<string, unknown>) => {
      calls.push([domain, service, data]);
      return Promise.resolve();
    },
    states: {
      [CALOR]: climate(CALOR, modes.calor, ['off', 'heat']),
      [FRIO]: climate(FRIO, modes.frio, ['off', 'cool']),
    },
  };
}

async function mount(modes: { calor: string; frio: string }, calls: Call[]): Promise<Card> {
  await import('./index');
  const el = document.createElement('neon-thermostat-card') as Card;
  el.setConfig({ entity: CALOR, entity_2: FRIO });
  el.hass = hassWith(modes, calls);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('la tarjeta solo envía órdenes cuando el usuario interactúa con ella', () => {
  it('un cambio de modo hecho FUERA de la tarjeta (diálogo, automatización, voz…) no provoca ninguna llamada a un servicio', async () => {
    const calls: Call[] = [];
    const el = await mount({ calor: 'heat', frio: 'off' }, calls);
    // El frío pasa a «cool» desde fuera mientras el calor sigue en «heat»: antes la tarjeta apagaba el calor.
    el.hass = hassWith({ calor: 'heat', frio: 'cool' }, calls);
    await el.updateComplete;
    expect(calls).toEqual([]);
  });

  it('tampoco lo hace en ningún otro cambio externo ni al reconectar la tarjeta', async () => {
    const calls: Call[] = [];
    const el = await mount({ calor: 'off', frio: 'cool' }, calls);
    for (const modes of [
      { calor: 'heat', frio: 'cool' },
      { calor: 'heat', frio: 'off' },
      { calor: 'off', frio: 'cool' },
      { calor: 'heat', frio: 'cool' },
    ]) {
      el.hass = hassWith(modes, calls);
      await el.updateComplete;
    }
    el.remove();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(calls).toEqual([]);
  });

  it('renderizar o recibir actualizaciones de hass sin cambios no envía nada', async () => {
    const calls: Call[] = [];
    const el = await mount({ calor: 'heat', frio: 'cool' }, calls);
    for (let i = 0; i < 5; i++) {
      el.hass = hassWith({ calor: 'heat', frio: 'cool' }, calls);
      await el.updateComplete;
    }
    expect(calls).toEqual([]);
  });

  describe('al elegir el modo EN la tarjeta (acción directa del usuario)', () => {
    it('la exclusión se mantiene: el equipo dueño del modo lo recibe y el otro, si estaba en un modo distinto, se apaga', async () => {
      const calls: Call[] = [];
      const el = await mount({ calor: 'heat', frio: 'off' }, calls);
      el._handleModeSelect('cool');
      expect(calls).toHaveLength(2);
      expect(calls).toContainEqual(['climate', 'set_hvac_mode', { entity_id: FRIO, hvac_mode: 'cool' }]);
      expect(calls).toContainEqual(['climate', 'set_hvac_mode', { entity_id: CALOR, hvac_mode: 'off' }]);
    });

    it('si el otro equipo ya estaba apagado no se le envía nada', async () => {
      const calls: Call[] = [];
      const el = await mount({ calor: 'off', frio: 'off' }, calls);
      el._handleModeSelect('heat');
      expect(calls).toEqual([['climate', 'set_hvac_mode', { entity_id: CALOR, hvac_mode: 'heat' }]]);
    });
  });
});
