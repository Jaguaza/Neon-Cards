// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Editor = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

async function mount(config: Record<string, unknown>, language = 'es'): Promise<{ el: Editor; last: () => Record<string, unknown> }> {
  await import('./index');
  const el = document.createElement('neon-cover-card-editor') as Editor;
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

afterEach(() => {
  document.body.innerHTML = '';
});

describe('NeonCoverCardEditor', () => {
  it('el selector de entidad solo ofrece el dominio cover', async () => {
    const { el } = await mount({ entity: 'cover.salon' });
    expect((q(el, 'ha-entity-picker') as unknown as { includeDomains: string[] }).includeDomains).toEqual(['cover']);
  });

  it('elegir entidad la guarda en la config', async () => {
    const { el, last } = await mount({});
    q(el, 'ha-entity-picker')!.dispatchEvent(new CustomEvent('value-changed', { detail: { value: 'cover.dormitorio' } }));
    expect(last().entity).toBe('cover.dormitorio');
  });

  it('el nombre se guarda y, al vaciarlo, se borra de la config', async () => {
    const { el, last } = await mount({ entity: 'cover.salon' });
    const input = q(el, '#name') as HTMLInputElement;
    input.value = 'Salón';
    input.dispatchEvent(new InputEvent('input'));
    expect(last().name).toBe('Salón');
    await el.updateComplete;
    const again = q(el, '#name') as HTMLInputElement;
    again.value = '';
    again.dispatchEvent(new InputEvent('input'));
    expect('name' in last()).toBe(false);
  });

  it('el selector de tipo tiene los seis tipos, con Persiana marcada por defecto y sin Automático', async () => {
    const { el } = await mount({ entity: 'cover.salon' });
    const tiles = Array.from(el.shadowRoot!.querySelectorAll('.type-tile')) as HTMLElement[];
    expect(tiles.map((t) => t.dataset.type)).toEqual(['shutter', 'blind', 'curtain', 'awning', 'projector', 'tv']);
    expect(tiles.map((t) => t.textContent?.trim())).toEqual(['Persiana', 'Veneciana', 'Cortina', 'Toldo', 'Pantalla de proyector', 'TV en mueble']);
    expect(tiles.map((t) => t.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false', 'false', 'false', 'false']);
    expect(el.shadowRoot!.querySelectorAll('.type-tile svg.cover-glyph')).toHaveLength(6);
  });

  it('elegir un tipo lo guarda como cover_type y Persiana (el de por defecto) lo quita', async () => {
    const { el, last } = await mount({ entity: 'cover.salon' });
    const tile = (type: string) => el.shadowRoot!.querySelector(`.type-tile[data-type="${type}"]`) as HTMLButtonElement;
    tile('awning').click();
    expect(last().cover_type).toBe('awning');
    await el.updateComplete;
    expect(tile('awning').getAttribute('aria-checked')).toBe('true');
    tile('tv').click();
    expect(last().cover_type).toBe('tv');
    await el.updateComplete;
    expect(tile('tv').getAttribute('aria-checked')).toBe('true');
    expect(tile('awning').getAttribute('aria-checked')).toBe('false');
    expect(tile('shutter').getAttribute('aria-checked')).toBe('false');
    tile('shutter').click();
    expect('cover_type' in last()).toBe(false);
  });

  it('un cover_type guardado sale marcado; uno inválido cuenta como Persiana', async () => {
    const { el } = await mount({ entity: 'cover.salon', cover_type: 'curtain' });
    expect(el.shadowRoot!.querySelector('.type-tile[data-type="curtain"]')!.getAttribute('aria-checked')).toBe('true');
    document.body.innerHTML = '';
    const invalid = await mount({ entity: 'cover.salon', cover_type: 'garage' });
    expect(invalid.el.shadowRoot!.querySelector('.type-tile[data-type="shutter"]')!.getAttribute('aria-checked')).toBe('true');
  });

  it('en inglés las fichas salen en inglés', async () => {
    const { el } = await mount({ entity: 'cover.salon' }, 'en');
    const names = Array.from(el.shadowRoot!.querySelectorAll('.type-tile')).map((t) => t.textContent?.trim());
    expect(names).toEqual(['Shutter', 'Venetian blind', 'Curtain', 'Awning', 'Projector screen', 'TV cabinet']);
  });

  it('la paleta del halo se guarda y la personalizada muestra los tres colores', async () => {
    const { el, last } = await mount({ entity: 'cover.salon' });
    const haloColors = () => el.shadowRoot!.querySelectorAll('input[type="color"]:not([data-color])');
    const select = q(el, '#palette') as HTMLSelectElement;
    select.value = 'sunset';
    select.dispatchEvent(new Event('change'));
    expect(last().neon_palette).toBe('sunset');
    await el.updateComplete;
    expect(haloColors()).toHaveLength(0);
    const custom = q(el, '#palette') as HTMLSelectElement;
    custom.value = 'custom';
    custom.dispatchEvent(new Event('change'));
    await el.updateComplete;
    expect(haloColors()).toHaveLength(3);
  });

  it('el halo va encima de los colores del icono y del estado', async () => {
    const { el } = await mount({ entity: 'cover.salon' });
    const headers = Array.from(el.shadowRoot!.querySelectorAll('.section-header')).map((h) => h.textContent?.trim());
    expect(headers).toEqual(['Configuración Principal', 'Apariencia del halo', 'Colores']);
    const halo = el.shadowRoot!.querySelector('#palette')!;
    const icon = el.shadowRoot!.querySelector('input[data-color="icon_color"]')!;
    expect(icon).not.toBeNull();
    expect(halo.compareDocumentPosition(icon) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('el selector de tamaño tiene Grande y Mediana, con Grande por defecto', async () => {
    const { el } = await mount({ entity: 'cover.salon' });
    const select = el.shadowRoot!.querySelector('#size') as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['large', 'medium', 'compact']);
    expect(select.value).toBe('large');
  });

  it('elegir Mediana guarda size: medium y volver a Grande lo quita', async () => {
    const { el, last } = await mount({ entity: 'cover.salon' });
    const select = () => el.shadowRoot!.querySelector('#size') as HTMLSelectElement;
    select().value = 'medium';
    select().dispatchEvent(new Event('change'));
    expect(last().size).toBe('medium');
    await el.updateComplete;
    expect(select().value).toBe('medium');
    select().value = 'large';
    select().dispatchEvent(new Event('change'));
    expect('size' in last()).toBe(false);
  });

  it('elegir Compacta guarda size: compact', async () => {
    const { el, last } = await mount({ entity: 'cover.salon' });
    const select = el.shadowRoot!.querySelector('#size') as HTMLSelectElement;
    select.value = 'compact';
    select.dispatchEvent(new Event('change'));
    expect(last().size).toBe('compact');
    await el.updateComplete;
    expect((el.shadowRoot!.querySelector('#size') as HTMLSelectElement).value).toBe('compact');
    expect(Array.from((el.shadowRoot!.querySelector('#size') as HTMLSelectElement).options).map((o) => o.textContent?.trim())[2]).toBe('Compacta (icono pequeño, sin dial ni deslizadores)');
  });

  it('un size guardado sale elegido y uno inválido cuenta como Grande', async () => {
    const medium = await mount({ entity: 'cover.salon', size: 'medium' });
    expect((medium.el.shadowRoot!.querySelector('#size') as HTMLSelectElement).value).toBe('medium');
    document.body.innerHTML = '';
    const invalid = await mount({ entity: 'cover.salon', size: 'giant' });
    expect((invalid.el.shadowRoot!.querySelector('#size') as HTMLSelectElement).value).toBe('large');
  });

  it('los textos del tamaño salen en el idioma de Home Assistant', async () => {
    const { el } = await mount({ entity: 'cover.salon' }, 'en');
    const select = el.shadowRoot!.querySelector('#size') as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => o.textContent?.trim())).toEqual(['Large', 'Medium (large icon on the right, no dial)', 'Compact (small icon, no dial or sliders)']);
  });

  it('los textos salen en el idioma de Home Assistant', async () => {
    const { el } = await mount({ entity: 'cover.salon' }, 'en');
    expect(el.shadowRoot!.textContent).toContain('Main configuration');
    expect(el.shadowRoot!.textContent).toContain('Halo palette');
  });
});
