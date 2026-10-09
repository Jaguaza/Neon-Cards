// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

const SVG_NS = 'http://www.w3.org/2000/svg';

describe('NeonSensorCard · gráfico', () => {
  it('los trazos son elementos SVG reales (namespace SVG), no HTML desconocido', async () => {
    await import('./index');
    const now = Date.now();
    const hass = {
      states: {
        'sensor.temp': {
          entity_id: 'sensor.temp',
          state: '20.6',
          attributes: { unit_of_measurement: '°C', friendly_name: 'Temp', device_class: 'temperature' },
          last_changed: '',
          last_updated: '',
        },
      },
      locale: { language: 'es' },
      callService: async () => {},
      callWS: async () => ({
        'sensor.temp': [
          { s: '20.1', lu: (now - 20 * 3_600_000) / 1000 },
          { s: '20.8', lu: (now - 10 * 3_600_000) / 1000 },
          { s: '20.6', lu: (now - 3_600_000) / 1000 },
        ],
      }),
    };
    const el = document.createElement('neon-sensor-card') as HTMLElement & {
      setConfig(c: unknown): void;
      hass: unknown;
      updateComplete: Promise<boolean>;
    };
    el.setConfig({ entity: 'sensor.temp' });
    el.hass = hass;
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 50));
    await el.updateComplete;

    const paths = el.shadowRoot!.querySelectorAll('.trace');
    expect(paths.length).toBe(2);
    for (const p of paths) {
      expect(p.namespaceURI).toBe(SVG_NS);
    }
  });
});
