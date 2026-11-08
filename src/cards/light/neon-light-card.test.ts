// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { ERROR_ICON } from '../../shared';
import { FULL_LIGHT, active, card, errored, fill, hassWith, iconName, mount, subtitle } from './neon-light-card.fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('icono que se enciende de abajo arriba', () => {
  it('apagada no se llena', async () => {
    const el = await mount({}, hassWith('off', { attributes: { ...FULL_LIGHT, brightness: null } }));
    expect(fill(el)).toBe('0%');
    expect(active(el)).toBe(false);
  });

  it('encendida se llena hasta el brillo marcado', async () => {
    const el = await mount({}, hassWith('on', { attributes: { ...FULL_LIGHT, brightness: 128 } }));
    expect(fill(el)).toBe('50%');
    expect(active(el)).toBe(true);
  });

  it('una luz solo on/off encendida se llena entera', async () => {
    const el = await mount({}, hassWith('on', { attributes: { supported_color_modes: ['onoff'] } }));
    expect(fill(el)).toBe('100%');
  });

  it('el icono propio manda, luego el de la entidad, luego la bombilla', async () => {
    expect(iconName(await mount({ icon: 'mdi:ceiling-light' }))).toBe('mdi:ceiling-light');
    document.body.innerHTML = '';
    expect(iconName(await mount({}, hassWith('on', { attributes: { icon: 'mdi:lamp' } })))).toBe('mdi:lamp');
    document.body.innerHTML = '';
    expect(iconName(await mount({}))).toBe('mdi:lightbulb');
  });
});

describe('luz no disponible', () => {
  it('muestra el icono de error y el halo de error, sin llenado', async () => {
    const el = await mount({ subtitle_type: 'state' }, hassWith('unavailable', { attributes: FULL_LIGHT }));
    expect(iconName(el)).toBe(ERROR_ICON);
    expect(errored(el)).toBe(true);
    expect(active(el)).toBe(false);
    expect(fill(el)).toBe('0%');
    expect(subtitle(el)).toBe('No disponible');
  });

  it('sin entidad se trata como no disponible', async () => {
    const el = await mount({ entity: undefined });
    expect(errored(el)).toBe(true);
  });
});

describe('subtítulo', () => {
  it('custom: texto libre', async () => {
    expect(subtitle(await mount({ subtitle: 'Salón' }))).toBe('Salón');
  });

  it('state: estado con brillo, en el idioma de Home Assistant', async () => {
    const attributes = { ...FULL_LIGHT, brightness: 178 };
    expect(subtitle(await mount({ subtitle_type: 'state' }, hassWith('on', { attributes })))).toBe('Encendida · 70%');
    document.body.innerHTML = '';
    expect(subtitle(await mount({ subtitle_type: 'state' }, hassWith('on', { attributes, language: 'en' })))).toBe('On · 70%');
  });

  it('state en un grupo: cuántas luces hay encendidas', async () => {
    const hass = hassWith('on', {
      attributes: { ...FULL_LIGHT, brightness: 255, entity_id: ['light.a', 'light.b', 'light.c'] },
      extraStates: { 'light.a': { state: 'on' }, 'light.b': { state: 'off' }, 'light.c': { state: 'on' } },
    });
    expect(subtitle(await mount({ subtitle_type: 'state' }, hass))).toBe('Encendida · 100% · 2 de 3 encendidas');
  });

  it('sin subtítulo no hay elemento', async () => {
    expect(subtitle(await mount({}))).toBeUndefined();
  });
});

describe('tarjeta', () => {
  it('el nombre sale de la config o, si no, de la entidad', async () => {
    const name = (el: HTMLElement) => el.shadowRoot!.querySelector('.name')!.textContent;
    expect(name(await mount({ name: 'Mi luz' }))).toBe('Mi luz');
    document.body.innerHTML = '';
    expect(name(await mount({}))).toBe('Luz sala');
  });

  it('la rejilla empieza a todo el ancho (12 columnas), con alto automático', async () => {
    const el = (await mount({})) as unknown as { getGridOptions(): { rows: string; columns: number; min_columns: number } };
    expect(el.getGridOptions()).toEqual({ rows: 'auto', columns: 12, min_columns: 4 });
  });

  it('el halo usa la paleta del editor', async () => {
    const el = await mount({ neon_palette: 'custom', neon_color1: '#ff0000', neon_color2: '#00ff00', neon_color3: '#0000ff' });
    expect(card(el).getAttribute('style')).toContain('#ff0000');
  });
});
