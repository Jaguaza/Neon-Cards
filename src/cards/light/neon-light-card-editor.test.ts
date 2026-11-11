// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Editor = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

async function mount(config: Record<string, unknown>, language = 'es'): Promise<{ el: Editor; last: () => Record<string, unknown> }> {
  await import('./index');
  const el = document.createElement('neon-light-card-editor') as Editor;
  let latest: Record<string, unknown> = config;
  el.addEventListener('config-changed', (ev) => {
    latest = (ev as CustomEvent).detail.config;
  });
  el.hass = { locale: { language }, states: {} };
  el.setConfig(config);
  document.body.appendChild(el);
  await el.updateComplete;
  return { el, last: () => latest };
}

const q = (el: Editor, sel: string) => el.shadowRoot!.querySelector(sel);
const change = (select: HTMLSelectElement, value: string) => {
  select.value = value;
  select.dispatchEvent(new Event('change'));
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('NeonLightCardEditor', () => {
  it('el selector de entidad solo ofrece el dominio light', async () => {
    const { el } = await mount({ entity: 'light.sala' });
    expect((q(el, 'ha-entity-picker') as unknown as { includeDomains: string[] }).includeDomains).toEqual(['light']);
  });

  it('el nombre se guarda y, al vaciarlo, se borra de la config', async () => {
    const { el, last } = await mount({ entity: 'light.sala' });
    const input = q(el, '#name') as HTMLInputElement;
    input.value = 'Luz del salón';
    input.dispatchEvent(new InputEvent('input'));
    expect(last().name).toBe('Luz del salón');
    await el.updateComplete;
    const again = q(el, '#name') as HTMLInputElement;
    again.value = '';
    again.dispatchEvent(new InputEvent('input'));
    expect('name' in last()).toBe(false);
  });

  it('el subtítulo es personalizado por defecto, con texto libre', async () => {
    const { el, last } = await mount({ entity: 'light.sala' });
    const select = q(el, '#subtitle-type') as HTMLSelectElement;
    expect(select.value).toBe('custom');
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['custom', 'name', 'state', 'last-changed', 'last-updated']);
    const text = q(el, '#subtitle') as HTMLInputElement;
    text.value = 'Salón';
    text.dispatchEvent(new InputEvent('input'));
    expect(last().subtitle).toBe('Salón');
  });

  it('elegir un dato de la entidad guarda el tipo y quita el campo de texto; volver a personalizado lo borra', async () => {
    const { el, last } = await mount({ entity: 'light.sala' });
    change(q(el, '#subtitle-type') as HTMLSelectElement, 'state');
    expect(last().subtitle_type).toBe('state');
    await el.updateComplete;
    expect(q(el, '#subtitle')).toBeNull();
    change(q(el, '#subtitle-type') as HTMLSelectElement, 'custom');
    expect('subtitle_type' in last()).toBe(false);
  });

  it('la paleta personalizada enseña los tres colores y se guarda lo elegido', async () => {
    const { el, last } = await mount({ entity: 'light.sala', neon_palette: 'custom' });
    expect(el.shadowRoot!.querySelectorAll('.custom-colors-grid input[type="color"]')).toHaveLength(3);
    change(q(el, '#palette') as HTMLSelectElement, 'sunset');
    expect(last().neon_palette).toBe('sunset');
  });

  it('las tres acciones salen con pulsar = alternar, mantener = más información y doble toque = nada', async () => {
    const { el } = await mount({ entity: 'light.sala' });
    const editors = Array.from(el.shadowRoot!.querySelectorAll('hui-action-editor')) as unknown as Array<{ config: { action: string }; configValue: string }>;
    expect(editors.map((e) => [e.configValue, e.config.action])).toEqual([
      ['tap_action', 'toggle'],
      ['hold_action', 'more-info'],
      ['double_tap_action', 'none'],
    ]);
  });

  it('los textos salen en el idioma de Home Assistant', async () => {
    const es = await mount({ entity: 'light.sala' });
    expect(es.el.shadowRoot!.querySelector('.section-header')!.textContent).toBe('Configuración principal');
    document.body.innerHTML = '';
    const en = await mount({ entity: 'light.sala' }, 'en');
    expect(en.el.shadowRoot!.querySelector('.section-header')!.textContent).toBe('Main configuration');
  });
});

