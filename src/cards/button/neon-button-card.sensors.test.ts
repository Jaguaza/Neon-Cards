// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { NEON_BUTTON_CARD_STYLES } from './neon-button-card.styles';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Card = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

const ent = (id: string, state: string, attributes: Record<string, unknown> = {}) => ({ entity_id: id, state, last_changed: '', last_updated: '', attributes });
const hass = {
  locale: { language: 'es' },
  callService: async () => undefined,
  states: {
    'light.ct': ent('light.ct', 'on', { friendly_name: 'C.T.' }),
    'sensor.temp': ent('sensor.temp', '23.06', { unit_of_measurement: '°C', device_class: 'temperature' }),
    'sensor.hum': ent('sensor.hum', '60.82', { unit_of_measurement: '%', device_class: 'humidity' }),
    'binary_sensor.mov': ent('binary_sensor.mov', 'off', { device_class: 'motion' }),
    'sensor.extra': ent('sensor.extra', '1', { unit_of_measurement: 'W' }),
  },
};

async function mount(sensors: unknown[]): Promise<Card> {
  await import('./index');
  const el = document.createElement('neon-button-card') as Card;
  el.setConfig({ entity: 'light.ct', sensors });
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

// Sin comentarios: los tests miran las declaraciones, no lo que dicen las notas del CSS.
const css = NEON_BUTTON_CARD_STYLES.cssText.replace(/\/\*[\s\S]*?\*\//g, '');
/** Declaraciones de la primera regla con ese selector exacto (o de la que sigue a `after`). */
function rule(selector: string, after = ''): string {
  const from = after ? css.indexOf(after) : 0;
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(css.slice(from));
  if (!match) throw new Error(`regla no encontrada: ${selector}`);
  return match[1];
}

describe('pie de sensores de la Button Card', () => {
  const three = [{ entity: 'sensor.temp', decimals: 2 }, { entity: 'sensor.hum', decimals: 2 }, { entity: 'binary_sensor.mov' }];

  it('con tres sensores solo el segundo y el tercero llevan separador, y la fila no lleva estilo en línea', async () => {
    const row = (await mount(three)).shadowRoot!.querySelector('.sensors')!;
    expect(Array.from(row.querySelectorAll('.sensor')).map((s) => s.classList.contains('sensor--divided'))).toEqual([false, true, true]);
    expect(row.getAttribute('style')).toBeNull(); // sin rejilla de columnas fijas
    expect(row.classList.contains('sensors-single')).toBe(false);
  });

  it('cada valor separa el número de la unidad; sin unidad (binary_sensor) no hay .unit', async () => {
    const sensors = Array.from((await mount(three)).shadowRoot!.querySelectorAll('.sensor'));
    const parts = sensors.map((s) => [s.querySelector('.value .num')?.textContent, s.querySelector('.value .unit')?.textContent]);
    expect(parts).toEqual([['23.06', '°C'], ['60.82', '%'], ['off', undefined]]);
    expect(sensors[0].querySelector('.value')!.textContent!.trim()).toBe('23.06 °C'); // el texto accesible sigue siendo «23.06 °C»
  });

  it('con un solo sensor la fila es sensors-single y sin separador', async () => {
    const row = (await mount([{ entity: 'sensor.temp' }])).shadowRoot!.querySelector('.sensors')!;
    expect(row.classList.contains('sensors-single')).toBe(true);
    expect(row.querySelector('.sensor--divided')).toBeNull();
  });

  it('nunca pinta más de tres sensores', async () => {
    const row = (await mount([...three, { entity: 'sensor.extra' }])).shadowRoot!.querySelector('.sensors')!;
    expect(row.querySelectorAll('.sensor')).toHaveLength(3);
  });

  describe('contrato del CSS: el separador nunca puede tocar el contenido', () => {
    it('la fila es flex (huecos que se reparten el sobrante), no una rejilla de columnas iguales', () => {
      const sensors = rule('.sensors');
      expect(sensors).toContain('display: flex');
      expect(sensors).not.toContain('grid');
    });

    it('cada sensor ocupa su hueco entero, centra su contenido y lleva relleno a ambos lados, sin min-width: 0', () => {
      const sensor = rule('.sensor');
      expect(sensor).toContain('flex: 1 1 auto');
      expect(sensor).toContain('justify-content: center');
      expect(sensor).toMatch(/padding:\s*0 8px/);
      expect(sensor).not.toContain('min-width'); // un hueco no encoge por debajo de su contenido
    });

    it('el relleno solo va ENTRE sensores: ni el primero a la izquierda ni el último a la derecha, y el sensor único sin relleno', () => {
      expect(rule('.sensor:first-child')).toMatch(/padding-left:\s*0/);
      expect(rule('.sensor:last-child')).toMatch(/padding-right:\s*0/);
      expect(rule('.sensors.sensors-single .sensor')).toMatch(/padding:\s*0;/);
    });

    it('número y unidad son cajas separadas: la unidad pasa a una segunda línea recortada antes de recortar el número', () => {
      const value = rule('.sensor .value', '.top-sensor .value {');
      expect(value).toContain('display: flex');
      expect(value).toContain('flex-wrap: wrap');
      expect(value).toContain('height: 14px');
      expect(value).toContain('min-width: min-content');
      expect(rule('.sensor .num')).toContain('text-overflow: ellipsis');
      expect(rule('.sensor .unit')).toContain('white-space: nowrap');
    });

    it('el separador es el borde del hueco y no añade un relleno asimétrico', () => {
      const divided = rule('.sensor.sensor--divided');
      expect(divided).toContain('border-left');
      expect(divided).not.toContain('padding');
    });

    it('la regla base del valor mantiene el recorte con puntos suspensivos como último recurso', () => {
      const value = rule('.sensor .value,\n  .top-sensor .value');
      expect(value).toContain('overflow: hidden');
      expect(value).toContain('text-overflow: ellipsis');
    });

    it('en tarjeta muy estrecha el relleno baja, pero sigue siendo simétrico', () => {
      const narrow = rule('.sensor', '@container (max-width: 220px)');
      expect(narrow).toMatch(/padding:\s*0 4px/);
      expect(narrow).not.toContain('padding-left');
    });
  });
});
