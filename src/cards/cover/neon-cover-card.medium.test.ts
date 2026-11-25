// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { BASIC_FEATURES, TILT_FEATURES, card, hassWith, mount, root, text } from './neon-cover-card.fixtures';
import type { Card } from './neon-cover-card.fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

const q = (el: Card, sel: string) => root(el).querySelector(sel);
const qa = (el: Card, sel: string) => Array.from(root(el).querySelectorAll(sel));
const grid = (el: Card) => (el as unknown as { getGridOptions(): unknown }).getGridOptions();

describe('tarjeta mediana', () => {
  it('lleva la cabecera, el porcentaje, el icono grande, el deslizador y el pie, sin dial', async () => {
    const el = await mount({ size: 'medium' });
    expect(card(el).getAttribute('data-cover-size')).toBe('medium');
    expect(text(el, '.name')).toBe('Persiana Salón');
    expect(text(el, '.status-text')).toBe('Abierta');
    expect(text(el, '.position-label')).toBe('Posición actual');
    expect(text(el, '.position-value')).toBe('72%');
    expect(q(el, '.medium-main .hero-icon svg.cover-glyph')).not.toBeNull();
    expect(q(el, '.slider')).not.toBeNull();
    expect(q(el, '.scale')).not.toBeNull();
    expect(qa(el, '.control')).toHaveLength(3);
    for (const sel of ['.dial-svg', '.dial-wrap', '.hero', '.hero-body']) expect(q(el, sel)).toBeNull();
  });

  it('la cabecera, el porcentaje y el icono comparten la misma rejilla, con el icono el último', async () => {
    const el = await mount({ size: 'medium' });
    const main = q(el, '.medium-main')!;
    expect(Array.from(main.children).map((c) => (c.getAttribute('class') ?? '').split(' ')[0])).toEqual(['header', 'position-block', 'hero-icon']);
    expect(q(el, '.medium-main .header .name')).not.toBeNull();
    expect(q(el, '.medium-main .header .status')).not.toBeNull();
  });

  it('los tres puntos siguen abriendo «más información»', async () => {
    const el = await mount({ size: 'medium' });
    let entityId = '';
    el.addEventListener('hass-more-info', (ev) => (entityId = (ev as CustomEvent).detail.entityId));
    (q(el, '.menu') as HTMLButtonElement).click();
    expect(entityId).toBe('cover.salon');
  });

  it('el deslizador fija la posición y mueve el icono en directo', async () => {
    const calls: unknown[][] = [];
    const el = await mount({ size: 'medium' }, hassWith('open', { calls }));
    const slider = q(el, '.slider') as HTMLInputElement;
    slider.value = '25';
    slider.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(text(el, '.position-value')).toBe('25%');
    expect(q(el, '.cover-glyph')!.getAttribute('style')).toContain('--open: 0.25');
    slider.dispatchEvent(new Event('change'));
    expect(calls).toEqual([['cover', 'set_cover_position', { entity_id: 'cover.salon', position: 25 }]]);
  });

  it('la veneciana con inclinación lleva también su deslizador de inclinación', async () => {
    const attrs = { device_class: 'blind', supported_features: TILT_FEATURES, current_tilt_position: 40 };
    const el = await mount({ size: 'medium', cover_type: 'blind' }, hassWith('open', { attributes: attrs }));
    expect(qa(el, '.slider')).toHaveLength(2);
    expect(text(el, '.tilt-value')).toBe('40%');
  });

  it('un tipo binario no lleva porcentaje ni deslizadores', async () => {
    const calls: unknown[][] = [];
    const el = await mount({ size: 'medium', cover_type: 'tv' }, hassWith('closed', { calls, attributes: { current_position: 0 } }));
    for (const sel of ['.position-block', '.position-value', '.slider', '.scale', '.dial-svg']) expect(q(el, sel)).toBeNull();
    expect(q(el, '.cover-glyph')?.getAttribute('data-glyph')).toBe('tv');
    (q(el, '[data-control="open"]') as HTMLButtonElement).click();
    expect(calls).toEqual([['cover', 'open_cover', { entity_id: 'cover.salon' }]]);
  });

  it('sin current_position no hay porcentaje, pero sí icono y botones', async () => {
    const el = await mount({ size: 'medium' }, hassWith('open', { attributes: { current_position: undefined, supported_features: 1 | 2 | 8 } }));
    expect(q(el, '.position-block')).toBeNull();
    expect(q(el, '.slider')).toBeNull();
    expect(q(el, '.medium-main .hero-icon')).not.toBeNull();
    expect(qa(el, '.control')).toHaveLength(3);
  });

  it('el icono mantiene icon_color solo con la tarjeta activa', async () => {
    const hero = (el: Card) => q(el, '.hero-icon')!.getAttribute('style') ?? '';
    expect(hero(await mount({ size: 'medium', icon_color: '#ff8800' }))).toContain('#ff8800');
    document.body.innerHTML = '';
    expect(hero(await mount({ size: 'medium', icon_color: '#ff8800' }, hassWith('closed', { attributes: { current_position: 0 } })))).not.toContain('#ff8800');
  });

  it('el halo y el estado funcionan igual que en la grande', async () => {
    expect(card(await mount({ size: 'medium' }, hassWith('opening'))).classList.contains('neon-halo-active')).toBe(true);
    document.body.innerHTML = '';
    expect(card(await mount({ size: 'medium' }, hassWith('closed', { attributes: { current_position: 0 } }))).classList.contains('neon-halo-active')).toBe(false);
  });
});

describe('selección del tamaño', () => {
  it('sin size, o con uno que no es large ni medium, es la grande', async () => {
    for (const size of [undefined, 'large', 'compact', '', 3]) {
      document.body.innerHTML = '';
      const el = await mount(size === undefined ? {} : { size });
      expect(card(el).getAttribute('data-cover-size')).toBe('large');
      expect(q(el, '.dial-svg')).not.toBeNull();
      expect(q(el, '.medium-main')).toBeNull();
    }
  });

  it('getGridOptions: grande entre 9 y 12 columnas y mediana entre 6 y 8, con alto automático', async () => {
    expect(grid(await mount())).toEqual({ rows: 'auto', columns: 12, min_columns: 9, max_columns: 12 });
    document.body.innerHTML = '';
    expect(grid(await mount({ size: 'medium' }))).toEqual({ rows: 'auto', columns: 8, min_columns: 6, max_columns: 8 });
  });

  it('cambiar de tamaño en la config cambia el diseño', async () => {
    const el = await mount({ size: 'medium' });
    el.setConfig({ entity: 'cover.salon' });
    await el.updateComplete;
    expect(q(el, '.dial-svg')).not.toBeNull();
    el.setConfig({ entity: 'cover.salon', size: 'medium' });
    await el.updateComplete;
    expect(q(el, '.dial-svg')).toBeNull();
  });

  it('sin los atributos básicos sigue sin romperse', async () => {
    const el = await mount({ size: 'medium' }, hassWith('open', { attributes: { supported_features: BASIC_FEATURES } }));
    expect(qa(el, '.control')).toHaveLength(3);
  });
});
