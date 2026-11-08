// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { FULL_LIGHT, active, click, closeButton, dragSlider, effectButtons, fill, footerButton, footerItems, hassWith, lightColor, mount, slider, view } from './neon-light-card.fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('iconos del pie según lo que soporta la luz', () => {
  it('una luz con todo: brillo, temperatura, color y efectos', async () => {
    expect(footerItems(await mount({}))).toEqual(['brightness', 'color_temp', 'color', 'effects']);
  });

  it('solo brillo', async () => {
    const el = await mount({}, hassWith('on', { attributes: { supported_color_modes: ['brightness'] } }));
    expect(footerItems(el)).toEqual(['brightness']);
  });

  it('una luz solo on/off no tiene pie', async () => {
    const el = await mount({}, hassWith('on', { attributes: { supported_color_modes: ['onoff'] } }));
    expect(el.shadowRoot!.querySelector('.footer')).toBeNull();
  });

  it('la luz no disponible no tiene pie', async () => {
    const el = await mount({}, hassWith('unavailable', { attributes: FULL_LIGHT }));
    expect(el.shadowRoot!.querySelector('.footer')).toBeNull();
  });

  it('con la luz apagada los iconos siguen visibles', async () => {
    expect(footerItems(await mount({}, hassWith('off', { attributes: FULL_LIGHT })))).toHaveLength(4);
  });
});

describe('barra de un control en el pie', () => {
  it('al pulsar el icono de brillo aparece su barra en el mismo pie y no se manda nada', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('on', { attributes: { ...FULL_LIGHT, brightness: 128 }, calls }));
    footerButton(el, 'brightness').click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('.footer')).toHaveLength(1);
    expect(footerItems(el)).toEqual([]);
    expect(slider(el)!.value).toBe('50');
    expect(slider(el)!.min).toBe('1');
    expect(slider(el)!.max).toBe('100');
    expect(calls).toEqual([]);
  });

  it('pulsar un icono del pie no alterna la luz', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('on', { attributes: FULL_LIGHT, calls }));
    footerButton(el, 'brightness').dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(calls).toEqual([]);
  });

  it('al soltar la barra manda light.turn_on con el brillo', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('on', { attributes: { ...FULL_LIGHT, brightness: 128 }, calls }));
    footerButton(el, 'brightness').click();
    await el.updateComplete;
    dragSlider(slider(el)!, 80);
    await el.updateComplete;
    expect(calls).toEqual([['light', 'turn_on', { entity_id: 'light.sala', brightness_pct: 80 }]]);
  });

  it('mientras se arrastra el icono se ilumina según la barra', async () => {
    const el = await mount({}, hassWith('on', { attributes: { ...FULL_LIGHT, brightness: 128 } }));
    footerButton(el, 'brightness').click();
    await el.updateComplete;
    slider(el)!.value = '30';
    slider(el)!.dispatchEvent(new Event('input', { bubbles: true }));
    await el.updateComplete;
    expect(fill(el)).toBe('30%');
  });

  it('la temperatura usa el rango de la luz y manda kelvin', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('on', { attributes: { ...FULL_LIGHT, min_color_temp_kelvin: 2700, max_color_temp_kelvin: 6000, color_temp_kelvin: 3000 }, calls }));
    footerButton(el, 'color_temp').click();
    await el.updateComplete;
    expect([slider(el)!.min, slider(el)!.max, slider(el)!.value]).toEqual(['2700', '6000', '3000']);
    dragSlider(slider(el)!, 4000);
    expect(calls).toEqual([['light', 'turn_on', { entity_id: 'light.sala', color_temp_kelvin: 4000 }]]);
  });

  it('el color manda el tono y conserva la saturación', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('on', { attributes: { ...FULL_LIGHT, hs_color: [10, 60] }, calls }));
    footerButton(el, 'color').click();
    await el.updateComplete;
    dragSlider(slider(el)!, 200);
    expect(calls).toEqual([['light', 'turn_on', { entity_id: 'light.sala', hs_color: [200, 60] }]]);
  });

  it('con la luz apagada, usar la barra la enciende con ese valor y el halo se enciende ya', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('off', { attributes: FULL_LIGHT, calls }));
    footerButton(el, 'brightness').click();
    await el.updateComplete;
    dragSlider(slider(el)!, 60);
    await el.updateComplete;
    expect(calls).toEqual([['light', 'turn_on', { entity_id: 'light.sala', brightness_pct: 60 }]]);
    expect(active(el)).toBe(true);
  });

  it('si Home Assistant rechaza la orden, el halo vuelve a apagarse', async () => {
    const el = await mount({}, hassWith('off', { attributes: FULL_LIGHT, reject: new Error('fallo') }));
    footerButton(el, 'brightness').click();
    await el.updateComplete;
    dragSlider(slider(el)!, 60);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await el.updateComplete;
    expect(active(el)).toBe(false);
  });

  it('el botón de cerrar devuelve los iconos', async () => {
    const el = await mount({});
    footerButton(el, 'color').click();
    await el.updateComplete;
    closeButton(el).click();
    await el.updateComplete;
    expect(footerItems(el)).toHaveLength(4);
    expect(slider(el)).toBeNull();
  });

  it('mover la barra no dispara la acción de la tarjeta', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('on', { attributes: FULL_LIGHT, calls }));
    footerButton(el, 'brightness').click();
    await el.updateComplete;
    slider(el)!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(calls).toEqual([]);
  });
});

