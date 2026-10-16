// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Editor = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

async function mount(config: Record<string, unknown>): Promise<{ el: Editor; last: () => Record<string, unknown> }> {
  await import('./index');
  const el = document.createElement('neon-lock-card-editor') as Editor;
  let latest: Record<string, unknown> = config;
  el.addEventListener('config-changed', (ev) => {
    latest = (ev as CustomEvent).detail.config;
  });
  el.hass = { locale: { language: 'es' }, states: {} };
  el.setConfig(config);
  document.body.appendChild(el);
  await el.updateComplete;
  return { el, last: () => latest };
}

const q = (el: Editor, sel: string) => el.shadowRoot!.querySelector(sel);

describe('NeonLockCardEditor', () => {
  it('el selector de entidad solo ofrece el dominio lock', async () => {
    const { el } = await mount({ entity: 'lock.puerta' });
    expect((q(el, 'ha-entity-picker') as unknown as { includeDomains: string[] }).includeDomains).toEqual(['lock']);
  });

  it('el subtítulo ofrece ninguno (por defecto), estado, personalizado, cambio y actualización', async () => {
    const { el } = await mount({ entity: 'lock.puerta' });
    const select = q(el, '#subtitle-type') as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['none', 'state', 'custom', 'last-changed', 'last-updated']);
    expect(select.value).toBe('none');
    expect(q(el, '#subtitle')).toBeNull();
  });

  it('elegir personalizado guarda subtitle_type y muestra el texto libre; ninguno (el valor por defecto) lo elimina', async () => {
    const { el, last } = await mount({ entity: 'lock.puerta' });
    const select = q(el, '#subtitle-type') as HTMLSelectElement;
    select.value = 'custom';
    select.dispatchEvent(new Event('change'));
    expect(last().subtitle_type).toBe('custom');
    await el.updateComplete;
    expect(q(el, '#subtitle')).not.toBeNull();
    (q(el, '#subtitle-type') as HTMLSelectElement).value = 'state';
    q(el, '#subtitle-type')!.dispatchEvent(new Event('change'));
    expect(last().subtitle_type).toBe('state'); // repetir el estado ya no es el valor por defecto
    (q(el, '#subtitle-type') as HTMLSelectElement).value = 'none';
    q(el, '#subtitle-type')!.dispatchEvent(new Event('change'));
    expect('subtitle_type' in last()).toBe(false);
  });

  it('ofrece cuatro iconos en fichas, con el candado marcado por defecto', async () => {
    const { el } = await mount({ entity: 'lock.puerta' });
    const tiles = Array.from(el.shadowRoot!.querySelectorAll('.icon-tile')) as HTMLElement[];
    expect(tiles.map((t) => t.dataset.icon)).toEqual(['padlock', 'door', 'garage_roller', 'garage_sliding']);
    expect(tiles.map((t) => t.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false', 'false']);
    expect(tiles.map((t) => t.textContent!.trim())).toEqual(['Candado', 'Puerta abriéndose', 'Garaje con puerta enrollable', 'Garaje con puerta corredera']);
  });

  it('marca la ficha del icono configurado', async () => {
    const { el } = await mount({ entity: 'lock.puerta', lock_icon: 'garage_sliding' });
    const checked = Array.from(el.shadowRoot!.querySelectorAll('.icon-tile[aria-checked="true"]')) as HTMLElement[];
    expect(checked.map((t) => t.dataset.icon)).toEqual(['garage_sliding']);
  });

  it('cada ficha trae su dibujo ya pintado (cerrado)', async () => {
    const { el } = await mount({ entity: 'lock.puerta' });
    const d = (type: string, sel: string) => el.shadowRoot!.querySelector(`.icon-tile[data-icon="${type}"] ${sel}`)?.getAttribute('d');
    expect(d('padlock', '.shackle')).toBe('M8.5 17.5V10A3.5 3.5 0 0 1 15.5 10V13.6');
    expect(d('door', '.knob')).toBe('M16 11H18V13H16Z');
    expect(d('garage_sliding', '.panel')).toBe('M5 12H19V14H5ZM5 15H19V17H5ZM5 18H19V20H5ZM5 12H6V20H5Z');
    expect(d('garage_roller', '.slats')).toBe('M5 12H19V14H5ZM5 15H19V17H5ZM5 18H19V20H5Z');
  });

  it('elegir un icono guarda lock_icon; elegir el candado lo quita de la config', async () => {
    const { el, last } = await mount({ entity: 'lock.puerta' });
    const tile = (type: string) => el.shadowRoot!.querySelector(`.icon-tile[data-icon="${type}"]`) as HTMLButtonElement;
    tile('garage_roller').click();
    expect(last().lock_icon).toBe('garage_roller');
    await el.updateComplete;
    expect(tile('garage_roller').getAttribute('aria-checked')).toBe('true');
    tile('padlock').click();
    expect('lock_icon' in last()).toBe(false);
  });

  it('paleta custom muestra tres selectores de color', async () => {
    const { el } = await mount({ entity: 'lock.puerta', neon_palette: 'custom' });
    expect(el.shadowRoot!.querySelectorAll('input[type="color"]').length).toBe(3);
  });

  it('el interruptor de confirmación al abrir está activo por defecto y desactivarlo guarda confirm_open: false', async () => {
    const { el, last } = await mount({ entity: 'lock.puerta' });
    const sw = q(el, 'ha-switch') as unknown as HTMLInputElement;
    expect(sw.checked).toBe(true);
    sw.checked = false;
    sw.dispatchEvent(new Event('change'));
    expect(last().confirm_open).toBe(false);
    sw.checked = true;
    sw.dispatchEvent(new Event('change'));
    expect('confirm_open' in last()).toBe(false); // el valor por defecto no se guarda
  });

  describe('información inferior', () => {
    const slot = (el: Editor, n: number) => q(el, `#footer-${n}`) as HTMLSelectElement;
    const choose = (el: Editor, n: number, value: string) => {
      slot(el, n).value = value;
      slot(el, n).dispatchEvent(new Event('change'));
    };
    const pickers = (el: Editor) => Array.from(el.shadowRoot!.querySelectorAll('ha-entity-picker')) as unknown as { label: string; includeDomains: string[]; value: string }[];

    it('ofrece tres huecos con ninguno, sensor de puerta, batería y último acceso', async () => {
      const { el } = await mount({ entity: 'lock.puerta' });
      for (const n of [1, 2, 3]) {
        expect(Array.from(slot(el, n).options).map((o) => o.value)).toEqual(['', 'door', 'battery', 'last_user']);
        expect(slot(el, n).value).toBe('');
      }
      expect(Array.from(slot(el, 1).options).map((o) => o.textContent!.trim())).toEqual(['Ninguno', 'Sensor de puerta', 'Batería de la cerradura', 'Quién abrió la última vez']);
    });

    it('elegir datos guarda footer_items en orden y mostrar solo las entidades de los elegidos', async () => {
      const { el, last } = await mount({ entity: 'lock.puerta' });
      expect(pickers(el)).toHaveLength(1); // solo la de la cerradura
      choose(el, 1, 'battery');
      expect(last().footer_items).toEqual(['battery']);
      await el.updateComplete;
      choose(el, 2, 'door');
      await el.updateComplete;
      choose(el, 3, 'last_user');
      expect(last().footer_items).toEqual(['battery', 'door', 'last_user']);
      await el.updateComplete;
      expect(pickers(el).map((p) => p.includeDomains)).toEqual([['lock'], ['binary_sensor'], ['sensor'], ['sensor', 'input_text', 'text', 'input_select', 'select']]);
    });

    it('un dato ya elegido se mueve al nuevo hueco (no se repite)', async () => {
      const { el, last } = await mount({ entity: 'lock.puerta', footer_items: ['battery', 'door'] });
      choose(el, 3, 'battery');
      expect(last().footer_items).toEqual(['door', 'battery']);
    });

    it('dejar todos en ninguno quita footer_items de la config', async () => {
      const { el, last } = await mount({ entity: 'lock.puerta', footer_items: ['door'] });
      choose(el, 1, '');
      expect('footer_items' in last()).toBe(false);
    });

    it('los selectores reflejan la config y guardan la entidad elegida', async () => {
      const { el, last } = await mount({ entity: 'lock.puerta', footer_items: ['door'], door_entity: 'binary_sensor.puerta' });
      expect(slot(el, 1).value).toBe('door');
      const picker = el.shadowRoot!.querySelectorAll('ha-entity-picker')[1] as HTMLElement & { value: string };
      expect(picker.value).toBe('binary_sensor.puerta');
      picker.dispatchEvent(new CustomEvent('value-changed', { detail: { value: 'binary_sensor.garaje' } }));
      expect(last().door_entity).toBe('binary_sensor.garaje');
      picker.dispatchEvent(new CustomEvent('value-changed', { detail: { value: '' } }));
      expect('door_entity' in last()).toBe(false);
    });
  });

  it('tiene tres editores de acción (tap, hold, double tap)', async () => {
    const { el } = await mount({ entity: 'lock.puerta' });
    expect(el.shadowRoot!.querySelectorAll('hui-action-editor').length).toBe(3);
  });
});
