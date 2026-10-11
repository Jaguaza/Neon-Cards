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
    const paths = qa(el, '.trace, .glow-path');
    expect(paths.length).toBe(3);
    Array.from(paths).forEach((p) => expect(p.namespaceURI).toBe(SVG_NS));
  });

  it('el gráfico siempre se muestra, también con show_graph: false heredado de una config antigua', async () => {
    const el = await mount({ show_graph: false });
    expect(q(el, '.graph')).not.toBeNull();
    expect(qa(el, '.trace').length).toBeGreaterThan(0);
  });

  it('el degradado reparte los tres colores en tramos propios (ninguno queda reducido a un punto de paso)', async () => {
    const el = await mount({});
    const stops = Array.from(qa(el, 'linearGradient stop')).map((n) => (n as SVGElement).getAttribute('style') ?? '');
    expect(stops.length).toBe(6);
    const vars = stops.map((st) => /--neon-c([123])/.exec(st)![1]);
    expect(vars).toEqual(['1', '1', '2', '2', '3', '3']);
  });

  it('el resplandor lleva el mismo degradado de tres colores y un desenfoque SVG, no un color fijo', async () => {
    const el = await mount({});
    const glow = q(el, '.sweep .glow-path')!;
    const grad = q(el, 'linearGradient')!.id;
    expect(glow.getAttribute('stroke')).toBe(`url(#${grad})`);
    const filterUrl = glow.getAttribute('filter')!;
    const filter = q(el, `filter#${/#(.+)\)/.exec(filterUrl)![1]}`)!;
    expect(filter.namespaceURI).toBe(SVG_NS);
    expect(filter.querySelector('feGaussianBlur')).not.toBeNull();
  });

  it('con el efecto normal no hay resplandor ni capa animada', async () => {
    const el = await mount({ neon_effect: 'normal' });
    expect(qa(el, '.glow-path').length).toBe(0);
    expect(q(el, '.sweep')).toBeNull();
  });
});

