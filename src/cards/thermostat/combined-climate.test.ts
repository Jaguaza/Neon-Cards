import { describe, it, expect } from 'vitest';
import { buildDisplayState } from './combined-climate';
import type { CombinedClimate } from './combined-climate';
import type { ClimateState, HvacMode } from '../../ha/climate';

function climate(entity: string, overrides: Partial<ClimateState> = {}): ClimateState {
  return {
    entity,
    mode: 'off',
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

function combined(entities: ClimateState[], modes: HvacMode[] = ['off', 'heat', 'cool']): CombinedClimate {
  return { entities, modeOwner: new Map(modes.map((m) => [m, entities[0]])) };
}

describe('buildDisplayState', () => {
  it('usa la entidad activa y su modo y acción', () => {
    const a = climate('climate.a');
    const b = climate('climate.b', { mode: 'cool', hvacAction: 'cooling', currentTemperature: 26, targetTemperature: 24 });
    const state = buildDisplayState(combined([a, b]), null);
    expect(state.entity).toBe('climate.b');
    expect(state.mode).toBe('cool');
    expect(state.hvacAction).toBe('cooling');
    expect(state.currentTemperature).toBe(26);
    expect(state.targetTemperature).toBe(24);
  });

  it('con las dos apagadas muestra la última que estuvo activa y el modo off', () => {
    const a = climate('climate.a', { currentTemperature: 18 });
    const b = climate('climate.b', { currentTemperature: 19 });
    const state = buildDisplayState(combined([a, b]), 'climate.b');
    expect(state.entity).toBe('climate.b');
    expect(state.mode).toBe('off');
    expect(state.hvacAction).toBeNull();
    expect(state.currentTemperature).toBe(19);
  });

  it('si nunca hubo una activa cae a la primera configurada', () => {
    const state = buildDisplayState(combined([climate('climate.a'), climate('climate.b')]), null);
    expect(state.entity).toBe('climate.a');
    expect(state.mode).toBe('off');
  });

  it('hvacModes es siempre la unión resuelta en modeOwner', () => {
    const a = climate('climate.a', { hvacModes: ['off', 'heat'] });
    const state = buildDisplayState(combined([a], ['off', 'heat', 'dry']), null);
    expect(state.hvacModes).toEqual(['off', 'heat', 'dry']);
  });
});
