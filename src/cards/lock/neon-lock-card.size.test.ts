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

    it('solo muestra icono, nombre y estado: sin tres puntos, sin pie y sin subtítulo (aunque estén en la config)', async () => {
      const el = await mount({ size: 'compact', footer_items: ['battery', 'last_user'], subtitle_type: 'custom', subtitle: 'Entrada' }, hassOpen());
      expect(q(el, 'ha-card')!.classList.contains('size-compact')).toBe(true);
      const header = q(el, '.header')!;
      expect(Array.from(header.children).map(cls)).toEqual(['lock-icon', 'text']);
      expect(Array.from(header.querySelector('.text')!.children).map(cls)).toEqual(['name', 'status']);
      expect(q(el, '.name')!.textContent).toBe('Puerta');
      expect(q(el, '.status-text')!.textContent!.trim()).toBe('Cerrada');
      expect(q(el, '.menu')).toBeNull();
      expect(q(el, '.footer')).toBeNull();
      expect(q(el, '.subtitle')).toBeNull();
      expect(el.shadowRoot!.textContent).not.toContain('Entrada');
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

      it('en la mediana, con dos datos elegidos el tercero no se puede activar', async () => {
        const { el } = await mountEditor({ entity: 'lock.puerta', size: 'medium', footer_items: ['battery', 'last_user'] });
        expect(sw(el, 'door')!.disabled).toBe(true);
        expect(sw(el, 'battery')!.disabled).toBe(false);
        expect(sw(el, 'last_user')!.disabled).toBe(false);
        expect(q(el, '[data-footer="door"]')!.classList.contains('blocked')).toBe(true);
      });

      it('en la mediana con menos de dos datos se pueden activar; en la grande hasta tres', async () => {
        const med = await mountEditor({ entity: 'lock.puerta', size: 'medium', footer_items: ['battery'] });
        expect(sw(med.el, 'door')!.disabled).toBe(false);
        const large = await mountEditor({ entity: 'lock.puerta', footer_items: ['battery', 'last_user'] });
        expect(sw(large.el, 'door')!.disabled).toBe(false);
      });

      it('un tercer dato heredado de la grande se avisa como «no se muestra» y se puede apagar', async () => {
        const { el, last } = await mountEditor({ entity: 'lock.puerta', size: 'medium', footer_items: ['battery', 'last_user', 'door'] });
        expect(q(el, '[data-footer="door"] .data-warning')).not.toBeNull();
        expect(q(el, '[data-footer="battery"] .data-warning')).toBeNull();
        const door = sw(el, 'door')!;
        expect(door.disabled).toBe(false);
        (door as unknown as { checked: boolean }).checked = false;
        door.dispatchEvent(new Event('change'));
        expect(last().footer_items).toEqual(['battery', 'last_user']);
      });

      it('en la mediana no se puede forzar un tercer dato aunque llegue el evento', async () => {
        const { el, last } = await mountEditor({ entity: 'lock.puerta', size: 'medium', footer_items: ['battery', 'last_user'] });
        const door = sw(el, 'door')!;
        (door as unknown as { checked: boolean }).checked = true;
        door.dispatchEvent(new Event('change'));
        expect(last().footer_items).toEqual(['battery', 'last_user']);
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

    it('en mediana y grande se ofrece el pie con sus tres datos', async () => {
      for (const size of ['medium', 'large']) {
        const { el } = await mountEditor({ entity: 'lock.puerta', size });
        expect(el.shadowRoot!.querySelectorAll('[data-footer]').length).toBe(3);
      }
    });

    it('el subtítulo solo se ofrece en la grande', async () => {
      expect(q((await mountEditor({ entity: 'lock.puerta' })).el, '#subtitle-type')).not.toBeNull();
      expect(q((await mountEditor({ entity: 'lock.puerta', size: 'medium' })).el, '#subtitle-type')).toBeNull();
      expect(q((await mountEditor({ entity: 'lock.puerta', size: 'compact' })).el, '#subtitle-type')).toBeNull();
    });
  });
});
