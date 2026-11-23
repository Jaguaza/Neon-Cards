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

  it('el selector de tipo tiene Automático y los cuatro tipos, con Automático marcado por defecto', async () => {
    const { el } = await mount({ entity: 'cover.salon' });
    const tiles = Array.from(el.shadowRoot!.querySelectorAll('.type-tile')) as HTMLElement[];
    expect(tiles.map((t) => t.dataset.type)).toEqual(['auto', 'shutter', 'blind', 'curtain', 'awning']);
    expect(tiles.map((t) => t.textContent?.trim())).toEqual(['Automático', 'Persiana', 'Veneciana', 'Cortina', 'Toldo']);
    expect(tiles.map((t) => t.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false', 'false', 'false']);
    expect(el.shadowRoot!.querySelectorAll('.type-tile svg.cover-glyph')).toHaveLength(4);
  });

  it('elegir un tipo lo guarda como cover_type y Automático lo quita', async () => {
    const { el, last } = await mount({ entity: 'cover.salon' });
    const tile = (type: string) => el.shadowRoot!.querySelector(`.type-tile[data-type="${type}"]`) as HTMLButtonElement;
    tile('awning').click();
    expect(last().cover_type).toBe('awning');
    await el.updateComplete;
    expect(tile('awning').getAttribute('aria-checked')).toBe('true');
    expect(tile('auto').getAttribute('aria-checked')).toBe('false');
    tile('auto').click();
    expect('cover_type' in last()).toBe(false);
  });

  it('un cover_type guardado sale marcado; uno inválido cuenta como Automático', async () => {
    const { el } = await mount({ entity: 'cover.salon', cover_type: 'curtain' });
    expect(el.shadowRoot!.querySelector('.type-tile[data-type="curtain"]')!.getAttribute('aria-checked')).toBe('true');
    document.body.innerHTML = '';
    const invalid = await mount({ entity: 'cover.salon', cover_type: 'garage' });
    expect(invalid.el.shadowRoot!.querySelector('.type-tile[data-type="auto"]')!.getAttribute('aria-checked')).toBe('true');
  });

  it('en inglés las fichas salen en inglés', async () => {
    const { el } = await mount({ entity: 'cover.salon' }, 'en');
    const names = Array.from(el.shadowRoot!.querySelectorAll('.type-tile')).map((t) => t.textContent?.trim());
    expect(names).toEqual(['Automatic', 'Shutter', 'Venetian blind', 'Curtain', 'Awning']);
  });

  it('la paleta del halo se guarda y la personalizada muestra los tres colores', async () => {
    const { el, last } = await mount({ entity: 'cover.salon' });
    const select = q(el, '#palette') as HTMLSelectElement;
    select.value = 'sunset';
    select.dispatchEvent(new Event('change'));
    expect(last().neon_palette).toBe('sunset');
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('input[type="color"]')).toHaveLength(0);
    const custom = q(el, '#palette') as HTMLSelectElement;
    custom.value = 'custom';
    custom.dispatchEvent(new Event('change'));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('input[type="color"]')).toHaveLength(3);
  });

  it('los textos salen en el idioma de Home Assistant', async () => {
    const { el } = await mount({ entity: 'cover.salon' }, 'en');
    expect(el.shadowRoot!.textContent).toContain('Main configuration');
    expect(el.shadowRoot!.textContent).toContain('Halo palette');
  });
});
