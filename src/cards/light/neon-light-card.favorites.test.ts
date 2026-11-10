// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { FULL_LIGHT, active, click, closeButton, footerButton, footerItems, hassWith, lightColor, mount, swatch, swatches } from './neon-light-card.fixtures';

const FAVORITES = ['#ff3b30', '#34c759', '#0a84ff'];

afterEach(() => {
  document.body.innerHTML = '';
});

describe('icono de favoritos en el pie', () => {
  it('sin colores favoritos no hay icono', async () => {
    expect(footerItems(await mount({}))).not.toContain('favorites');
  });

  it('con favoritos sale entre el color y los efectos', async () => {
    expect(footerItems(await mount({ favorite_colors: FAVORITES }))).toEqual(['brightness', 'color_temp', 'color', 'favorites', 'effects']);
  });

  it('una luz sin color no ofrece favoritos aunque estén configurados', async () => {
    const el = await mount({ favorite_colors: FAVORITES }, hassWith('on', { attributes: { supported_color_modes: ['color_temp'] } }));
    expect(footerItems(el)).toEqual(['brightness', 'color_temp']);
  });

  it('lo que no es un color se ignora y como mucho se usan cinco', async () => {
    const el = await mount({ favorite_colors: ['#111111', 'rojo', '#222222', '#333333', '#444444', '#555555', '#666666'] });
    footerButton(el, 'favorites').click();
    await el.updateComplete;
    expect(swatches(el).map((s) => s.dataset.color)).toEqual(['#111111', '#222222', '#333333', '#444444', '#555555']);
  });
});

describe('elegir un color favorito', () => {
  it('al pulsar el icono, las muestras ocupan el pie y no se manda nada', async () => {
    const calls: unknown[][] = [];
    const el = await mount({ favorite_colors: FAVORITES }, hassWith('on', { attributes: FULL_LIGHT, calls }));
    footerButton(el, 'favorites').click();
    await el.updateComplete;
    expect(swatches(el).map((s) => s.dataset.color)).toEqual(FAVORITES);
    expect(footerItems(el)).toEqual([]);
    expect(el.shadowRoot!.querySelectorAll('.footer')).toHaveLength(1);
    expect(calls).toEqual([]);
  });

  it('un toque en una muestra manda ese color en RGB y tiñe el icono ya', async () => {
    const calls: unknown[][] = [];
    const el = await mount({ favorite_colors: FAVORITES }, hassWith('on', { attributes: { ...FULL_LIGHT, rgb_color: [255, 255, 255] }, calls }));
    footerButton(el, 'favorites').click();
    await el.updateComplete;
    swatch(el, '#0a84ff').click();
    await el.updateComplete;
    expect(calls).toEqual([['light', 'turn_on', { entity_id: 'light.sala', rgb_color: [10, 132, 255] }]]);
    expect(lightColor(el)).toBe('#0a84ff');
  });

  it('el pie sigue abierto para probar otro, y cerrar devuelve los iconos', async () => {
    const calls: unknown[][] = [];
    const el = await mount({ favorite_colors: FAVORITES }, hassWith('on', { attributes: FULL_LIGHT, calls }));
    footerButton(el, 'favorites').click();
    await el.updateComplete;
    swatch(el, '#ff3b30').click();
    swatch(el, '#34c759').click();
    await el.updateComplete;
    expect(calls).toHaveLength(2);
    expect(swatches(el)).toHaveLength(3);
    closeButton(el).click();
    await el.updateComplete;
    expect(footerItems(el)).toContain('favorites');
    expect(swatches(el)).toHaveLength(0);
  });

  it('con la luz apagada la enciende con ese color y el halo se enciende ya', async () => {
    const calls: unknown[][] = [];
    const el = await mount({ favorite_colors: FAVORITES }, hassWith('off', { attributes: FULL_LIGHT, calls }));
    footerButton(el, 'favorites').click();
    await el.updateComplete;
    swatch(el, '#34c759').click();
    await el.updateComplete;
    expect(calls).toHaveLength(1);
    expect(active(el)).toBe(true);
  });

  it('cuando la luz confirma el cambio, el icono toma el color real de la luz', async () => {
    const el = await mount({ favorite_colors: FAVORITES }, hassWith('on', { attributes: { ...FULL_LIGHT, rgb_color: [255, 255, 255] } }));
    footerButton(el, 'favorites').click();
    await el.updateComplete;
    swatch(el, '#0a84ff').click();
    await el.updateComplete;
    el.hass = hassWith('on', { attributes: { ...FULL_LIGHT, rgb_color: [11, 131, 254] } });
    await el.updateComplete;
    expect(lightColor(el)).toBe('rgb(11, 131, 254)');
  });

  it('la muestra del color que tiene ahora la luz está marcada', async () => {
    const el = await mount({ favorite_colors: FAVORITES }, hassWith('on', { attributes: { ...FULL_LIGHT, rgb_color: [52, 199, 89] } }));
    footerButton(el, 'favorites').click();
    await el.updateComplete;
    expect(swatches(el).map((s) => s.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
  });

  it('con la luz apagada ninguna está marcada', async () => {
    const el = await mount({ favorite_colors: FAVORITES }, hassWith('off', { attributes: { ...FULL_LIGHT, rgb_color: [52, 199, 89] } }));
    footerButton(el, 'favorites').click();
    await el.updateComplete;
    expect(swatches(el).every((s) => s.getAttribute('aria-pressed') === 'false')).toBe(true);
  });

  it('pulsar una muestra no alterna la tarjeta y su texto accesible sale en el idioma de Home Assistant', async () => {
    const calls: unknown[][] = [];
    const el = await mount({ favorite_colors: FAVORITES }, hassWith('on', { attributes: FULL_LIGHT, calls, language: 'en' }));
    footerButton(el, 'favorites').click();
    await el.updateComplete;
    expect(swatch(el, '#ff3b30').getAttribute('aria-label')).toBe('Favorite color #ff3b30');
    swatch(el, '#ff3b30').dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(calls).toHaveLength(1);
  });

  it('si se quitan los favoritos con el pie abierto, se cierra', async () => {
    const el = await mount({ favorite_colors: FAVORITES });
    footerButton(el, 'favorites').click();
    await el.updateComplete;
    el.setConfig({ entity: 'light.sala' });
    await el.updateComplete;
    expect(swatches(el)).toHaveLength(0);
    expect(footerItems(el)).not.toContain('favorites');
  });
});

describe('qué opciones muestra el pie (footer_options)', () => {
  it('sin la clave, todas las que la luz soporte', async () => {
    expect(footerItems(await mount({ favorite_colors: FAVORITES }))).toHaveLength(5);
  });

  it('solo las elegidas, en el orden fijo del pie', async () => {
    const el = await mount({ favorite_colors: FAVORITES, footer_options: ['effects', 'brightness'] });
    expect(footerItems(el)).toEqual(['brightness', 'effects']);
  });

  it('los favoritos no salen si no están entre las elegidas, aunque estén configurados', async () => {
    const el = await mount({ favorite_colors: FAVORITES, footer_options: ['brightness', 'color'] });
    expect(footerItems(el)).toEqual(['brightness', 'color']);
  });

  it('ninguna opción: no hay pie', async () => {
    const el = await mount({ footer_options: [] });
    expect(el.shadowRoot!.querySelector('.footer')).toBeNull();
  });

  it('pulsar la tarjeta sigue funcionando con el pie reducido', async () => {
    const el = await mount({ footer_options: ['brightness'] });
    click(el);
    expect(footerItems(el)).toEqual(['brightness']);
  });
});
