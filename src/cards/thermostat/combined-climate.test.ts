import { describe, it, expect } from 'vitest';
import { buildDisplayState, combineClimates, findMutualExclusionTargets } from './combined-climate';
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
    presetMode: null,
    presetModes: [],
    fanMode: null,
    fanModes: [],
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

  it('preset y ventilador son siempre los de la entidad mostrada, no se mezclan', () => {
    const a = climate('climate.a', { presetMode: 'eco', presetModes: ['eco'], fanMode: 'low', fanModes: ['low'] });
    const b = climate('climate.b', {
      mode: 'cool',
      presetMode: 'comfort',
      presetModes: ['comfort', 'away'],
      fanMode: 'high',
      fanModes: ['high', 'auto'],
    });
    const activaB = buildDisplayState(combined([a, b]), null);
    expect(activaB.presetMode).toBe('comfort');
    expect(activaB.presetModes).toEqual(['comfort', 'away']);
    expect(activaB.fanMode).toBe('high');
    expect(activaB.fanModes).toEqual(['high', 'auto']);

    const bApagada = { ...b, mode: 'off' as const };
    const ambasApagadas = buildDisplayState(combined([a, bApagada]), 'climate.a');
    expect(ambasApagadas.entity).toBe('climate.a');
    expect(ambasApagadas.presetModes).toEqual(['eco']);
    expect(ambasApagadas.fanModes).toEqual(['low']);
  });

  it('una entidad sin preset ni ventilador no los expone', () => {
    const state = buildDisplayState(combined([climate('climate.a')]), null);
    expect(state.presetModes).toEqual([]);
    expect(state.fanModes).toEqual([]);
    expect(state.presetMode).toBeNull();
    expect(state.fanMode).toBeNull();
  });
});

describe('combineClimates', () => {
  const calefaccion = climate('climate.calefaccion', { hvacModes: ['off', 'heat', 'auto'] });
  const aire = climate('climate.aire', { hvacModes: ['off', 'cool', 'auto', 'fan_only'] });

  it('el selector es la unión de modos y cada modo lo gestiona la primera entidad que lo soporta', () => {
    const c = combineClimates([calefaccion, aire], undefined);
    expect(Array.from(c.modeOwner.keys()).sort()).toEqual(['auto', 'cool', 'fan_only', 'heat', 'off']);
    expect(c.modeOwner.get('heat')).toBe(calefaccion);
    expect(c.modeOwner.get('cool')).toBe(aire);
    expect(c.modeOwner.get('fan_only')).toBe(aire);
    expect(c.modeOwner.get('auto')).toBe(calefaccion);
  });

  it('mode_owner solo reasigna modos que soportan TODAS las entidades', () => {
    const c = combineClimates([calefaccion, aire], { auto: 2, heat: 2 });
    expect(c.modeOwner.get('auto')).toBe(aire);
    expect(c.modeOwner.get('heat')).toBe(calefaccion);
  });

  it('con una sola entidad ignora mode_owner', () => {
    const c = combineClimates([calefaccion], { heat: 2 });
    expect(c.modeOwner.get('heat')).toBe(calefaccion);
  });
});

describe('findMutualExclusionTargets', () => {
  const prev = (a: HvacMode, b: HvacMode) =>
    new Map<string, HvacMode>([
      ['climate.a', a],
      ['climate.b', b],
    ]);

  it('apaga la otra si una acaba de pasar a un modo activo distinto del suyo', () => {
    const a = climate('climate.a', { mode: 'heat' });
    const b = climate('climate.b', { mode: 'cool' });
    expect(findMutualExclusionTargets(combined([a, b]), prev('off', 'cool'))).toEqual(['climate.b']);
  });

  it('no toca nada si las dos acaban en el mismo modo', () => {
    const a = climate('climate.a', { mode: 'heat' });
    const b = climate('climate.b', { mode: 'heat' });
    expect(findMutualExclusionTargets(combined([a, b]), prev('off', 'heat'))).toEqual([]);
  });

  it('no hace nada con una sola entidad, sin cambios o si la que cambia pasa a off', () => {
    const a = climate('climate.a', { mode: 'heat' });
    expect(findMutualExclusionTargets(combined([a]), new Map([['climate.a', 'off']]))).toEqual([]);
    const b = climate('climate.b', { mode: 'cool' });
    expect(findMutualExclusionTargets(combined([a, b]), prev('heat', 'cool'))).toEqual([]);
    const apagada = climate('climate.a', { mode: 'off' });
    expect(findMutualExclusionTargets(combined([apagada, b]), prev('heat', 'cool'))).toEqual([]);
  });
});
