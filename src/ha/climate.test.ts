import { describe, it, expect } from 'vitest';
import { clampToStep, getClimateState, isClimateRunning } from './climate';
import type { ClimateState } from './climate';
import type { HomeAssistant } from './types';

function hassWith(entityId: string, state: string, attributes: Record<string, unknown> = {}): HomeAssistant {
  return {
    states: { [entityId]: { entity_id: entityId, state, last_changed: '', last_updated: '', attributes } },
    callService: async () => undefined,
  };
}

function climate(overrides: Partial<ClimateState> = {}): ClimateState {
  return {
    entity: 'climate.salon',
    mode: 'heat',
    hvacModes: ['off', 'heat'],
    hvacAction: null,
    currentTemperature: 20,
    targetTemperature: 22,
    minTemp: 7,
    maxTemp: 35,
    step: 0.5,
    available: true,
    ...overrides,
  };
}

describe('getClimateState', () => {
  it('devuelve null si la entidad no es del dominio climate o no existe', () => {
    expect(getClimateState('light.salon', hassWith('light.salon', 'on'))).toBeNull();
    expect(getClimateState('climate.no_existe', hassWith('climate.salon', 'heat'))).toBeNull();
  });

  it('lee modo, temperaturas, límites y paso de la entidad', () => {
    const hass = hassWith('climate.salon', 'heat', {
      hvac_modes: ['off', 'heat', 'cool'],
      hvac_action: 'heating',
      current_temperature: 19.5,
      temperature: 21,
      min_temp: 10,
      max_temp: 30,
      target_temp_step: 1,
    });
    expect(getClimateState('climate.salon', hass)).toEqual({
      entity: 'climate.salon',
      mode: 'heat',
      hvacModes: ['off', 'heat', 'cool'],
      hvacAction: 'heating',
      currentTemperature: 19.5,
      targetTemperature: 21,
      minTemp: 10,
      maxTemp: 30,
      step: 1,
      available: true,
    });
  });

  it('aplica valores por defecto cuando faltan atributos', () => {
    const state = getClimateState('climate.salon', hassWith('climate.salon', 'off'))!;
    expect(state.minTemp).toBe(7);
    expect(state.maxTemp).toBe(35);
    expect(state.step).toBe(0.5);
    expect(state.currentTemperature).toBeNull();
    expect(state.targetTemperature).toBeNull();
    expect(state.hvacAction).toBeNull();
    expect(state.hvacModes).toEqual([]);
  });

  it('ignora modos desconocidos y elimina duplicados de hvac_modes', () => {
    const hass = hassWith('climate.salon', 'heat', { hvac_modes: ['heat', 'heat', 'turbo', 'cool', 3] });
    expect(getClimateState('climate.salon', hass)!.hvacModes).toEqual(['heat', 'cool']);
  });

  it('un estado desconocido cae a off y unavailable/unknown marcan la entidad como no disponible', () => {
    expect(getClimateState('climate.salon', hassWith('climate.salon', 'raro'))!.mode).toBe('off');
    expect(getClimateState('climate.salon', hassWith('climate.salon', 'unavailable'))!.available).toBe(false);
    expect(getClimateState('climate.salon', hassWith('climate.salon', 'unknown'))!.available).toBe(false);
    expect(getClimateState('climate.salon', hassWith('climate.salon', 'heat'))!.available).toBe(true);
  });
});

describe('clampToStep', () => {
  it('redondea al múltiplo del paso más cercano contando desde el mínimo', () => {
    expect(clampToStep(21.3, 7, 35, 0.5)).toBe(21.5);
    expect(clampToStep(21.2, 7, 35, 0.5)).toBe(21);
    expect(clampToStep(20.4, 7, 35, 1)).toBe(20);
  });

  it('limita el resultado a [min, max]', () => {
    expect(clampToStep(2, 7, 35, 0.5)).toBe(7);
    expect(clampToStep(99, 7, 35, 0.5)).toBe(35);
  });

  it('no arrastra errores de coma flotante con pasos decimales', () => {
    expect(clampToStep(21.1, 16, 30, 0.1)).toBe(21.1);
    expect(clampToStep(16.3, 16, 30, 0.1)).toBe(16.3);
  });
});

describe('isClimateRunning', () => {
  it('nunca está funcionando en modo off', () => {
    expect(isClimateRunning(climate({ mode: 'off', hvacAction: 'heating' }))).toBe(false);
  });

  it('usa hvac_action si la entidad lo expone', () => {
    expect(isClimateRunning(climate({ hvacAction: 'heating' }))).toBe(true);
    expect(isClimateRunning(climate({ hvacAction: 'idle' }))).toBe(false);
    expect(isClimateRunning(climate({ hvacAction: 'off' }))).toBe(false);
  });

  it('sin hvac_action y sin temperaturas se considera funcionando', () => {
    expect(isClimateRunning(climate({ currentTemperature: null }))).toBe(true);
    expect(isClimateRunning(climate({ targetTemperature: null }))).toBe(true);
  });

  it('sin hvac_action compara consigna y temperatura actual según el modo', () => {
    expect(isClimateRunning(climate({ mode: 'heat', currentTemperature: 20, targetTemperature: 22 }))).toBe(true);
    expect(isClimateRunning(climate({ mode: 'heat', currentTemperature: 23, targetTemperature: 22 }))).toBe(false);
    expect(isClimateRunning(climate({ mode: 'cool', currentTemperature: 26, targetTemperature: 24 }))).toBe(true);
    expect(isClimateRunning(climate({ mode: 'cool', currentTemperature: 22, targetTemperature: 24 }))).toBe(false);
    expect(isClimateRunning(climate({ mode: 'auto', currentTemperature: 21, targetTemperature: 22 }))).toBe(true);
    expect(isClimateRunning(climate({ mode: 'auto', currentTemperature: 22, targetTemperature: 22 }))).toBe(false);
  });
});
