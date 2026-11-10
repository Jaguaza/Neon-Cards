// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FULL_LIGHT, closeButton, footerButton, footerItems, hassWith, mount, nextButton, setCardWidth, slider } from './neon-light-card.fixtures';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

/** Pone la tarjeta dentro de una rejilla de 12 columnas (36 px con 8 px de separación), como una sección de Home Assistant, y le da el ancho de `columns` columnas. */
async function mountInGrid(columns: number, hass?: unknown, config: Record<string, unknown> = {}) {
  vi.spyOn(window, 'getComputedStyle').mockImplementation(
    (element: Element) => ({ display: element.id === 'section' ? 'grid' : 'block', gridTemplateColumns: Array(12).fill('36px').join(' '), columnGap: '8px' }) as unknown as CSSStyleDeclaration
  );
  const el = await mount(config, hass);
  const section = document.createElement('div');
  section.id = 'section';
  document.body.appendChild(section);
  section.appendChild(el);
  await setCardWidth(el, columns * 36 + (columns - 1) * 8);
  return el;
}

describe('carrusel del pie según las columnas de la tarjeta', () => {
  it('a 12 columnas se ven los cuatro y no hay flecha', async () => {
    const el = await mountInGrid(12);
    expect(footerItems(el)).toEqual(['brightness', 'color_temp', 'color', 'effects']);
    expect(nextButton(el)).toBeNull();
  });

  it('a 9 columnas se ven tres y la flecha', async () => {
    const el = await mountInGrid(9);
    expect(footerItems(el)).toEqual(['brightness', 'color_temp', 'color']);
    expect(nextButton(el)).not.toBeNull();
  });

  it('a 6 columnas se ven dos y la flecha, que desliza de uno en uno y vuelve a empezar', async () => {
    const el = await mountInGrid(6);
    expect(footerItems(el)).toEqual(['brightness', 'color_temp']);
    const sequence: Array<Array<string | undefined>> = [];
    for (let i = 0; i < 4; i++) {
      nextButton(el)!.click();
      await el.updateComplete;
      sequence.push(footerItems(el));
    }
    expect(sequence).toEqual([
      ['color_temp', 'color'],
      ['color', 'effects'],
      ['effects', 'brightness'],
      ['brightness', 'color_temp'],
    ]);
  });

  it('a 4 columnas se ve uno y la flecha', async () => {
    const el = await mountInGrid(4);
    expect(footerItems(el)).toEqual(['brightness']);
    expect(nextButton(el)).not.toBeNull();
  });

  it('con tres visibles la flecha también desliza de uno en uno', async () => {
    const el = await mountInGrid(9);
    nextButton(el)!.click();
    await el.updateComplete;
    expect(footerItems(el)).toEqual(['color_temp', 'color', 'effects']);
  });

  it('si la tarjeta se ensancha o se estrecha, el número de iconos sigue a las columnas', async () => {
    const el = await mountInGrid(6);
    expect(footerItems(el)).toHaveLength(2);
    await setCardWidth(el, 12 * 36 + 11 * 8);
    expect(footerItems(el)).toHaveLength(4);
    expect(nextButton(el)).toBeNull();
    await setCardWidth(el, 9 * 36 + 8 * 8);
    expect(footerItems(el)).toHaveLength(3);
  });

  it('sin medir todavía se ven todos y no hay flecha', async () => {
    const el = await mount({});
    expect(footerItems(el)).toHaveLength(4);
    expect(nextButton(el)).toBeNull();
  });

  it('fuera de una rejilla de secciones usa el ancho en píxeles', async () => {
    const el = await mount({});
    await setCardWidth(el, 300);
    expect(footerItems(el)).toEqual(['brightness', 'color_temp']);
    expect(nextButton(el)).not.toBeNull();
    await setCardWidth(el, 622);
    expect(footerItems(el)).toHaveLength(4);
    expect(nextButton(el)).toBeNull();
  });

  it('pulsar la flecha no manda nada a la luz ni alterna la tarjeta', async () => {
    const calls: unknown[][] = [];
    const el = await mountInGrid(6, hassWith('on', { attributes: FULL_LIGHT, calls }));
    nextButton(el)!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(calls).toEqual([]);
  });

  it('un icono del carrusel abre su barra, y al cerrarla el carrusel sigue donde estaba', async () => {
    const el = await mountInGrid(6);
    nextButton(el)!.click();
    await el.updateComplete;
    footerButton(el, 'color').click();
    await el.updateComplete;
    expect(slider(el)).not.toBeNull();
    expect(nextButton(el)).toBeNull();
    closeButton(el).click();
    await el.updateComplete;
    expect(footerItems(el)).toEqual(['color_temp', 'color']);
  });

  it('una luz con menos opciones se adapta: con dos opciones a 6 columnas caben y no hay flecha', async () => {
    const el = await mountInGrid(6, hassWith('on', { attributes: { supported_color_modes: ['color_temp'] } }));
    expect(footerItems(el)).toEqual(['brightness', 'color_temp']);
    expect(nextButton(el)).toBeNull();
  });

  it('la flecha tiene su texto accesible en el idioma de Home Assistant', async () => {
    const el = await mountInGrid(6, hassWith('on', { attributes: FULL_LIGHT, language: 'en' }));
    expect(nextButton(el)!.getAttribute('aria-label')).toBe('Next');
  });

  it('con favoritos hay cinco opciones: a 12 columnas se ven todas y no hay flecha', async () => {
    const el = await mountInGrid(12, undefined, { favorite_colors: ['#ff0000', '#00ff00'] });
    expect(footerItems(el)).toEqual(['brightness', 'color_temp', 'color', 'favorites', 'effects']);
    expect(nextButton(el)).toBeNull();
  });

  it('con favoritos, a 9 columnas se ven tres y la flecha pasa por los favoritos y los efectos', async () => {
    const el = await mountInGrid(9, undefined, { favorite_colors: ['#ff0000', '#00ff00'] });
    expect(footerItems(el)).toEqual(['brightness', 'color_temp', 'color']);
    nextButton(el)!.click();
    await el.updateComplete;
    nextButton(el)!.click();
    await el.updateComplete;
    expect(footerItems(el)).toEqual(['color', 'favorites', 'effects']);
  });

  it('con favoritos, a 6 columnas se ven dos', async () => {
    const el = await mountInGrid(6, undefined, { favorite_colors: ['#ff0000'] });
    expect(footerItems(el)).toEqual(['brightness', 'color_temp']);
    expect(nextButton(el)).not.toBeNull();
  });
});
