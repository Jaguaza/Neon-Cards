// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

const SVG_NS = 'http://www.w3.org/2000/svg';

type Card = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

function makeHass(state = '20.6') {
  const now = Date.now();
  return {
    states: {
      'sensor.temp': {
        entity_id: 'sensor.temp',
        state,
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
}

async function mount(config: Record<string, unknown>, state = '20.6'): Promise<Card> {
  await import('./index');
  const el = document.createElement('neon-sensor-card') as Card;
  el.setConfig({ entity: 'sensor.temp', ...config });
  el.hass = makeHass(state);
  document.body.appendChild(el);
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 50));
  await el.updateComplete;
  return el;
}

const q = (el: Card, sel: string) => el.shadowRoot!.querySelector(sel);
const qa = (el: Card, sel: string) => el.shadowRoot!.querySelectorAll(sel);
const haCardStyle = (el: Card) => (q(el, 'ha-card') as HTMLElement).getAttribute('style') ?? '';

describe('NeonSensorCard · gráfico', () => {
  it('los trazos son elementos SVG reales (namespace SVG), no HTML desconocido', async () => {
    const el = await mount({});
    const paths = qa(el, '.trace');
    expect(paths.length).toBe(2);
    for (const p of paths) expect(p.namespaceURI).toBe(SVG_NS);
  });

  it('el gráfico siempre se muestra, también con show_graph: false heredado de una config antigua', async () => {
    const el = await mount({ show_graph: false });
    expect(q(el, '.graph')).not.toBeNull();
    expect(qa(el, '.trace').length).toBeGreaterThan(0);
  });
});

describe('NeonSensorCard · efectos de color', () => {
  it('por defecto es halo: aro de tres colores, gráfico en tres colores y con desplazamiento', async () => {
    const el = await mount({});
    const card = q(el, 'ha-card')!;
    expect(card.classList.contains('neon-effect-halo')).toBe(true);
    expect(card.classList.contains('neon-ring-host')).toBe(true);
    expect(card.classList.contains('neon-halo-active')).toBe(true);
    expect(qa(el, '.neon-ring-path').length).toBe(2);
    expect(q(el, '.sweep')).not.toBeNull();
    expect(haCardStyle(el)).toContain('--neon-c1: #39e07a');
    expect(haCardStyle(el)).toContain('--neon-c2: #2dd6b8');
    expect(haCardStyle(el)).toContain('--neon-c3: #1ecdf2');
  });

  it('halo con paleta elegida', async () => {
    const el = await mount({ neon_effect: 'halo', neon_palette: 'cyberpunk' });
    expect(haCardStyle(el)).toContain('--neon-c1: #ff2a85');
    expect(haCardStyle(el)).toContain('--neon-c3: #7a00ff');
  });

  it('un color: los tres colores iguales, con desplazamiento y sin aro de tres colores', async () => {
    const el = await mount({ neon_effect: 'single', neon_color: '#ff8800' });
    const card = q(el, 'ha-card')!;
    expect(card.classList.contains('neon-effect-single')).toBe(true);
    expect(qa(el, '.neon-ring-path').length).toBe(0);
    expect(q(el, '.sweep')).not.toBeNull();
    const style = haCardStyle(el);
    expect(style).toContain('--neon-c1: #ff8800');
    expect(style).toContain('--neon-c2: #ff8800');
    expect(style).toContain('--neon-c3: #ff8800');
  });

  it('normal: color del tema, sin desplazamiento ni aro ni halo', async () => {
    const el = await mount({ neon_effect: 'normal' });
    const card = q(el, 'ha-card')!;
    expect(card.classList.contains('neon-effect-normal')).toBe(true);
    expect(card.classList.contains('neon-halo-active')).toBe(false);
    expect(qa(el, '.neon-ring-path').length).toBe(0);
    expect(q(el, '.sweep')).toBeNull();
    expect(q(el, '.graph')!.classList.contains('graph--static')).toBe(true);
    expect(qa(el, '.trace').length).toBe(1);
    expect(haCardStyle(el)).toContain('--neon-c1: var(--primary-color)');
  });
});

describe('NeonSensorCard · umbrales', () => {
  const th = { thresholds_enabled: true, threshold_low: 22, threshold_high: 26 };
  const label = (el: Card) => q(el, '.status')!.textContent!.trim();

  it('desactivados: texto Normal y colores del efecto', async () => {
    const el = await mount({ ...th, thresholds_enabled: false }, '30');
    expect(label(el)).toBe('Normal');
    expect(haCardStyle(el)).toContain('--neon-c1: #39e07a');
  });

  it('por debajo del mínimo: Bajo con el color de bajo', async () => {
    const el = await mount({ ...th, threshold_colors: { low: '#0000ff' } }, '20');
    expect(label(el)).toBe('Bajo');
    expect(haCardStyle(el)).toContain('--neon-c1: #0000ff');
    expect(haCardStyle(el)).toContain('--neon-c3: #0000ff');
  });

  it('entre los dos umbrales: Correcto', async () => {
    const el = await mount(th, '24');
    expect(label(el)).toBe('Correcto');
    expect(haCardStyle(el)).toContain('--neon-c1: #39e07a');
  });

  it('por encima del máximo: Alto con el color de alto', async () => {
    const el = await mount({ ...th, threshold_colors: { high: '#ff0000' } }, '28');
    expect(label(el)).toBe('Alto');
    expect(haCardStyle(el)).toContain('--neon-c2: #ff0000');
  });

  it('el color del nivel manda también en el modo normal (gráfico y estado)', async () => {
    const el = await mount({ ...th, neon_effect: 'normal', threshold_colors: { high: '#ff0000' } }, '28');
    expect(haCardStyle(el)).toContain('--neon-c1: #ff0000');
    expect(q(el, '.sweep')).toBeNull();
  });
});