const options = (el: Editor) => Array.from(el.shadowRoot!.querySelectorAll('ha-checkbox[data-option]')) as unknown as Array<{ checked: boolean; dataset: { option: string }; textContent: string; dispatchEvent(e: Event): boolean }>;
const toggle = (box: { checked: boolean; dispatchEvent(e: Event): boolean }, checked: boolean) => {
  box.checked = checked;
  box.dispatchEvent(new Event('change'));
};
const favoriteInputs = (el: Editor) => Array.from(el.shadowRoot!.querySelectorAll('input[data-favorite]')) as HTMLInputElement[];
const add = (el: Editor) => el.shadowRoot!.querySelector('button[data-add]') as HTMLButtonElement;

describe('opciones del pie en el editor', () => {
  it('salen las cinco, todas marcadas por defecto, con su nombre', async () => {
    const { el } = await mount({ entity: 'light.sala' });
    expect(options(el).map((box) => box.dataset.option)).toEqual(['brightness', 'color_temp', 'color', 'favorites', 'effects']);
    expect(options(el).every((box) => box.checked)).toBe(true);
    expect(options(el).map((box) => box.textContent)).toEqual(['Brillo', 'Temperatura de color', 'Color', 'Favoritos', 'Efectos']);
  });

  it('desmarcar una guarda solo las demás, en el orden del pie', async () => {
    const { el, last } = await mount({ entity: 'light.sala' });
    toggle(options(el)[2], false);
    expect(last().footer_options).toEqual(['brightness', 'color_temp', 'favorites', 'effects']);
    await el.updateComplete;
    expect(options(el).map((box) => box.checked)).toEqual([true, true, false, true, true]);
  });

  it('volver a marcarlas todas quita la clave', async () => {
    const { el, last } = await mount({ entity: 'light.sala', footer_options: ['brightness'] });
    expect(options(el).map((box) => box.checked)).toEqual([true, false, false, false, false]);
    for (const index of [1, 2, 3, 4]) {
      toggle(options(el)[index], true);
      await el.updateComplete;
    }
    expect('footer_options' in last()).toBe(false);
  });

  it('se pueden desmarcar todas: una lista vacía, sin pie', async () => {
    const { el, last } = await mount({ entity: 'light.sala', footer_options: ['effects'] });
    toggle(options(el)[4], false);
    expect(last().footer_options).toEqual([]);
  });

  it('los textos salen en el idioma de Home Assistant', async () => {
    const { el } = await mount({ entity: 'light.sala' }, 'en');
    expect(options(el).map((box) => box.textContent)).toEqual(['Brightness', 'Color temperature', 'Color', 'Favorites', 'Effects']);
  });
});

describe('colores favoritos en el editor', () => {
  it('sin favoritos no hay selectores y «Añadir color» está activo', async () => {
    const { el } = await mount({ entity: 'light.sala' });
    expect(favoriteInputs(el)).toHaveLength(0);
    expect(add(el).disabled).toBe(false);
    expect(add(el).textContent).toBe('Añadir color');
  });

  it('añadir propone colores distintos, en orden, y se guardan en hexadecimal', async () => {
    const { el, last } = await mount({ entity: 'light.sala' });
    add(el).click();
    await el.updateComplete;
    add(el).click();
    await el.updateComplete;
    expect(last().favorite_colors).toEqual(['#ff3b30', '#ff9500']);
    expect(favoriteInputs(el).map((input) => input.value)).toEqual(['#ff3b30', '#ff9500']);
  });

  it('con cinco, «Añadir color» se desactiva', async () => {
    const { el, last } = await mount({ entity: 'light.sala', favorite_colors: ['#111111', '#222222', '#333333', '#444444', '#555555'] });
    expect(add(el).disabled).toBe(true);
    add(el).click();
    expect(last().favorite_colors).toEqual(['#111111', '#222222', '#333333', '#444444', '#555555']);
  });

  it('cambiar un color solo cambia ese', async () => {
    const { el, last } = await mount({ entity: 'light.sala', favorite_colors: ['#ff0000', '#00ff00'] });
    const input = favoriteInputs(el)[1];
    input.value = '#123456';
    input.dispatchEvent(new Event('input'));
    expect(last().favorite_colors).toEqual(['#ff0000', '#123456']);
  });

  it('quitar uno lo borra; quitar el último quita la clave', async () => {
    const { el, last } = await mount({ entity: 'light.sala', favorite_colors: ['#ff0000', '#00ff00'] });
    (el.shadowRoot!.querySelector('button[data-remove="0"]') as HTMLButtonElement).click();
    expect(last().favorite_colors).toEqual(['#00ff00']);
    await el.updateComplete;
    (el.shadowRoot!.querySelector('button[data-remove="0"]') as HTMLButtonElement).click();
    expect('favorite_colors' in last()).toBe(false);
  });

  it('lo que no es un color en la config se descarta al editar', async () => {
    const { el, last } = await mount({ entity: 'light.sala', favorite_colors: ['#ff0000', 'rojo'] });
    expect(favoriteInputs(el)).toHaveLength(1);
    add(el).click();
    expect(last().favorite_colors).toEqual(['#ff0000', '#ff3b30']);
  });

  it('el texto accesible de cada selector lleva su número', async () => {
    const { el } = await mount({ entity: 'light.sala', favorite_colors: ['#ff0000', '#00ff00'] });
    expect(favoriteInputs(el).map((input) => input.getAttribute('aria-label'))).toEqual(['Color favorito 1', 'Color favorito 2']);
  });
});

