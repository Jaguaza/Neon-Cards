// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { FULL_LIGHT, closeButton, footerButton, footerItems, hassWith, mount, nextButton, setCardWidth, slider } from './neon-light-card.fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('carrusel del pie según el ancho de la tarjeta', () => {
  it('a 12 columnas (~620 px) se ven los cuatro y no hay flecha', async () => {
    const el = await mount({});
    await setCardWidth(el, 622);
    expect(footerItems(el)).toEqual(['brightness', 'color_temp', 'color', 'effects']);
    expect(nextButton(el)).toBeNull();
  });

  it('sin medir todavía se ven todos y no hay flecha', async () => {
    const el = await mount({});
    expect(footerItems(el)).toHaveLength(4);
    expect(nextButton(el)).toBeNull();
  });

  it('a 9 columnas (~460 px) se ven tres y la flecha', async () => {
    const el = await mount({});
    await setCardWidth(el, 464);
    expect(footerItems(el)).toEqual(['brightness', 'color_temp', 'color']);
    expect(nextButton(el)).not.toBeNull();
  });

  it('a 6 columnas (~310 px) se ven dos y la flecha, que desliza de uno en uno y vuelve a empezar', async () => {
    const el = await mount({});
    await setCardWidth(el, 307);
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

  it('con tres visibles la flecha también desliza de uno en uno', async () => {
    const el = await mount({});
    await setCardWidth(el, 464);
    nextButton(el)!.click();
    await el.updateComplete;
    expect(footerItems(el)).toEqual(['color_temp', 'color', 'effects']);
  });

  it('pulsar la flecha no manda nada a la luz ni alterna la tarjeta', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('on', { attributes: FULL_LIGHT, calls }));
    await setCardWidth(el, 307);
    nextButton(el)!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(calls).toEqual([]);
  });

  it('un icono del carrusel abre su barra, y al cerrarla el carrusel sigue donde estaba', async () => {
    const el = await mount({});
    await setCardWidth(el, 307);
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
    const el = await mount({}, hassWith('on', { attributes: { supported_color_modes: ['color_temp'] } }));
    await setCardWidth(el, 307);
    expect(footerItems(el)).toEqual(['brightness', 'color_temp']);
    expect(nextButton(el)).toBeNull();
  });

  it('si la tarjeta se ensancha, vuelven a verse todos', async () => {
    const el = await mount({});
    await setCardWidth(el, 307);
    expect(nextButton(el)).not.toBeNull();
    await setCardWidth(el, 622);
    expect(footerItems(el)).toHaveLength(4);
    expect(nextButton(el)).toBeNull();
  });

  it('la flecha tiene su texto accesible en el idioma de Home Assistant', async () => {
    const el = await mount({}, hassWith('on', { attributes: FULL_LIGHT, language: 'en' }));
    await setCardWidth(el, 307);
    expect(nextButton(el)!.getAttribute('aria-label')).toBe('Next');
  });
});
