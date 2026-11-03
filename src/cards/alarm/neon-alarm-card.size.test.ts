// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { resolveAlarmSize } from './alarm-size';
import { card, hassWith, mount } from './neon-alarm-card.fixtures';
import type { Card } from './neon-alarm-card.fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

const grid = (el: Card) => (el as unknown as { getGridOptions(): Record<string, unknown> }).getGridOptions();

describe('tamaño de la Alarm card', () => {
  it('por defecto es grande; un valor desconocido también', () => {
    expect(resolveAlarmSize(undefined)).toBe('large');
    expect(resolveAlarmSize({})).toBe('large');
    expect(resolveAlarmSize({ size: 'enorme' as never })).toBe('large');
    expect(resolveAlarmSize({ size: 'compact' })).toBe('compact');
  });

  it('el tamaño pone su clase en la tarjeta', async () => {
    for (const size of ['compact', 'medium', 'large']) {
      expect(card(await mount({ size })).classList.contains(`size-${size}`), size).toBe(true);
    }
    expect(card(await mount({})).classList.contains('size-large')).toBe(true);
  });

  it('getGridOptions: columnas de inicio y mínimo según el tamaño, alto automático', async () => {
    expect(grid(await mount({}))).toEqual({ rows: 'auto', columns: 12, min_columns: 4 });
    expect(grid(await mount({ size: 'medium' }))).toEqual({ rows: 'auto', columns: 6, min_columns: 4 });
    expect(grid(await mount({ size: 'compact' }))).toEqual({ rows: 'auto', columns: 3, min_columns: 3 });
  });

  it('la compacta no tiene menú de tres puntos ni pie, aunque haya sensores configurados', async () => {
    const hass = hassWith('armed_home', { extraStates: { 'binary_sensor.m': { state: 'on', attributes: { device_class: 'motion' } } } });
    const el = await mount({ size: 'compact', footer_sensors: ['motion'] }, hass);
    expect(el.shadowRoot!.querySelector('.menu')).toBeNull();
    expect(el.shadowRoot!.querySelector('.footer')).toBeNull();
  });

  it('la mediana muestra como mucho tres tipos en el pie (fichas) y la grande cuatro (filas)', async () => {
    const hass = hassWith('armed_home');
    const types = ['motion', 'door', 'window', 'lock', 'smoke'];
    expect((await mount({ size: 'medium', footer_sensors: types }, hass)).shadowRoot!.querySelectorAll('.footer .chip').length).toBe(3);
    expect((await mount({ footer_sensors: types }, hass)).shadowRoot!.querySelectorAll('.footer .item').length).toBe(4);
  });

  it('la compacta apila el escudo sobre el texto y no corta el nombre ni el estado con puntos suspensivos', async () => {
    const el = await mount({ size: 'compact' });
    const css = (el.constructor as unknown as { styles: Array<{ cssText: string }> }).styles.map((style) => style.cssText).join('\n');
    // Todas las reglas con ese selector juntas (algunas van en una @container para anchos muy pequeños).
    const rule = (selector: string) =>
      css
        .split(selector)
        .slice(1)
        .map((part) => part.slice(0, part.indexOf('}')))
        .join('\n');
    expect(rule('.size-compact .header {')).toContain('flex-direction: column');
    expect(rule('.size-compact .name {')).toContain('white-space: normal');
    expect(rule('.size-compact .status {')).toContain('white-space: normal');
    expect(rule('.size-compact .status-text {')).toContain('text-overflow: clip');
  });

  it('la compacta tiene reglas para huecos minúsculos (portátil a 150 %): menos relleno, letra del estado adaptable y punto de estado en la esquina', async () => {
    const el = await mount({ size: 'compact' });
    const css = (el.constructor as unknown as { styles: Array<{ cssText: string }> }).styles.map((style) => style.cssText).join('\n');
    const after = (marker: string) => css.slice(css.indexOf(marker));
    // Nivel pequeño (3-4 columnas): contenido hacia fuera y letra del estado que se adapta al ancho.
    const small = after('@container (max-width: 72px)');
    expect(small).toContain('margin: -4px');
    expect(small).toMatch(/font-size: clamp\([^)]*cqi/);
    // Nivel minúsculo (~65 px): el punto sale de la línea del texto, a la esquina.
    const tiny = after('@container (max-width: 52px)');
    expect(tiny).toMatch(/\.size-compact \.status-dot \{[^}]*position: absolute/);
  });

  it('la mediana parte el nombre y el estado en líneas en vez de cortarlos con puntos suspensivos', async () => {
    const el = await mount({ size: 'medium' });
    const css = (el.constructor as unknown as { styles: Array<{ cssText: string }> }).styles.map((style) => style.cssText).join('\n');
    const rules = (selector: string) =>
      css
        .split(selector)
        .slice(1)
        .map((part) => part.slice(0, part.indexOf('}')))
        .join('\n');
    expect(rules('.size-medium .name {')).toContain('white-space: normal');
    expect(rules('.size-medium .name {')).toContain('-webkit-line-clamp: 2');
    expect(rules('.size-medium .status {')).toContain('white-space: normal');
    expect(rules('.size-medium .status-text {')).toContain('text-overflow: clip');
  });

  it('la mediana estrecha (portátil a 150 %) pone el escudo arriba y las fichas con el número bajo el icono', async () => {
    const el = await mount({ size: 'medium' });
    const css = (el.constructor as unknown as { styles: Array<{ cssText: string }> }).styles.map((style) => style.cssText).join('\n');
    const after = (marker: string) => css.slice(css.indexOf(marker));
    // ≤150px de contenido: el escudo arriba y el texto a todo el ancho, sin reservar sitio para los tres puntos.
    const stacked = after('@container (max-width: 150px) {\n    .size-medium .header');
    expect(stacked).toMatch(/\.size-medium \.header \{[^}]*flex-direction: column/);
    expect(stacked).toMatch(/\.size-medium \.name \{[^}]*padding-right: 0/);
    // ≤110px: las fichas apilan icono y número para que quepan las tres.
    const narrow = after('@container (max-width: 110px)');
    expect(narrow).toMatch(/\.chip \{[^}]*flex-direction: column/);
  });
});