describe('NeonSensorCard · efectos de color (solo gráfico e icono)', () => {
  it('por defecto es halo: gráfico en tres colores con desplazamiento', async () => {
    const el = await mount({});
    const card = q(el, 'ha-card')!;
    expect(card.classList.contains('neon-effect-halo')).toBe(true);
    expect(card.classList.contains('neon-halo-active')).toBe(true);
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

  it('un color: los tres colores iguales y con desplazamiento', async () => {
    const el = await mount({ neon_effect: 'single', neon_color: '#ff8800' });
    expect(q(el, 'ha-card')!.classList.contains('neon-effect-single')).toBe(true);
    expect(q(el, '.sweep')).not.toBeNull();
    const style = haCardStyle(el);
    expect(style).toContain('--neon-c1: #ff8800');
    expect(style).toContain('--neon-c2: #ff8800');
    expect(style).toContain('--neon-c3: #ff8800');
  });

  it('normal: color del tema, sin desplazamiento ni halo', async () => {
    const el = await mount({ neon_effect: 'normal' });
    const card = q(el, 'ha-card')!;
    expect(card.classList.contains('neon-effect-normal')).toBe(true);
    expect(card.classList.contains('neon-halo-active')).toBe(false);
    expect(q(el, '.sweep')).toBeNull();
    expect(q(el, '.graph')!.classList.contains('graph--static')).toBe(true);
    expect(qa(el, '.trace').length).toBe(1);
    expect(haCardStyle(el)).toContain('--neon-c1: var(--primary-color)');
  });
});

describe('NeonSensorCard · perímetro', () => {
  it('sin umbrales el perímetro se ve normal con cualquier efecto: sin aro, borde ni color de umbral', async () => {
    for (const neon_effect of ['halo', 'single', 'normal']) {
      const el = await mount({ neon_effect, neon_color: '#ff8800' });
      const card = q(el, 'ha-card')!;
      expect(card.classList.contains('has-edge')).toBe(false);
      expect(card.classList.contains('neon-ring-host')).toBe(false);
      expect(qa(el, '.neon-ring-path').length).toBe(0);
      expect(haCardStyle(el)).not.toContain('--neon-edge');
    }
  });

  it('con umbrales desactivados, los colores de nivel no tocan el perímetro', async () => {
    const el = await mount({ thresholds_enabled: false, threshold_low: 22, threshold_high: 26, threshold_colors: { high: '#ff0000' } }, '30');
    expect(q(el, 'ha-card')!.classList.contains('has-edge')).toBe(false);
    expect(haCardStyle(el)).not.toContain('--neon-edge');
  });

  it('sin señal con umbrales activados: perímetro neutro; sin umbrales, normal', async () => {
    const on = await mount({ thresholds_enabled: true, threshold_low: 22 }, 'unavailable');
    expect(q(on, 'ha-card')!.classList.contains('has-edge')).toBe(true);
    expect(haCardStyle(on)).toContain('--neon-edge: #e6e9f2');
    const off = await mount({}, 'unavailable');
    expect(q(off, 'ha-card')!.classList.contains('has-edge')).toBe(false);
  });
});

describe('NeonSensorCard · umbrales', () => {
  const th = { thresholds_enabled: true, threshold_low: 22, threshold_high: 26 };
  const label = (el: Card) => q(el, '.status')!.textContent!.trim();

  it('desactivados: no hay etiqueta de estado ni color de umbral', async () => {
    const el = await mount({ ...th, thresholds_enabled: false }, '30');
    expect(q(el, '.status')).toBeNull();
    expect(haCardStyle(el)).not.toContain('--neon-edge');
  });

  it('por debajo del mínimo: Bajo; el perímetro toma el color de bajo y el gráfico no cambia', async () => {
    const el = await mount({ ...th, threshold_colors: { low: '#0000ff' } }, '20');
    expect(label(el)).toBe('Bajo');
    expect(q(el, 'ha-card')!.classList.contains('has-edge')).toBe(true);
    expect(haCardStyle(el)).toContain('--neon-edge: #0000ff');
    expect(haCardStyle(el)).toContain('--neon-c1: #39e07a');
    expect(haCardStyle(el)).not.toContain('--neon-c1: #0000ff');
  });

  it('entre los dos umbrales: Correcto con su color en el perímetro', async () => {
    const el = await mount({ ...th, threshold_colors: { ok: '#123456' } }, '24');
    expect(label(el)).toBe('Correcto');
    expect(haCardStyle(el)).toContain('--neon-edge: #123456');
  });

  it('por encima del máximo: Alto; perímetro en su color y los tres colores del gráfico intactos', async () => {
    const el = await mount({ ...th, threshold_colors: { high: '#ff0000' } }, '28');
    expect(label(el)).toBe('Alto');
    expect(haCardStyle(el)).toContain('--neon-edge: #ff0000');
    expect(haCardStyle(el)).toContain('--neon-c1: #39e07a');
    expect(haCardStyle(el)).toContain('--neon-c2: #2dd6b8');
    expect(haCardStyle(el)).toContain('--neon-c3: #1ecdf2');
  });

  it('con efecto normal: el perímetro lo marca el umbral y el gráfico sigue en color del tema', async () => {
    const el = await mount({ ...th, neon_effect: 'normal', threshold_colors: { high: '#ff0000' } }, '28');
    expect(haCardStyle(el)).toContain('--neon-edge: #ff0000');
    expect(haCardStyle(el)).toContain('--neon-c1: var(--primary-color)');
    expect(q(el, '.sweep')).toBeNull();
  });
});

describe('NeonSensorCard · etiqueta de estado y nombres de umbral', () => {
  const th = { thresholds_enabled: true, threshold_low: 22, threshold_high: 26 };
  const label = (el: Card) => q(el, '.status')!.textContent!.trim();

  it('sin umbrales no se ve la etiqueta, con cualquier valor, efecto o sin señal', async () => {
    for (const state of ['20', '24', '30', 'unavailable']) {
      for (const neon_effect of ['halo', 'single', 'normal']) {
        const el = await mount({ neon_effect }, state);
        expect(q(el, '.status')).toBeNull();
        expect(q(el, '.dot')).toBeNull();
      }
    }
  });

  it('con umbrales la etiqueta aparece', async () => {
    const el = await mount(th, '24');
    expect(q(el, '.status')).not.toBeNull();
    expect(q(el, '.dot')).not.toBeNull();
  });

  it('cada nivel muestra el nombre elegido', async () => {
    const names = { low: 'Frío', ok: 'Confort', high: 'Calor' };
    expect(label(await mount({ ...th, threshold_names: names }, '20'))).toBe('Frío');
    expect(label(await mount({ ...th, threshold_names: names }, '24'))).toBe('Confort');
    expect(label(await mount({ ...th, threshold_names: names }, '28'))).toBe('Calor');
  });

  it('un nombre ausente, vacío o en blanco usa el texto por defecto', async () => {
    expect(label(await mount({ ...th, threshold_names: { high: 'Calor' } }, '20'))).toBe('Bajo');
    expect(label(await mount({ ...th, threshold_names: { low: '' } }, '20'))).toBe('Bajo');
    expect(label(await mount({ ...th, threshold_names: { ok: '   ' } }, '24'))).toBe('Correcto');
  });

  it('el nombre se recorta y solo cambia el nivel indicado', async () => {
    const el = await mount({ ...th, threshold_names: { high: '  Muy alto  ' } }, '28');
    expect(label(el)).toBe('Muy alto');
    expect(label(await mount({ ...th, threshold_names: { high: 'Calor' } }, '24'))).toBe('Correcto');
  });

  it('los nombres no se muestran si los umbrales están desactivados', async () => {
    const el = await mount({ ...th, thresholds_enabled: false, threshold_names: { high: 'Calor' } }, '28');
    expect(q(el, '.status')).toBeNull();
  });

  it('binary_sensor: «Alerta» por defecto en alto y nombre propio si se elige', async () => {
    const base = { entity: 'binary_sensor.puerta', thresholds_enabled: true, alert_state: 'on' };
    const mountBinary = async (extra: Record<string, unknown>, state: string) => {
      await import('./index');
      const el = document.createElement('neon-sensor-card') as Card;
      el.setConfig({ ...base, ...extra });
      el.hass = {
        states: { 'binary_sensor.puerta': { entity_id: 'binary_sensor.puerta', state, attributes: { device_class: 'door' }, last_changed: '', last_updated: '' } },
        locale: { language: 'es' },
        callService: async () => {},
        callWS: async () => ({}),
      };
      document.body.appendChild(el);
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 30));
      await el.updateComplete;
      return el;
    };
    expect(label(await mountBinary({}, 'on'))).toBe('Alerta');
    expect(label(await mountBinary({ threshold_names: { high: 'Abierta', ok: 'Cerrada' } }, 'on'))).toBe('Abierta');
    expect(label(await mountBinary({ threshold_names: { high: 'Abierta', ok: 'Cerrada' } }, 'off'))).toBe('Cerrada');
  });

  it('sin datos con umbrales: no hay etiqueta, pero el perímetro conserva su color', async () => {
    const el = await mount({ ...th, threshold_names: { low: 'Frío', ok: 'Confort', high: 'Calor' } }, 'unavailable');
    expect(q(el, '.status')).toBeNull();
    expect(q(el, 'ha-card')!.classList.contains('has-edge')).toBe(true);
    expect(haCardStyle(el)).toContain('--neon-edge: #e6e9f2');
  });

  it('un estado de texto con umbrales no se valora: ni etiqueta ni color de umbral', async () => {
    const el = await mount(th, 'cloudy');
    expect(q(el, '.status')).toBeNull();
    expect(q(el, 'ha-card')!.classList.contains('has-edge')).toBe(false);
  });

  it('con datos valorados la etiqueta y el color van juntos', async () => {
    const el = await mount({ ...th, threshold_colors: { high: '#ff0000' } }, '30');
    expect(label(el)).toBe('Alto');
    expect(haCardStyle(el)).toContain('--neon-edge: #ff0000');
  });
});