describe('color del icono mientras se arrastra', () => {
  it('la barra de color tiñe el icono en directo, con la saturación de la luz', async () => {
    const el = await mount({}, hassWith('on', { attributes: { ...FULL_LIGHT, rgb_color: [255, 0, 0], hs_color: [0, 100] } }));
    footerButton(el, 'color').click();
    await el.updateComplete;
    slider(el)!.value = '120';
    slider(el)!.dispatchEvent(new Event('input', { bubbles: true }));
    await el.updateComplete;
    expect(lightColor(el)).toBe('hsl(120, 100%, 50%)');
  });

  it('la barra de temperatura tiñe el icono con el color de esa temperatura', async () => {
    const el = await mount({}, hassWith('on', { attributes: { ...FULL_LIGHT, rgb_color: [255, 0, 0] } }));
    footerButton(el, 'color_temp').click();
    await el.updateComplete;
    slider(el)!.value = '2000';
    slider(el)!.dispatchEvent(new Event('input', { bubbles: true }));
    await el.updateComplete;
    expect(lightColor(el)).toBe('rgb(255, 137, 14)');
  });

  it('la barra de brillo no cambia el color del icono', async () => {
    const el = await mount({}, hassWith('on', { attributes: { ...FULL_LIGHT, rgb_color: [0, 255, 0] } }));
    footerButton(el, 'brightness').click();
    await el.updateComplete;
    slider(el)!.value = '30';
    slider(el)!.dispatchEvent(new Event('input', { bubbles: true }));
    await el.updateComplete;
    expect(lightColor(el)).toBe('rgb(0, 255, 0)');
  });
});

describe('efectos', () => {
  it('el icono abre una lista flotante con los efectos y marca el activo', async () => {
    const el = await mount({}, hassWith('on', { attributes: { ...FULL_LIGHT, effect: 'pulse' } }));
    footerButton(el, 'effects').click();
    await el.updateComplete;
    expect(view(el)).not.toBeNull();
    expect(effectButtons(el).map((b) => b.textContent!.trim())).toEqual(['rainbow', 'pulse']);
    expect(effectButtons(el).map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'true']);
    expect(el.shadowRoot!.querySelector('.content')!.classList.contains('content--hidden')).toBe(true);
  });

  it('elegir un efecto lo manda y cierra la lista', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('on', { attributes: FULL_LIGHT, calls }));
    footerButton(el, 'effects').click();
    await el.updateComplete;
    effectButtons(el)[0].click();
    await el.updateComplete;
    expect(calls).toEqual([['light', 'turn_on', { entity_id: 'light.sala', effect: 'rainbow' }]]);
    expect(view(el)).toBeNull();
  });

  it('cerrar la lista no manda nada', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('on', { attributes: FULL_LIGHT, calls }));
    footerButton(el, 'effects').click();
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLButtonElement>('.view-close')!.click();
    await el.updateComplete;
    expect(view(el)).toBeNull();
    expect(calls).toEqual([]);
  });

  it('pulsar dentro de la lista no alterna la luz', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('on', { attributes: FULL_LIGHT, calls }));
    footerButton(el, 'effects').click();
    await el.updateComplete;
    view(el)!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(calls).toEqual([]);
  });

  it('si la luz deja de estar disponible, la lista se cierra', async () => {
    const el = await mount({});
    footerButton(el, 'effects').click();
    await el.updateComplete;
    el.hass = hassWith('unavailable', { attributes: FULL_LIGHT });
    await el.updateComplete;
    expect(view(el)).toBeNull();
  });
});

describe('gestos de la tarjeta', () => {
  it('pulsar la tarjeta lanza la acción toggle de Home Assistant y no una orden propia', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('on', { attributes: FULL_LIGHT, calls }));
    const actions: Array<{ action: string }> = [];
    el.addEventListener('hass-action', (ev) => actions.push((ev as CustomEvent).detail));
    click(el);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({ action: 'tap' });
    expect(calls).toEqual([]);
  });
});

describe('estado que confirma la luz', () => {
  it('mientras la luz no confirma, la barra mantiene lo elegido; al confirmar, muestra el valor real', async () => {
    const el = await mount({}, hassWith('on', { attributes: { ...FULL_LIGHT, brightness: 128 } }));
    footerButton(el, 'brightness').click();
    await el.updateComplete;
    dragSlider(slider(el)!, 90);
    await el.updateComplete;
    expect(slider(el)!.value).toBe('90');
    el.hass = { ...(el.hass as object) };
    await el.updateComplete;
    expect(slider(el)!.value).toBe('90');
    el.hass = hassWith('on', { attributes: { ...FULL_LIGHT, brightness: 100 } });
    await el.updateComplete;
    expect(slider(el)!.value).toBe('39');
  });
});
