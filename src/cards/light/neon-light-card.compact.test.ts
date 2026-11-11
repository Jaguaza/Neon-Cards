// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { ERROR_ICON } from '../../shared';
import { FULL_LIGHT, active, card, errored, fill, footerButton, footerItems, hassWith, iconName, lightColor, mount, slider, subtitle } from './neon-light-card.fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

const compact = (config: Record<string, unknown> = {}) => ({ size: 'compact', ...config });
const hasFooter = (el: HTMLElement) => el.shadowRoot!.querySelector('.footer') !== null;
const gridOptions = (el: unknown) => (el as { getGridOptions(): unknown }).getGridOptions();

describe('tarjeta compacta («Compacta - Mediana»)', () => {
  it('es una fila de icono, nombre y subtítulo, sin pie ni divisor', async () => {
    const el = await mount(compact({ subtitle_type: 'state', name: 'Habitación' }), hassWith('on', { attributes: { ...FULL_LIGHT, brightness: 128 } }));
    expect(card(el).classList.contains('size-compact')).toBe(true);
    expect(el.shadowRoot!.querySelector('.name')!.textContent).toBe('Habitación');
    expect(subtitle(el)).toBe('Encendida · 50%');
    expect(hasFooter(el)).toBe(false);
    expect(el.shadowRoot!.querySelector('.divider')).toBeNull();
  });

  it('la grande sigue siendo la predeterminada, y un tamaño desconocido cuenta como la grande', async () => {
    expect(card(await mount({})).classList.contains('size-large')).toBe(true);
    document.body.innerHTML = '';
    const el = await mount({ size: 'medium' });
    expect(card(el).classList.contains('size-large')).toBe(true);
    expect(hasFooter(el)).toBe(true);
  });

  it('no tiene pie aunque haya favoritos y opciones del pie configurados', async () => {
    const el = await mount(compact({ favorite_colors: ['#ff0000'], footer_options: ['brightness', 'favorites'] }));
    expect(hasFooter(el)).toBe(false);
    expect(footerItems(el)).toEqual([]);
  });

  it('mantiene el efecto del icono: se llena de abajo arriba según el brillo, con el color de la luz y el borde', async () => {
    const el = await mount(compact(), hassWith('on', { attributes: { ...FULL_LIGHT, brightness: 128, rgb_color: [0, 255, 0] } }));
    expect(fill(el)).toBe('50%');
    expect(lightColor(el)).toBe('rgb(0, 255, 0)');
    expect(el.shadowRoot!.querySelector('.icon-base')).not.toBeNull();
    expect(el.shadowRoot!.querySelector('.icon-lit')).not.toBeNull();
  });

  it('apagada no se llena; encendida solo on/off se llena entera', async () => {
    expect(fill(await mount(compact(), hassWith('off', { attributes: FULL_LIGHT })))).toBe('0%');
    document.body.innerHTML = '';
    expect(fill(await mount(compact(), hassWith('on', { attributes: { supported_color_modes: ['onoff'] } })))).toBe('100%');
  });

  it('mantiene el halo: encendido con la luz encendida y de error si no está disponible', async () => {
    expect(active(await mount(compact()))).toBe(true);
    document.body.innerHTML = '';
    expect(active(await mount(compact(), hassWith('off', { attributes: FULL_LIGHT })))).toBe(false);
    document.body.innerHTML = '';
    const broken = await mount(compact({ subtitle_type: 'state' }), hassWith('unavailable', { attributes: FULL_LIGHT }));
    expect(errored(broken)).toBe(true);
    expect(iconName(broken)).toBe(ERROR_ICON);
    expect(fill(broken)).toBe('0%');
    expect(subtitle(broken)).toBe('No disponible');
  });

  it('empieza a 6 columnas, se puede reducir hasta 3 y tiene alto automático; la grande no cambia', async () => {
    expect(gridOptions(await mount(compact()))).toEqual({ rows: 'auto', columns: 6, min_columns: 3 });
    document.body.innerHTML = '';
    expect(gridOptions(await mount({}))).toEqual({ rows: 'auto', columns: 12, min_columns: 4 });
    document.body.innerHTML = '';
    const el = (await mount(compact())) as unknown as { getCardSize(): number };
    expect(el.getCardSize()).toBe(1);
  });

  it('al pasar de la grande a la compacta se cierra lo que hubiera abierto, y al volver salen los iconos', async () => {
    const el = await mount({});
    footerButton(el, 'brightness').click();
    await el.updateComplete;
    expect(slider(el)).not.toBeNull();
    el.setConfig({ entity: 'light.sala', size: 'compact' });
    await el.updateComplete;
    expect(hasFooter(el)).toBe(false);
    el.setConfig({ entity: 'light.sala' });
    await el.updateComplete;
    expect(footerItems(el)).toHaveLength(4);
    expect(slider(el)).toBeNull();
  });

  it('pulsar la tarjeta sigue lanzando la acción de Home Assistant', async () => {
    const el = await mount(compact());
    const actions: Array<{ action: string }> = [];
    el.addEventListener('hass-action', (ev) => actions.push((ev as CustomEvent).detail));
    card(el).dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({ action: 'tap' });
  });
});