describe('NeonSensorCard · tamaños', () => {
  const grid = (el: Card) => (el as unknown as { getGridOptions(): Record<string, unknown> }).getGridOptions();

  async function mountSpy(config: Record<string, unknown>): Promise<{ el: Card; calls: number }> {
    await import('./index');
    const hass = makeHass();
    const state = { calls: 0 };
    const original = hass.callWS;
    hass.callWS = async () => {
      state.calls++;
      return original();
    };
    const el = document.createElement('neon-sensor-card') as Card;
    el.setConfig({ entity: 'sensor.temp', ...config });
    el.hass = hass;
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 50));
    await el.updateComplete;
    return { el, get calls() { return state.calls; } } as { el: Card; calls: number };
  }

  it('por defecto es mediano, con gráfico', async () => {
    const el = await mount({});
    expect(q(el, 'ha-card')!.classList.contains('size-normal')).toBe(true);
    expect(q(el, '.graph')).not.toBeNull();
  });

  it('mediano y grande llevan gráfico; el pequeño no', async () => {
    for (const [size, withGraph] of [['normal', true], ['large', true], ['compact', false]] as const) {
      const el = await mount({ size });
      expect(q(el, 'ha-card')!.classList.contains(`size-${size}`)).toBe(true);
      expect(q(el, '.graph') !== null).toBe(withGraph);
      expect(qa(el, '.trace').length > 0).toBe(withGraph);
    }
  });

  it('un tamaño desconocido cae al mediano', async () => {
    const el = await mount({ size: 'huge' });
    expect(q(el, 'ha-card')!.classList.contains('size-normal')).toBe(true);
  });

  it('el grid de HA: grande a 12 columnas, mediano 6, pequeño 3, alto automático', async () => {
    expect(grid(await mount({ size: 'large' }))).toEqual({ rows: 'auto', columns: 12, min_columns: 3 });
    expect(grid(await mount({ size: 'normal' }))).toEqual({ rows: 'auto', columns: 6, min_columns: 3 });
    expect(grid(await mount({ size: 'compact' }))).toEqual({ rows: 'auto', columns: 3, min_columns: 3 });
    expect(grid(await mount({}))).toEqual({ rows: 'auto', columns: 6, min_columns: 3 });
  });

  it('el pequeño no pide el histórico; el mediano sí', async () => {
    const compact = await mountSpy({ size: 'compact' });
    expect(compact.calls).toBe(0);
    const normal = await mountSpy({ size: 'normal' });
    expect(normal.calls).toBeGreaterThan(0);
  });

  it('el pequeño conserva todos los datos: nombre, valor, unidad, icono y etiqueta', async () => {
    const el = await mount({ size: 'compact', name: 'Tem. C.T.', thresholds_enabled: true, threshold_high: 20 }, '22');
    expect(q(el, '.name')!.textContent!.trim()).toBe('Tem. C.T.');
    expect(q(el, '.value')!.textContent!.trim()).toBe('22.0');
    expect(q(el, '.unit')!.textContent!.trim()).toBe('°C');
    expect(q(el, '.header > ha-icon.icon')).not.toBeNull();
    expect(q(el, '.status')!.textContent!.trim()).toBe('Alto');
  });

  it('el pequeño con umbrales sigue marcando el perímetro', async () => {
    const el = await mount({ size: 'compact', thresholds_enabled: true, threshold_high: 20, threshold_colors: { high: '#ff0000' } }, '22');
    expect(haCardStyle(el)).toContain('--neon-edge: #ff0000');
  });

  it('el icono va sin círculo en todos los tamaños: directo en la cabecera, con su halo de color', async () => {
    for (const size of ['compact', 'normal', 'large']) {
      const el = await mount({ size });
      expect(q(el, '.icon-ring')).toBeNull();
      const icon = q(el, '.header > ha-icon.icon')!;
      expect(icon.classList.contains('neon-halo-icon')).toBe(true);
    }
  });
});


describe('NeonSensorCard · subtítulo', () => {
  const subtitle = (el: Card) => q(el, '.kind')!.textContent!.trim();

  it('por defecto muestra «Sensor»', async () => {
    expect(subtitle(await mount({}))).toBe('Sensor');
  });

  it('con un subtítulo configurado muestra ese texto', async () => {
    expect(subtitle(await mount({ subtitle: 'Planta baja' }))).toBe('Planta baja');
  });

  it('un subtítulo vacío o solo con espacios vuelve al texto por defecto', async () => {
    expect(subtitle(await mount({ subtitle: '' }))).toBe('Sensor');
    expect(subtitle(await mount({ subtitle: '   ' }))).toBe('Sensor');
  });

  it('el subtítulo no cambia con el estado ni con los umbrales', async () => {
    const el = await mount({ subtitle: 'Garaje', thresholds_enabled: true, threshold_low: 22, threshold_high: 26 }, '30');
    expect(subtitle(el)).toBe('Garaje');
  });
});
