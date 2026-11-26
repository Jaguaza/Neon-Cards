// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { TILT_FEATURES, hassWith, mount, root, text } from './neon-cover-card.fixtures';
import type { Card } from './neon-cover-card.fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

const q = (el: Card, sel: string) => root(el).querySelector(sel);
const qa = (el: Card, sel: string) => Array.from(root(el).querySelectorAll(sel));
const grid = (el: Card) => (el as unknown as { getGridOptions(): unknown }).getGridOptions();
const firstClass = (c: Element) => (c.getAttribute('class') ?? '').split(' ')[0];

describe('tarjeta compacta', () => {
  it('lleva la cabecera, el porcentaje y el icono en la misma rejilla, sin dial ni deslizadores', async () => {
    const el = await mount({ size: 'compact' });
    expect(q(el, 'ha-card')?.getAttribute('data-cover-size')).toBe('compact');
    expect(Array.from(q(el, '.compact-main')!.children).map(firstClass)).toEqual(['header', 'position-block', 'hero-icon']);
    for (const sel of ['.medium-main', '.hero', '.position-row', '.dial-wrap', '.slider', '.scale', '.tilt-row']) expect(q(el, sel)).toBeNull();
  });

  it('muestra el nombre, el estado y el porcentaje; la etiqueta sigue en el DOM para los lectores de pantalla', async () => {
    const el = await mount({ size: 'compact' });
    expect(text(el, '.name')).toBe('Persiana Salón');
    expect(text(el, '.status-text')).toBe('Abierta');
    expect(text(el, '.position-value')).toBe('72%');
    expect(text(el, '.position-label')).toBe('Posición actual');
  });

  it('no lleva deslizador de inclinación aunque la entidad la soporte', async () => {
    const el = await mount({ size: 'compact', cover_type: 'blind' }, hassWith('open', { attributes: { supported_features: TILT_FEATURES, current_tilt_position: 40 } }));
    expect(q(el, '.tilt-row')).toBeNull();
    expect(qa(el, 'input[type="range"]')).toHaveLength(0);
  });

  it('el pie son los tres botones de siempre, con su nombre en aria-label', async () => {
    const el = await mount({ size: 'compact' });
    const buttons = qa(el, '.control') as HTMLElement[];
    expect(buttons.map((b) => b.dataset.control)).toEqual(['close', 'stop', 'open']);
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['Cerrar', 'Parar', 'Abrir']);
  });

  it('un tipo binario, o un cover sin current_position, no lleva porcentaje', async () => {
    expect(q(await mount({ size: 'compact', cover_type: 'tv' }), '.position-block')).toBeNull();
    document.body.innerHTML = '';
    const sin = await mount({ size: 'compact' }, hassWith('open', { attributes: { current_position: undefined, supported_features: 1 | 2 | 8 } }));
    expect(q(sin, '.position-block')).toBeNull();
    expect(q(sin, '.hero-icon')).not.toBeNull();
  });

  it('el icono, el halo y los colores siguen funcionando', async () => {
    const el = await mount({ size: 'compact', icon_color: '#ff8800', status_color_open: '#102030' }, hassWith('open'));
    expect((q(el, '.hero-icon') as HTMLElement).style.getPropertyValue('--cover-color')).toBe('#ff8800');
    expect((q(el, '.status') as HTMLElement).style.getPropertyValue('--dot-color')).toBe('#102030');
    expect(q(el, 'ha-card')?.classList.contains('neon-halo-active')).toBe(true);
  });

  it('los tres puntos siguen abriendo «más información»', async () => {
    const el = await mount({ size: 'compact' });
    let entityId = '';
    el.addEventListener('hass-more-info', (ev) => (entityId = (ev as CustomEvent).detail.entityId));
    (q(el, '.menu') as HTMLButtonElement).click();
    expect(entityId).toBe('cover.salon');
  });

  it('getGridOptions: de 3 a 6 columnas, empieza en 6 y el alto es automático', async () => {
    expect(grid(await mount({ size: 'compact' }))).toEqual({ rows: 'auto', columns: 6, min_columns: 3, max_columns: 6 });
  });

  it('la grande y la mediana siguen igual', async () => {
    expect(grid(await mount())).toEqual({ rows: 'auto', columns: 12, min_columns: 9, max_columns: 12 });
    document.body.innerHTML = '';
    expect(grid(await mount({ size: 'medium' }))).toEqual({ rows: 'auto', columns: 8, min_columns: 6, max_columns: 8 });
  });
});
