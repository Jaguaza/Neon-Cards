// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONFIRM_REVEAL_MS } from './constants';
import { resolveLockSize } from './lock-size';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Card = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };
type Editor = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

const hass = (state = 'locked') => ({
  locale: { language: 'es' },
  states: { 'lock.puerta': { entity_id: 'lock.puerta', state, last_changed: '', last_updated: '', attributes: { friendly_name: 'Puerta' } } },
  callService: async () => undefined,
});

async function mount(config: Record<string, unknown>, h: unknown = hass()): Promise<Card> {
  await import('./index');
  const el = document.createElement('neon-lock-card') as Card;
  el.setConfig({ entity: 'lock.puerta', ...config });
  el.hass = h;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

async function mountEditor(config: Record<string, unknown>): Promise<{ el: Editor; last: () => Record<string, unknown> }> {
  await import('./index');
  const el = document.createElement('neon-lock-card-editor') as Editor;
  let latest = config;
  el.addEventListener('config-changed', (ev) => {
    latest = (ev as CustomEvent).detail.config;
  });
  el.hass = { locale: { language: 'es' }, states: {} };
  el.setConfig(config);
  document.body.appendChild(el);
  await el.updateComplete;
  return { el, last: () => latest };
}

const q = (el: HTMLElement, sel: string) => el.shadowRoot!.querySelector(sel);
const cls = (c: Element) => (c.getAttribute('class') ?? '').split(' ')[0];

afterEach(() => {
  document.body.innerHTML = '';
});

describe('tamaño de la Lock Card', () => {
  it('por defecto es la grande (la tarjeta de siempre) y un valor desconocido también', () => {
    expect(resolveLockSize({})).toBe('large');
    expect(resolveLockSize({ size: 'medium' })).toBe('medium');
    expect(resolveLockSize({ size: 'compact' })).toBe('compact');
    expect(resolveLockSize({ size: 'xl' as never })).toBe('large');
  });

  describe('grande (sin cambios)', () => {
    it('conserva el diseño original: nombre con subtítulo y, a la derecha, el estado con los tres puntos', async () => {
      const el = await mount({ subtitle_type: 'custom', subtitle: 'Cerradura inteligente' });
      expect(q(el, 'ha-card')!.classList.contains('size-large')).toBe(true);
      const header = q(el, '.header')!;
      expect(Array.from(header.children).map(cls)).toEqual(['lock-icon', 'text', 'top-right']);
      expect(header.querySelector('.text .subtitle')!.textContent).toBe('Cerradura inteligente');
      expect(Array.from(header.querySelector('.top-right')!.children).map((c) => c.className)).toEqual(['status', 'menu']);
    });

    it('con la entidad no disponible reserva el hueco de los tres puntos', async () => {
      const el = await mount({}, hass('unavailable'));
      expect(q(el, '.top-right .menu-spacer')).not.toBeNull();
      expect(q(el, '.top-right .menu')).toBeNull();
    });

    it('size: large explícito es igual que no ponerlo', async () => {
      const el = await mount({ size: 'large' });
      expect(q(el, '.header .top-right')).not.toBeNull();
    });
  });

  describe('mediana', () => {
    it('no lleva subtítulo (ni con subtitle_type en la config) y el estado va bajo el nombre', async () => {
      const el = await mount({ size: 'medium', subtitle_type: 'custom', subtitle: 'Entrada' });
      expect(q(el, 'ha-card')!.classList.contains('size-medium')).toBe(true);
      expect(q(el, '.subtitle')).toBeNull();
      expect(el.shadowRoot!.textContent).not.toContain('Entrada');
      const header = q(el, '.header')!;
      expect(Array.from(header.children).map(cls)).toEqual(['lock-icon', 'text', 'menu']);
      expect(Array.from(header.querySelector('.text')!.children).map(cls)).toEqual(['name', 'status']);
      expect(q(el, '.text .status-text')!.textContent!.trim()).toBe('Cerrada');
      expect(q(el, '.top-right')).toBeNull();
    });

    it('con la entidad no disponible: «No disponible» bajo el nombre, sin tres puntos ni hueco reservado', async () => {
      const el = await mount({ size: 'medium' }, hass('unavailable'));
      expect(q(el, '.menu')).toBeNull();
      expect(q(el, '.menu-spacer')).toBeNull();
      expect(q(el, '.text .status-text')!.textContent!.trim()).toBe('No disponible');
    });

    it('el pie se pinta igual que en la grande', async () => {
      const el = await mount({ size: 'medium', footer_items: ['battery'] }, {
        ...hass(),
        states: { 'lock.puerta': { entity_id: 'lock.puerta', state: 'locked', last_changed: '', last_updated: '', attributes: { battery_level: 80 } } },
      });
      expect(q(el, '.footer .item')).not.toBeNull();
    });
  });

  describe('pie', () => {
    const hassFull = () => ({
      ...hass(),
      states: {
        'lock.puerta': { entity_id: 'lock.puerta', state: 'locked', last_changed: '2026-10-17T07:34:00Z', last_updated: '', attributes: { friendly_name: 'Puerta', battery_level: 80, changed_by: 'Jorge' } },
        'binary_sensor.d': { entity_id: 'binary_sensor.d', state: 'off', last_changed: '', last_updated: '', attributes: { device_class: 'door' } },
      },
    });
    const items = (el: Card) => Array.from(el.shadowRoot!.querySelectorAll('.footer .item')).map((i) => i.getAttribute('data-type'));

    it('la mediana muestra como mucho dos datos aunque haya tres configurados; la grande, tres', async () => {
      const cfg = { door_entity: 'binary_sensor.d', footer_items: ['battery', 'last_user', 'door'] };
      expect(items(await mount({ ...cfg, size: 'medium' }, hassFull()))).toEqual(['battery', 'last_user']);
      expect(items(await mount({ ...cfg, size: 'large' }, hassFull()))).toEqual(['battery', 'last_user', 'door']);
    });

    it('la mediana no pinta el sensor de puerta en el pie, pero sigue mostrando «Puerta abierta» en el estado', async () => {
      const h = hassFull();
      (h.states['binary_sensor.d'] as { state: string }).state = 'on';
      const unlocked = { ...h, states: { ...h.states, 'lock.puerta': { ...h.states['lock.puerta'], state: 'unlocked' } } };
      const el = await mount({ size: 'medium', door_entity: 'binary_sensor.d', footer_items: ['door', 'battery', 'last_user'] }, unlocked);
      expect(items(el)).toEqual(['battery', 'last_user']);
      expect(q(el, '.text .status-text')!.textContent!.trim()).toBe('Puerta abierta');
    });

    it('mediana: el último acceso lleva el nombre y la fecha en elementos propios (para apilarlos si no caben)', async () => {
      const el = await mount({ size: 'medium', footer_items: ['last_user'] }, hassFull());
      const value = q(el, '.item-value')!;
      expect(value.querySelector('.who')!.textContent).toBe('Jorge');
      expect(value.querySelector('.sep')).not.toBeNull();
      expect(value.querySelector('.when')!.textContent!.length).toBeGreaterThan(0);
      expect(value.textContent).toMatch(/^Jorge · /);
    });

    it('grande: el último acceso es un único texto, como siempre', async () => {
      const el = await mount({ size: 'large', footer_items: ['last_user'] }, hassFull());
      const value = q(el, '.item-value')!;
      expect(value.querySelector('.who')).toBeNull();
      expect(value.textContent).toMatch(/^Jorge · /);
    });
  });

  describe('compacta', () => {
    const SPY: { calls: unknown[][] } = { calls: [] };
    const hassOpen = (state = 'locked', features = 1) => ({
      locale: { language: 'es' },
      states: {
        'lock.puerta': { entity_id: 'lock.puerta', state, last_changed: '', last_updated: '', attributes: { friendly_name: 'Puerta', supported_features: features, battery_level: 80, changed_by: 'Jorge' } },
      },
      callService: async (...args: unknown[]) => {
        SPY.calls.push(args);
      },
    });
    const ask = async (el: Card) => {
      (q(el, 'ha-card') as HTMLElement).click();
      vi.advanceTimersByTime(CONFIRM_REVEAL_MS);
      await el.updateComplete;
    };
    const buttons = (el: Card) => Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.confirm .confirm-btn'));
    const iconOf = (b: Element) => b.querySelector('ha-icon')!.getAttribute('icon');

    beforeEach(() => {
      vi.useFakeTimers();
      SPY.calls = [];
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('solo muestra icono, nombre y estado más los tres puntos: sin pie y sin subtítulo (aunque estén en la config)', async () => {
      const el = await mount({ size: 'compact', footer_items: ['battery', 'last_user'], subtitle_type: 'custom', subtitle: 'Entrada' }, hassOpen());
      expect(q(el, 'ha-card')!.classList.contains('size-compact')).toBe(true);
      const header = q(el, '.header')!;
      expect(Array.from(header.children).map(cls)).toEqual(['lock-icon', 'text', 'menu']);
      expect(Array.from(header.querySelector('.text')!.children).map(cls)).toEqual(['name', 'status']);
      expect(q(el, '.name')!.textContent).toBe('Puerta');
      expect(q(el, '.status-text')!.textContent!.trim()).toBe('Cerrada');
      expect(q(el, '.menu')).not.toBeNull();
      expect(q(el, '.top-right')).toBeNull();
      expect(q(el, '.footer')).toBeNull();
      expect(q(el, '.subtitle')).toBeNull();
      expect(el.shadowRoot!.textContent).not.toContain('Entrada');
    });

    it('los tres puntos abren «más información» de la entidad y NO disparan la acción de la tarjeta ni su confirmación', async () => {
      const el = await mount({ size: 'compact' }, hassOpen('locked', 1));
      const events: { action: string; config: { entity?: string; tap_action?: { action: string } } }[] = [];
      el.addEventListener('hass-action', (ev) => events.push((ev as CustomEvent).detail));
      const menu = q(el, '.menu') as HTMLButtonElement;
      menu.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
      menu.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true }));
      menu.click();
      vi.advanceTimersByTime(CONFIRM_REVEAL_MS);
      await el.updateComplete;
      expect(events).toHaveLength(1);
      expect(events[0].config.entity).toBe('lock.puerta');
      expect(events[0].config.tap_action).toEqual({ action: 'more-info' });
      expect(q(el, '.confirm')).toBeNull();
      expect(SPY.calls).toHaveLength(0);
    });

    it('con la entidad no disponible: «No disponible» bajo el nombre', async () => {
      const el = await mount({ size: 'compact' }, hassOpen('unavailable'));
      expect(q(el, '.status-text')!.textContent!.trim()).toBe('No disponible');
      expect(q(el, '.menu')).toBeNull();
    });

    it('columnas de inicio: compacta 3, mediana 6 y grande 12 (por defecto es la grande)', async () => {
      const grid = async (size?: string) => (await mount(size ? { size } : {}, hassOpen())) as unknown as { getGridOptions(): unknown };
      expect((await grid('compact')).getGridOptions()).toEqual({ rows: 'auto', columns: 3, min_columns: 3 });
      expect((await grid('medium')).getGridOptions()).toEqual({ rows: 'auto', columns: 6, min_columns: 4 });
      expect((await grid('large')).getGridOptions()).toEqual({ rows: 'auto', columns: 12, min_columns: 4 });
      expect((await grid()).getGridOptions()).toEqual({ rows: 'auto', columns: 12, min_columns: 4 });
    });

    it('al pulsar una cerradura cerrada con función de abrir: iconos de candado y ningún texto', async () => {
      const el = await mount({ size: 'compact' }, hassOpen('locked', 1));
      await ask(el);
      const all = buttons(el);
      expect(all.map((b) => b.textContent!.trim())).toEqual(['', '', '']);
      expect(all.map(iconOf)).toEqual(['mdi:close', 'mdi:lock-open-variant', 'mdi:lock-open-outline']);
      expect(q(el, '.confirm-title')).toBeNull();
      expect(q(el, '.confirm-text')).toBeNull();
      expect(q(el, '.confirm-name')).toBeNull();
      // el texto sigue disponible para lectores de pantalla y como tooltip
      expect(all[1].getAttribute('aria-label')).toBe('Desbloquear');
      expect(all[2].getAttribute('aria-label')).toBe('Abrir');
      expect(all[1].getAttribute('title')).toBe('Desbloquear');
    });

    it('desbloqueada: candado cerrado para bloquear y el de abrir', async () => {
      const el = await mount({ size: 'compact' }, hassOpen('unlocked', 1));
      await ask(el);
      expect(buttons(el).map(iconOf)).toEqual(['mdi:close', 'mdi:lock', 'mdi:lock-open-outline']);
      expect(buttons(el)[1].getAttribute('aria-label')).toBe('Bloquear');
    });

    it('sin función de abrir: una sola pregunta, con el candado abierto como botón y sin texto', async () => {
      const el = await mount({ size: 'compact' }, hassOpen('locked', 0));
      await ask(el);
      const all = buttons(el);
      expect(all.map((b) => b.textContent!.trim())).toEqual(['', '']);
      expect(all.map(iconOf)).toEqual(['mdi:close', 'mdi:lock-open-variant']);
    });

    it('pulsar un icono lanza la orden (lock.unlock / lock.open) y cerrar la vista', async () => {
      const el = await mount({ size: 'compact' }, hassOpen('locked', 1));
      await ask(el);
      (q(el, '.confirm [data-command="unlock"]') as HTMLElement).click();
      await el.updateComplete;
      expect(SPY.calls.at(-1)).toEqual(['lock', 'unlock', { entity_id: 'lock.puerta' }]);
      expect(q(el, '.confirm')).toBeNull();

      const el2 = await mount({ size: 'compact' }, hassOpen('locked', 1));
      await ask(el2);
      (q(el2, '.confirm [data-command="open"]') as HTMLElement).click();
      expect(SPY.calls.at(-1)).toEqual(['lock', 'open', { entity_id: 'lock.puerta' }]);
    });

    it('la ✕ cancela sin lanzar ninguna orden', async () => {
      const el = await mount({ size: 'compact' }, hassOpen('locked', 1));
      await ask(el);
      (q(el, '.confirm .cancel') as HTMLElement).click();
      await el.updateComplete;
      expect(q(el, '.confirm')).toBeNull();
      expect(SPY.calls).toEqual([]);
    });

    it('mediana y grande siguen preguntando con texto', async () => {
      for (const size of ['medium', 'large']) {
        const el = await mount({ size }, hassOpen('locked', 1));
        await ask(el);
        expect(q(el, '.confirm-title')).not.toBeNull();
        expect(buttons(el).some((b) => b.textContent!.trim() === 'Desbloquear')).toBe(true);
      }
    });
  });

  describe('editor', () => {
    it('ofrece Compacta, Mediana y Grande; Grande (por defecto) no guarda la clave', async () => {
      const { el, last } = await mountEditor({ entity: 'lock.puerta' });
      const select = q(el, '#size') as HTMLSelectElement;
      expect(Array.from(select.options).map((o) => o.value)).toEqual(['compact', 'medium', 'large']);
      expect(select.value).toBe('large');
      select.value = 'medium';
      select.dispatchEvent(new Event('change'));
      expect(last().size).toBe('medium');
      await el.updateComplete;
      (q(el, '#size') as HTMLSelectElement).value = 'large';
      q(el, '#size')!.dispatchEvent(new Event('change'));
      expect('size' in last()).toBe(false);
    });

    describe('datos del pie', () => {
      const sw = (el: Editor, type: string) => q(el, `[data-footer="${type}"] ha-switch`) as (HTMLElement & { disabled: boolean }) | null;

      it('en la mediana solo hay interruptores de batería y último acceso, y ambos se pueden activar a la vez', async () => {
        const { el } = await mountEditor({ entity: 'lock.puerta', size: 'medium', footer_items: ['battery', 'last_user'] });
        expect(sw(el, 'door')).toBeNull();
        expect(sw(el, 'battery')!.disabled).toBeFalsy();
        expect(sw(el, 'last_user')!.disabled).toBeFalsy();
        expect(Array.from(el.shadowRoot!.querySelectorAll('[data-footer]')).map((c) => c.getAttribute('data-footer'))).toEqual(['battery', 'last_user']);
      });

      it('en la mediana el sensor de puerta se puede elegir, con el aviso de que no se muestra en el pie', async () => {
        const { el, last } = await mountEditor({ entity: 'lock.puerta', size: 'medium' });
        const warning = Array.from(el.shadowRoot!.querySelectorAll('.data-warning')).map((w) => w.textContent);
        expect(warning.some((t) => /no se muestra/i.test(t ?? '') && /puerta abierta/i.test(t ?? ''))).toBe(true);
        const picker = q(el, 'ha-entity-picker[label="Sensor de puerta"]') as HTMLElement;
        expect(picker).not.toBeNull();
        picker.dispatchEvent(new CustomEvent('value-changed', { detail: { value: 'binary_sensor.puerta' } }));
        expect(last().door_entity).toBe('binary_sensor.puerta');
      });

      it('en la mediana, tocar un interruptor conserva la puerta de footer_items por si se vuelve a la grande', async () => {
        const { el, last } = await mountEditor({ entity: 'lock.puerta', size: 'medium', footer_items: ['battery', 'last_user', 'door'] });
        const battery = sw(el, 'battery')!;
        (battery as unknown as { checked: boolean }).checked = false;
        battery.dispatchEvent(new Event('change'));
        expect(last().footer_items).toEqual(['last_user', 'door']);
      });

      it('en la grande hay tres tarjetas y se activan los tres datos, sin aviso de puerta', async () => {
        const { el, last } = await mountEditor({ entity: 'lock.puerta', footer_items: ['battery', 'last_user'] });
        expect(sw(el, 'door')!.disabled).toBeFalsy();
        const door = sw(el, 'door')!;
        (door as unknown as { checked: boolean }).checked = true;
        door.dispatchEvent(new Event('change'));
        expect(last().footer_items).toEqual(['battery', 'last_user', 'door']);
        expect(el.shadowRoot!.querySelectorAll('.data-warning').length).toBe(0);
      });

      it('la ayuda dice «hasta dos» solo en la mediana', async () => {
        const med = await mountEditor({ entity: 'lock.puerta', size: 'medium' });
        const large = await mountEditor({ entity: 'lock.puerta' });
        const hint = (e: Editor) => q(e, '[data-footer="battery"]')!.parentElement!.querySelector('.data-hint')!.textContent;
        expect(hint(med.el)).toMatch(/dos/i);
        expect(hint(large.el)).not.toMatch(/dos/i);
      });
    });

    it('en la compacta no hay subtítulo ni pie, pero se conserva el sensor de puerta', async () => {
      const { el } = await mountEditor({ entity: 'lock.puerta', size: 'compact' });
      expect(q(el, '#subtitle-type')).toBeNull();
      expect(el.shadowRoot!.querySelectorAll('[data-footer]').length).toBe(0);
      expect(q(el, 'ha-entity-picker')).not.toBeNull();
    });

    it('la grande ofrece el pie con sus tres datos y la mediana con dos (el sensor de puerta va aparte)', async () => {
      expect((await mountEditor({ entity: 'lock.puerta', size: 'large' })).el.shadowRoot!.querySelectorAll('[data-footer]').length).toBe(3);
      expect((await mountEditor({ entity: 'lock.puerta', size: 'medium' })).el.shadowRoot!.querySelectorAll('[data-footer]').length).toBe(2);
    });

    it('el subtítulo solo se ofrece en la grande', async () => {
      expect(q((await mountEditor({ entity: 'lock.puerta' })).el, '#subtitle-type')).not.toBeNull();
      expect(q((await mountEditor({ entity: 'lock.puerta', size: 'medium' })).el, '#subtitle-type')).toBeNull();
      expect(q((await mountEditor({ entity: 'lock.puerta', size: 'compact' })).el, '#subtitle-type')).toBeNull();
    });
  });
});
