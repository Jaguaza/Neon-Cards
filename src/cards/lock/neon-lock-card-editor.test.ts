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

  it('paleta custom muestra tres selectores de color del halo (además de los tres del punto de estado)', async () => {
    const preset = await mount({ entity: 'lock.puerta' });
    expect(preset.el.shadowRoot!.querySelectorAll('.custom-colors-grid').length).toBe(1); // solo el punto de estado
    const { el } = await mount({ entity: 'lock.puerta', neon_palette: 'custom' });
    const grids = el.shadowRoot!.querySelectorAll('.custom-colors-grid');
    expect(grids.length).toBe(2);
    expect(Array.from(grids).map((g) => g.querySelectorAll('input[type="color"]').length)).toEqual([3, 3]);
  });

  it('el interruptor de confirmación al abrir está activo por defecto y desactivarlo guarda confirm_open: false', async () => {
    const { el, last } = await mount({ entity: 'lock.puerta' });
    const sw = q(el, 'ha-formfield ha-switch') as unknown as HTMLInputElement;
    expect(sw.checked).toBe(true);
    sw.checked = false;
    sw.dispatchEvent(new Event('change'));
    expect(last().confirm_open).toBe(false);
    sw.checked = true;
    sw.dispatchEvent(new Event('change'));
    expect('confirm_open' in last()).toBe(false); // el valor por defecto no se guarda
  });

  describe('pie de la tarjeta', () => {
    type Picker = HTMLElement & { includeDomains: string[]; value: string };
    const card = (el: Editor, type: string) => q(el, `.data-card[data-footer="${type}"]`) as HTMLElement;
    const sw = (el: Editor, type: string) => card(el, type).querySelector('ha-switch') as HTMLElement & { checked: boolean };
    const picker = (el: Editor, type: string) => card(el, type).querySelector('ha-entity-picker') as Picker | null;
    const toggle = (el: Editor, type: string, on: boolean) => {
      sw(el, type).checked = on;
      sw(el, type).dispatchEvent(new Event('change'));
    };
    const text = (el: Editor, type: string) => card(el, type).textContent!.replace(/\s+/g, ' ').trim();

    it('muestra una tarjeta por dato, en el orden en que salen en la tarjeta: batería, último acceso, puerta', async () => {
      const { el } = await mount({ entity: 'lock.puerta' });
      const cards = Array.from(el.shadowRoot!.querySelectorAll('.data-card')) as HTMLElement[];
      expect(cards.map((c) => c.dataset.footer)).toEqual(['battery', 'last_user', 'door']);
      expect(cards.map((c) => c.querySelector('.data-title')!.textContent)).toEqual(['Batería', 'Último acceso', 'Puerta']);
      expect(q(el, '#footer-1')).toBeNull(); // ya no hay huecos numerados ni desplegables
    });

    it('cada tarjeta explica qué dato es', async () => {
      const { el } = await mount({ entity: 'lock.puerta' });
      expect(text(el, 'battery')).toContain('Nivel de batería de la cerradura.');
      expect(text(el, 'last_user')).toContain('Quién la abrió o cerró por última vez y a qué hora.');
      expect(text(el, 'door')).toContain('Si está abierta o cerrada.');
    });

    it('sin nada configurado los tres interruptores están apagados y solo se ve el interruptor (sin selectores de entidad)', async () => {
      const { el } = await mount({ entity: 'lock.puerta' });
      for (const type of ['battery', 'last_user', 'door']) {
        expect(sw(el, type).checked, type).toBe(false);
        expect(picker(el, type), type).toBeNull();
      }
    });

    it('el interruptor tiene un nombre accesible con el dato', async () => {
      const { el } = await mount({ entity: 'lock.puerta' });
      expect(sw(el, 'battery').getAttribute('aria-label')).toBe('Mostrar: Batería');
      expect(sw(el, 'door').getAttribute('aria-label')).toBe('Mostrar: Puerta');
    });

    it('activar un dato lo guarda en footer_items y despliega su entidad con su pista', async () => {
      const { el, last } = await mount({ entity: 'lock.puerta' });
      toggle(el, 'battery', true);
      expect(last().footer_items).toEqual(['battery']);
      await el.updateComplete;
      expect(card(el, 'battery').classList.contains('on')).toBe(true);
      expect(picker(el, 'battery')!.getAttribute('label')).toBe('Sensor de batería (opcional)');
      expect(picker(el, 'battery')!.includeDomains).toEqual(['sensor']);
      expect(text(el, 'battery')).toContain('Si no eliges ninguno, se usa la batería de la propia cerradura.');
    });

    it('footer_items se escribe siempre en el orden fijo, sea cual sea el orden en que se activen', async () => {
      const { el, last } = await mount({ entity: 'lock.puerta' });
      for (const type of ['door', 'last_user', 'battery']) {
        toggle(el, type, true);
        await el.updateComplete;
      }
      expect(last().footer_items).toEqual(['battery', 'last_user', 'door']);
    });

    it('un YAML con otro orden se normaliza al orden fijo al tocar un interruptor', async () => {
      const { el, last } = await mount({ entity: 'lock.puerta', footer_items: ['door', 'battery'] });
      expect(sw(el, 'door').checked).toBe(true);
      expect(sw(el, 'battery').checked).toBe(true);
      toggle(el, 'last_user', true);
      expect(last().footer_items).toEqual(['battery', 'last_user', 'door']);
    });

    it('desactivar un dato lo quita; al quitar el último desaparece footer_items', async () => {
      const { el, last } = await mount({ entity: 'lock.puerta', footer_items: ['battery', 'door'] });
      toggle(el, 'battery', false);
      expect(last().footer_items).toEqual(['door']);
      await el.updateComplete;
      toggle(el, 'door', false);
      expect('footer_items' in last()).toBe(false);
    });

    it('desactivar un dato no borra su entidad: al volver a activarlo sigue ahí', async () => {
      const { el, last } = await mount({ entity: 'lock.puerta', footer_items: ['battery'], battery_entity: 'sensor.bateria' });
      toggle(el, 'battery', false);
      expect(last().battery_entity).toBe('sensor.bateria');
      await el.updateComplete;
      toggle(el, 'battery', true);
      await el.updateComplete;
      expect(picker(el, 'battery')!.value).toBe('sensor.bateria');
    });

    it('cada entidad se elige dentro de su propia tarjeta, con sus dominios, y se borra al vaciarla', async () => {
      const { el, last } = await mount({ entity: 'lock.puerta', footer_items: ['battery', 'last_user', 'door'], door_entity: 'binary_sensor.puerta' });
      expect(picker(el, 'door')!.includeDomains).toEqual(['binary_sensor']);
      expect(picker(el, 'last_user')!.includeDomains).toEqual(['sensor', 'input_text', 'text', 'input_select', 'select']);
      expect(picker(el, 'door')!.value).toBe('binary_sensor.puerta');
      picker(el, 'door')!.dispatchEvent(new CustomEvent('value-changed', { detail: { value: 'binary_sensor.garaje' } }));
      expect(last().door_entity).toBe('binary_sensor.garaje');
      picker(el, 'last_user')!.dispatchEvent(new CustomEvent('value-changed', { detail: { value: 'sensor.ultimo' } }));
      expect(last().last_user_entity).toBe('sensor.ultimo');
      picker(el, 'door')!.dispatchEvent(new CustomEvent('value-changed', { detail: { value: '' } }));
      expect('door_entity' in last()).toBe(false);
    });

    it('un sensor de puerta ya elegido no se esconde aunque el dato esté apagado, porque también alimenta el estado «Puerta abierta»', async () => {
      const { el } = await mount({ entity: 'lock.puerta', door_entity: 'binary_sensor.puerta' });
      expect(sw(el, 'door').checked).toBe(false);
      expect(picker(el, 'door')!.value).toBe('binary_sensor.puerta');
      expect(text(el, 'door')).toContain('También sirve para mostrar «Puerta abierta» en el estado de la tarjeta.');
      expect(card(el, 'door').classList.contains('on')).toBe(false);
    });

    it('activar la puerta sin sensor avisa de que falta; con sensor no avisa', async () => {
      const { el } = await mount({ entity: 'lock.puerta', footer_items: ['door'] });
      expect(card(el, 'door').querySelector('.data-warning')!.textContent).toBe('Elige un sensor de puerta para ver este dato.');
      const withSensor = await mount({ entity: 'lock.puerta', footer_items: ['door'], door_entity: 'binary_sensor.puerta' });
      expect(card(withSensor.el, 'door').querySelector('.data-warning')).toBeNull();
      const battery = await mount({ entity: 'lock.puerta', footer_items: ['battery'] });
      expect(card(battery.el, 'battery').querySelector('.data-warning')).toBeNull(); // batería y último acceso funcionan sin entidad
    });
  });

  describe('punto de estado', () => {
    const statusInputs = (el: Editor) => Array.from(el.shadowRoot!.querySelectorAll('.custom-colors-grid')).pop()!.querySelectorAll<HTMLInputElement>('input[type="color"]');
    const setColor = (input: HTMLInputElement, value: string) => {
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    const reset = (el: Editor) => el.shadowRoot!.querySelector<HTMLButtonElement>('.reset-colors');

    it('ofrece tres colores (cerrada, desbloqueada o abierta, atascada o no disponible) con los valores por defecto', async () => {
      const { el } = await mount({ entity: 'lock.puerta' });
      expect(Array.from(statusInputs(el)).map((i) => i.value)).toEqual(['#39e07a', '#ffb02e', '#ff5c5c']);
      const labels = Array.from(el.shadowRoot!.querySelectorAll('.custom-colors-grid')).pop()!.querySelectorAll('.color-picker-wrapper span');
      expect(Array.from(labels).map((s) => s.textContent)).toEqual(['Cerrada', 'Desbloqueada o abierta', 'Atascada o no disponible']);
    });

    it('elegir un color guarda su clave y los otros dos no se tocan', async () => {
      const { el, last } = await mount({ entity: 'lock.puerta' });
      setColor(statusInputs(el)[0], '#ff00ff');
      expect(last().status_color_closed).toBe('#ff00ff');
      setColor(statusInputs(el)[1], '#00aaff');
      setColor(statusInputs(el)[2], '#112233');
      expect(last()).toMatchObject({ status_color_closed: '#ff00ff', status_color_open: '#00aaff', status_color_alert: '#112233' });
    });

    it('muestra los colores de la config; #rgb se amplía y un formato que el selector no entiende deja el color por defecto', async () => {
      const { el } = await mount({ entity: 'lock.puerta', status_color_closed: '#f0a', status_color_open: 'orange', status_color_alert: 'rgb(255, 0, 0)' });
      expect(Array.from(statusInputs(el)).map((i) => i.value)).toEqual(['#ff00aa', '#ffb02e', '#ff5c5c']);
    });

    it('un valor de YAML que no es un color válido no se muestra', async () => {
      const { el } = await mount({ entity: 'lock.puerta', status_color_closed: 'red; background: url(x)' });
      expect(statusInputs(el)[0].value).toBe('#39e07a');
    });

    it('«Restablecer colores» solo aparece con algún color puesto y los quita los tres en un solo cambio', async () => {
      const { el, last } = await mount({ entity: 'lock.puerta' });
      expect(reset(el)).toBeNull();
      const changes: Record<string, unknown>[] = [];
      el.addEventListener('config-changed', (ev) => changes.push((ev as CustomEvent).detail.config));
      setColor(statusInputs(el)[0], '#ff00ff');
      setColor(statusInputs(el)[2], '#112233');
      await el.updateComplete;
      expect(reset(el)).not.toBeNull();
      changes.length = 0;
      reset(el)!.click();
      expect(changes).toHaveLength(1);
      expect('status_color_closed' in last() || 'status_color_open' in last() || 'status_color_alert' in last()).toBe(false);
      await el.updateComplete;
      expect(reset(el)).toBeNull();
    });

    it('restablecer no toca el resto de la config', async () => {
      const { el, last } = await mount({ entity: 'lock.puerta', name: 'Puerta', status_color_open: '#00aaff', neon_palette: 'sunset' });
      reset(el)!.click();
      expect(last()).toMatchObject({ entity: 'lock.puerta', name: 'Puerta', neon_palette: 'sunset' });
    });
  });

  it('tiene tres editores de acción (tap, hold, double tap)', async () => {
    const { el } = await mount({ entity: 'lock.puerta' });
    expect(el.shadowRoot!.querySelectorAll('hui-action-editor').length).toBe(3);
  });
});
