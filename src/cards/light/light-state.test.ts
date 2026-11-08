import { describe, expect, it } from 'vitest';
import type { HassEntityState, HomeAssistant } from '../../ha/types';
import {
  availableControls,
  brightnessPercent,
  currentEffect,
  currentHue,
  currentKelvin,
  currentSaturation,
  effectList,
  fillPercent,
  groupCount,
  isLightBroken,
  isLightOn,
  kelvinRange,
} from './light-state';

const stateObj = (state: string, attributes: Record<string, unknown> = {}): HassEntityState => ({ entity_id: 'light.sala', state, last_changed: '', last_updated: '', attributes });
const hassOf = (states: Record<string, HassEntityState>): HomeAssistant => ({ states, callService: async () => {} });

describe('estado de la luz', () => {
  it('sin entity: está rota; sin hass todavía no; con estado no disponible sí', () => {
    expect(isLightBroken({}, hassOf({}))).toBe(true);
    expect(isLightBroken({ entity: 'light.sala' }, undefined)).toBe(false);
    expect(isLightBroken({ entity: 'light.sala' }, hassOf({}))).toBe(true);
    expect(isLightBroken({ entity: 'light.sala' }, hassOf({ 'light.sala': stateObj('unavailable') }))).toBe(true);
    expect(isLightBroken({ entity: 'light.sala' }, hassOf({ 'light.sala': stateObj('off') }))).toBe(false);
  });

  it('encendida solo con estado on', () => {
    expect(isLightOn({ entity: 'light.sala' }, hassOf({ 'light.sala': stateObj('on') }))).toBe(true);
    expect(isLightOn({ entity: 'light.sala' }, hassOf({ 'light.sala': stateObj('off') }))).toBe(false);
  });
});

describe('controles según supported_color_modes', () => {
  it('onoff no ofrece ninguno', () => {
    expect(availableControls({ supported_color_modes: ['onoff'] })).toEqual([]);
  });
  it('brightness solo ofrece brillo', () => {
    expect(availableControls({ supported_color_modes: ['brightness'] })).toEqual(['brightness']);
  });
  it('color_temp ofrece brillo y temperatura', () => {
    expect(availableControls({ supported_color_modes: ['color_temp'] })).toEqual(['brightness', 'color_temp']);
  });
  it('cualquier modo de color ofrece brillo y color, y los tres con color_temp', () => {
    for (const mode of ['hs', 'xy', 'rgb', 'rgbw', 'rgbww']) expect(availableControls({ supported_color_modes: [mode] })).toEqual(['brightness', 'color']);
    expect(availableControls({ supported_color_modes: ['color_temp', 'xy'] })).toEqual(['brightness', 'color_temp', 'color']);
  });
  it('sin supported_color_modes no ofrece nada', () => {
    expect(availableControls(undefined)).toEqual([]);
    expect(availableControls({ supported_color_modes: 'hs' })).toEqual([]);
  });
});

describe('brillo y llenado del icono', () => {
  it('convierte 0-255 a porcentaje entre 1 y 100', () => {
    expect(brightnessPercent({ brightness: 255 })).toBe(100);
    expect(brightnessPercent({ brightness: 128 })).toBe(50);
    expect(brightnessPercent({ brightness: 0 })).toBe(1);
    expect(brightnessPercent({})).toBeUndefined();
  });
  it('apagada no se llena; encendida sigue el brillo; sin brillo se llena entera', () => {
    expect(fillPercent(stateObj('off', { brightness: 200 }))).toBe(0);
    expect(fillPercent(stateObj('on', { brightness: 128 }))).toBe(50);
    expect(fillPercent(stateObj('on', {}))).toBe(100);
    expect(fillPercent(undefined)).toBe(0);
  });
  it('con brillo muy bajo se ve al menos el mínimo', () => {
    expect(fillPercent(stateObj('on', { brightness: 3 }))).toBe(6);
  });
  it('la vista previa manda, incluso con la luz apagada', () => {
    expect(fillPercent(stateObj('off'), 70)).toBe(70);
    expect(fillPercent(stateObj('on', { brightness: 255 }), 30)).toBe(30);
  });
});

describe('temperatura de color y color', () => {
  it('usa el rango de la luz o el predeterminado', () => {
    expect(kelvinRange({ min_color_temp_kelvin: 2700, max_color_temp_kelvin: 6000 })).toEqual({ min: 2700, max: 6000 });
    expect(kelvinRange({})).toEqual({ min: 2000, max: 6500 });
    expect(kelvinRange({ min_color_temp_kelvin: 6000, max_color_temp_kelvin: 2700 })).toEqual({ min: 2000, max: 6500 });
  });
  it('la temperatura actual queda dentro del rango; sin ella, el punto medio', () => {
    expect(currentKelvin({ color_temp_kelvin: 3000 })).toBe(3000);
    expect(currentKelvin({ color_temp_kelvin: 9000 })).toBe(6500);
    expect(currentKelvin({ color_temp_kelvin: null })).toBe(4250);
  });
  it('tono y saturación de hs_color; sin color, 0 y 100', () => {
    expect(currentHue({ hs_color: [120.4, 55.2] })).toBe(120);
    expect(currentSaturation({ hs_color: [120.4, 55.2] })).toBe(55);
    expect(currentHue({})).toBe(0);
    expect(currentSaturation({})).toBe(100);
  });
});

describe('efectos', () => {
  it('lee la lista y el efecto activo solo si está en ella', () => {
    expect(effectList({ effect_list: ['a', 'b', 3] })).toEqual(['a', 'b']);
    expect(effectList({})).toEqual([]);
    expect(currentEffect({ effect_list: ['a', 'b'], effect: 'b' })).toBe('b');
    expect(currentEffect({ effect_list: ['a'], effect: 'None' })).toBeUndefined();
  });
});

describe('grupos de luces', () => {
  const states = { 'light.a': stateObj('on'), 'light.b': stateObj('off'), 'light.c': stateObj('on') };
  it('cuenta las miembros encendidas', () => {
    const group = stateObj('on', { entity_id: ['light.a', 'light.b', 'light.c'] });
    expect(groupCount(group, hassOf(states))).toEqual({ on: 2, total: 3 });
  });
  it('una luz normal o un grupo vacío no tienen recuento', () => {
    expect(groupCount(stateObj('on'), hassOf(states))).toBeUndefined();
    expect(groupCount(stateObj('on', { entity_id: [] }), hassOf(states))).toBeUndefined();
  });
});
