import { describe, expect, it } from 'vitest';
import { controlCommand } from './light-commands';
import { controlRange, footerItems } from './light-state';

describe('iconos del pie', () => {
  it('los controles que ofrece la luz y, al final, los efectos si los declara', () => {
    expect(footerItems({ supported_color_modes: ['color_temp', 'xy'], effect_list: ['rainbow'] })).toEqual(['brightness', 'color_temp', 'color', 'effects']);
    expect(footerItems({ supported_color_modes: ['brightness'] })).toEqual(['brightness']);
    expect(footerItems({ supported_color_modes: ['onoff'] })).toEqual([]);
  });
  it('una luz solo on/off con efectos tiene solo el icono de efectos', () => {
    expect(footerItems({ supported_color_modes: ['onoff'], effect_list: ['a'] })).toEqual(['effects']);
  });
});

describe('barra de cada control', () => {
  it('brillo de 1 a 100 con el valor actual (100 si no lo informa)', () => {
    expect(controlRange('brightness', { brightness: 128 })).toEqual({ min: 1, max: 100, value: 50, unit: '%' });
    expect(controlRange('brightness', {}).value).toBe(100);
  });
  it('temperatura en el rango de la luz', () => {
    expect(controlRange('color_temp', { min_color_temp_kelvin: 2700, max_color_temp_kelvin: 6000, color_temp_kelvin: 3000 })).toEqual({ min: 2700, max: 6000, value: 3000, unit: ' K' });
  });
  it('color: tono de 0 a 360', () => {
    expect(controlRange('color', { hs_color: [210, 70] })).toEqual({ min: 0, max: 360, value: 210, unit: '°' });
  });
});

describe('orden de cada control', () => {
  it('cada control manda su propio dato', () => {
    expect(controlCommand('brightness', 'light.sala', 40, {})).toEqual({ entity_id: 'light.sala', brightness_pct: 40 });
    expect(controlCommand('color_temp', 'light.sala', 3000, {})).toEqual({ entity_id: 'light.sala', color_temp_kelvin: 3000 });
  });
  it('el color conserva la saturación de la luz, o 100 si no tiene color', () => {
    expect(controlCommand('color', 'light.sala', 120, { hs_color: [10, 60] })).toEqual({ entity_id: 'light.sala', hs_color: [120, 60] });
    expect(controlCommand('color', 'light.sala', 120, {})).toEqual({ entity_id: 'light.sala', hs_color: [120, 100] });
  });
});
