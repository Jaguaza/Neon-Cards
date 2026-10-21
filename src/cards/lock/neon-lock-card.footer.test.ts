// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONFIRM_REVEAL_MS, STATUS_DOT_DEFAULTS } from './constants';
import { NEON_LOCK_CARD_STYLES } from './neon-lock-card.styles';
import { DOOR_DURATION_MS, doorLeafPath } from './icons/door';
import { GARAGE_ROLLER_DURATION_MS, rollerGeometry, slatsPath } from './icons/garage-roller';
import { GARAGE_SLIDING_DURATION_MS, panelPath, slidingGeometry } from './icons/garage-sliding';
import { click, hassWith, mount, xIcon } from './neon-lock-card.fixtures';
import type { Card } from './neon-lock-card.fixtures';

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('NeonLockCard', () => {
  describe('pie con hasta tres iconos informativos', () => {
    const items = (el: Card) => Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('.footer .item'));
    const iso = new Date().toISOString();
    const hass = (lockAttrs: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) => {
      const base = hassWith('locked', 'es', lockAttrs);
      (base.states as Record<string, unknown>)['lock.puerta'] = { ...(base.states['lock.puerta'] as object), last_changed: iso, last_updated: iso };
      return { ...base, states: { ...base.states, ...extra } };
    };
    const sensor = (id: string, state: string, attributes: Record<string, unknown> = {}) => ({ [id]: { entity_id: id, state, last_changed: iso, last_updated: iso, attributes } });

    it('sin footer_items no hay pie', async () => {
      expect(await mount({})).toSatisfy((el: Card) => !el.shadowRoot!.querySelector('.footer'));
    });

    it('muestra los tres datos, en el orden configurado, con su icono y su texto', async () => {
      const el = await mount(
        { footer_items: ['battery', 'door', 'last_user'], door_entity: 'binary_sensor.puerta' },
        hass({ battery_level: 85, changed_by: 'Jorge' }, sensor('binary_sensor.puerta', 'on'))
      );
      const rows = items(el);
      expect(rows.map((r) => r.dataset.type)).toEqual(['battery', 'door', 'last_user']);
      expect(rows.map((r) => r.querySelector('ha-icon')!.getAttribute('icon'))).toEqual(['mdi:battery-90', 'mdi:door-open', 'mdi:account']);
      expect(rows[0].querySelector('.item-value')!.textContent).toBe('85 %');
      expect(rows[1].querySelector('.item-value')!.textContent).toBe('Abierta');
      expect(rows[1].classList.contains('item--warn')).toBe(true);
      expect(rows[2].querySelector('.item-label')!.textContent).toBe('Último acceso');
      expect(rows[2].querySelector('.item-value')!.textContent).toMatch(/^Jorge · \d{1,2}:\d{2}$/);
    });

    it('un tipo repetido se ignora y se muestran como mucho tres', async () => {
      const el = await mount({ footer_items: ['battery', 'battery', 'door', 'last_user', 'door'], door_entity: 'binary_sensor.puerta' }, hass({ battery_level: 50 }, sensor('binary_sensor.puerta', 'off')));
      expect(items(el).map((r) => r.dataset.type)).toEqual(['battery', 'door', 'last_user']);
    });

    it('un dato sin información se muestra como «—», no desaparece', async () => {
      const el = await mount({ footer_items: ['battery', 'last_user'] }, hass());
      expect(items(el).map((r) => r.querySelector('.item-value')!.textContent)).toEqual(['—', '—']);
      expect(items(el).every((r) => r.classList.contains('item--muted'))).toBe(true);
    });

    it('el sensor de puerta ACTIVO (abierta) toma el color del estado «desbloqueada o abierta»; cerrado no lleva color', async () => {
      const cfg = { footer_items: ['door'] as never, door_entity: 'binary_sensor.puerta' };
      const style = (el: Card) => el.shadowRoot!.querySelector('.footer .item')!.getAttribute('style');
      expect(style(await mount(cfg, hass({}, sensor('binary_sensor.puerta', 'on'))))).toBe(`--item-color: ${STATUS_DOT_DEFAULTS.open}`);
      expect(style(await mount({ ...cfg, status_color_open: '#00aaff' }, hass({}, sensor('binary_sensor.puerta', 'on'))))).toBe('--item-color: #00aaff');
      expect(style(await mount({ ...cfg, status_color_open: '#00aaff', status_color_closed: '#ff00ff' }, hass({}, sensor('binary_sensor.puerta', 'off'))))).toBeNull();
      expect(style(await mount(cfg, hass({}, sensor('binary_sensor.puerta', 'unavailable'))))).toBeNull();
    });

    it('el color del icono de la puerta cambia con el sensor y con el color elegido', async () => {
      const cfg = { footer_items: ['door'] as never, door_entity: 'binary_sensor.puerta', status_color_open: '#00aaff' };
      const el = await mount(cfg, hass({}, sensor('binary_sensor.puerta', 'off')));
      const row = () => el.shadowRoot!.querySelector('.footer .item')!;
      expect(row().getAttribute('style')).toBeNull();
      el.hass = hass({}, sensor('binary_sensor.puerta', 'on'));
      await el.updateComplete;
      expect(row().getAttribute('style')).toBe('--item-color: #00aaff');
      expect(row().classList.contains('item--warn')).toBe(true);
      el.setConfig({ ...cfg, status_color_open: '#112233', entity: 'lock.puerta' });
      await el.updateComplete;
      expect(row().getAttribute('style')).toBe('--item-color: #112233');
    });

    it('batería y último acceso nunca llevan color de estado', async () => {
      const el = await mount({ footer_items: ['battery', 'last_user'], status_color_open: '#00aaff' }, hass({ battery_level: 85, changed_by: 'Jorge' }));
      expect(items(el).map((r) => r.getAttribute('style'))).toEqual([null, null]);
    });

    it('el color por defecto del dato activo en la hoja de estilos coincide con STATUS_DOT_DEFAULTS.open', () => {
      expect(NEON_LOCK_CARD_STYLES.cssText).toContain(`color: var(--item-color, ${STATUS_DOT_DEFAULTS.open});`);
    });

    it('batería baja en rojo', async () => {
      const el = await mount({ footer_items: ['battery'] }, hass({ battery_level: 12 }));
      expect(items(el)[0].classList.contains('item--alert')).toBe(true);
    });

    it('se actualiza cuando cambia el sensor', async () => {
      const el = await mount({ footer_items: ['door'], door_entity: 'binary_sensor.puerta' }, hass({}, sensor('binary_sensor.puerta', 'off')));
      expect(items(el)[0].querySelector('.item-value')!.textContent).toBe('Cerrada');
      el.hass = hass({}, sensor('binary_sensor.puerta', 'on'));
      await el.updateComplete;
      expect(items(el)[0].querySelector('.item-value')!.textContent).toBe('Abierta');
    });

    it('sigue visible mientras no hay confirmación y se oculta con ella, junto al resto del contenido', async () => {
      vi.useFakeTimers();
      const el = await mount({ footer_items: ['battery'] }, hass({ battery_level: 85 }));
      click(el);
      vi.advanceTimersByTime(CONFIRM_REVEAL_MS);
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.content')!.classList.contains('content--hidden')).toBe(true);
      expect(el.shadowRoot!.querySelector('.content .footer')).not.toBeNull();
    });
  });

  it('lock_icon por defecto o inválido es el candado', async () => {
    const def = await mount({});
    expect(def.shadowRoot!.querySelector('.shackle')).not.toBeNull();
    const bad = await mount({ lock_icon: 'puerta-rara' });
    expect(bad.shadowRoot!.querySelector('.shackle')).not.toBeNull();
  });

  it('lock_icon: door dibuja la puerta y la abre con su propia duración', async () => {
    vi.useFakeTimers();
    const el = await mount({ lock_icon: 'door' });
    const leaf = () => el.shadowRoot!.querySelector('.leaf')!.getAttribute('d');
    expect(el.shadowRoot!.querySelector('.shackle')).toBeNull();
    expect(leaf()).toBe(doorLeafPath(0));
    el.hass = hassWith('unlocked');
    await el.updateComplete;
    vi.advanceTimersByTime(DOOR_DURATION_MS / 2);
    expect(leaf()).not.toBe(doorLeafPath(0));
    expect(leaf()).not.toBe(doorLeafPath(1));
    vi.advanceTimersByTime(DOOR_DURATION_MS);
    expect(leaf()).toBe(doorLeafPath(1));
  });

  it('lock_icon: garage_roller enrolla la puerta', async () => {
    vi.useFakeTimers();
    const el = await mount({ lock_icon: 'garage_roller' });
    const slats = () => el.shadowRoot!.querySelector('.slats')!.getAttribute('d');
    expect(slats()).toBe(slatsPath(rollerGeometry(0).slats));
    el.hass = hassWith('unlocked');
    await el.updateComplete;
    vi.advanceTimersByTime(GARAGE_ROLLER_DURATION_MS + 50);
    expect(slats()).toBe(slatsPath(rollerGeometry(1).slats));
  });

  it('lock_icon: garage_sliding desliza el panel', async () => {
    vi.useFakeTimers();
    const el = await mount({ lock_icon: 'garage_sliding' });
    const panel = () => el.shadowRoot!.querySelector('.panel')!.getAttribute('d');
    expect(panel()).toBe(panelPath(slidingGeometry(0)));
    el.hass = hassWith('unlocked');
    await el.updateComplete;
    vi.advanceTimersByTime(GARAGE_SLIDING_DURATION_MS + 50);
    expect(panel()).toBe(panelPath(slidingGeometry(1)));
  });

  it('cambiar de icono desde la config coloca el nuevo en la pose actual sin animar', async () => {
    const el = await mount({}, hassWith('unlocked'));
    expect(el.shadowRoot!.querySelector('.shackle')).not.toBeNull();
    el.setConfig({ entity: 'lock.puerta', lock_icon: 'door' });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.shackle')).toBeNull();
    expect(el.shadowRoot!.querySelector('.leaf')!.getAttribute('d')).toBe(doorLeafPath(1));
  });

  it('con cualquier icono, entidad no disponible muestra mdi:close y no el dibujo', async () => {
    for (const lock_icon of ['door', 'garage_roller', 'garage_sliding']) {
      const el = await mount({ lock_icon }, hassWith('unavailable'));
      expect(el.shadowRoot!.querySelector('svg.lock-icon')).toBeNull();
      expect(xIcon(el)?.getAttribute('icon')).toBe('mdi:close');
    }
  });

  it('abrir-cerrar-abrir en ráfaga termina en la pose correcta con cada icono', async () => {
    for (const lock_icon of ['door', 'garage_roller', 'garage_sliding']) {
      vi.useFakeTimers();
      const el = await mount({ lock_icon });
      const fresh = await mount({ lock_icon }, hassWith('unlocked'));
      for (const state of ['unlocked', 'locked', 'unlocked', 'locked', 'unlocked']) {
        el.hass = hassWith(state);
        await el.updateComplete;
        vi.advanceTimersByTime(90);
      }
      vi.advanceTimersByTime(3000);
      expect(el.shadowRoot!.querySelector('svg.lock-icon')!.innerHTML).toBe(fresh.shadowRoot!.querySelector('svg.lock-icon')!.innerHTML);
      vi.useRealTimers();
    }
  });

  it('getStubConfig elige una lock de hass o un ejemplo', () => {
    const Ctor = customElements.get('neon-lock-card') as unknown as {
      getStubConfig(h?: unknown, e?: string[]): { entity: string };
    };
    expect(Ctor.getStubConfig(hassWith('locked')).entity).toBe('lock.puerta');
    expect(Ctor.getStubConfig(undefined, ['light.a', 'lock.b']).entity).toBe('lock.b');
    expect(Ctor.getStubConfig().entity).toBe('lock.example_lock');
  });
});
