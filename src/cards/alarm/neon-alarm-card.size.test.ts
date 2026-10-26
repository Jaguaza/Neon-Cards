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

  it('la mediana muestra como mucho dos tipos en el pie; la grande tres', async () => {
    const hass = hassWith('armed_home');
    const types = ['motion', 'door', 'window', 'lock'];
    expect((await mount({ size: 'medium', footer_sensors: types }, hass)).shadowRoot!.querySelectorAll('.footer .item').length).toBe(2);
    expect((await mount({ footer_sensors: types }, hass)).shadowRoot!.querySelectorAll('.footer .item').length).toBe(3);
  });
});