describe('tamaño de la tarjeta en el editor', () => {
  const sizeSelect = (el: Editor) => q(el, '#size') as HTMLSelectElement;
  const hasFooterSection = (el: Editor) => el.shadowRoot!.querySelector('ha-checkbox[data-option]') !== null || el.shadowRoot!.querySelector('button[data-add]') !== null;

  it('ofrece Grande - Mediana (predeterminada) y Compacta - Mediana, en el idioma de Home Assistant', async () => {
    const es = await mount({ entity: 'light.sala' });
    expect(sizeSelect(es.el).value).toBe('large');
    expect(Array.from(sizeSelect(es.el).options).map((o) => [o.value, o.textContent])).toEqual([
      ['large', 'Grande - Mediana'],
      ['compact', 'Compacta - Mediana'],
    ]);
    document.body.innerHTML = '';
    const en = await mount({ entity: 'light.sala' }, 'en');
    expect(Array.from(sizeSelect(en.el).options).map((o) => o.textContent)).toEqual(['Large - Medium', 'Compact - Medium']);
  });

  it('elegir la compacta guarda size; volver a la grande quita la clave', async () => {
    const { el, last } = await mount({ entity: 'light.sala' });
    change(sizeSelect(el), 'compact');
    expect(last().size).toBe('compact');
    await el.updateComplete;
    change(sizeSelect(el), 'large');
    expect('size' in last()).toBe(false);
  });

  it('con la compacta no sale la sección del pie (ni opciones ni favoritos), y con la grande sí', async () => {
    const { el } = await mount({ entity: 'light.sala' });
    expect(hasFooterSection(el)).toBe(true);
    change(sizeSelect(el), 'compact');
    await el.updateComplete;
    expect(hasFooterSection(el)).toBe(false);
    expect(el.shadowRoot!.textContent).not.toContain('Pie de la tarjeta');
    change(sizeSelect(el), 'large');
    await el.updateComplete;
    expect(hasFooterSection(el)).toBe(true);
  });

  it('las opciones del pie y los favoritos ya guardados se conservan al pasar por la compacta', async () => {
    const { el, last } = await mount({ entity: 'light.sala', footer_options: ['brightness', 'color'], favorite_colors: ['#ff0000', '#00ff00'] });
    change(sizeSelect(el), 'compact');
    expect(last().footer_options).toEqual(['brightness', 'color']);
    expect(last().favorite_colors).toEqual(['#ff0000', '#00ff00']);
    await el.updateComplete;
    change(sizeSelect(el), 'large');
    await el.updateComplete;
    expect(options(el).map((box) => box.checked)).toEqual([true, false, true, false, false]);
    expect(favoriteInputs(el)).toHaveLength(2);
  });

  it('abrir un editor con una config compacta ya hecha no enseña el pie', async () => {
    const { el } = await mount({ entity: 'light.sala', size: 'compact' });
    expect(sizeSelect(el).value).toBe('compact');
    expect(hasFooterSection(el)).toBe(false);
  });
});
