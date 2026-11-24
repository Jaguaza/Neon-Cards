import { describe, expect, it } from 'vitest';
import type { CoverState, CoverStateName } from '../../ha/cover';
import { isBinaryCoverType, isHaloOn, openFraction, resolveCoverType, statusGroup } from './cover-visual';

function cover(state: CoverStateName, deviceClass: string | null = 'shutter'): CoverState {
  return { entity: 'cover.salon', state, available: state !== 'unavailable', position: 50, tiltPosition: null, deviceClass, canOpen: true, canClose: true, canStop: true, canSetPosition: true, canSetTilt: false };
}

describe('statusGroup e isHaloOn', () => {
  it('agrupa los estados', () => {
    expect(statusGroup(cover('open'))).toBe('open');
    expect(statusGroup(cover('opening'))).toBe('moving');
    expect(statusGroup(cover('closing'))).toBe('moving');
    expect(statusGroup(cover('closed'))).toBe('closed');
    expect(statusGroup(cover('unavailable'))).toBe('alert');
  });

  it('el halo está encendido salvo cerrada o no disponible', () => {
    expect(isHaloOn(cover('open'))).toBe(true);
    expect(isHaloOn(cover('opening'))).toBe(true);
    expect(isHaloOn(cover('closing'))).toBe(true);
    expect(isHaloOn(cover('closed'))).toBe(false);
    expect(isHaloOn(cover('unavailable'))).toBe(false);
  });
});

describe('resolveCoverType', () => {
  it('sin cover_type, se deduce del device_class', () => {
    expect(resolveCoverType(cover('open', 'shutter'))).toBe('shutter');
    expect(resolveCoverType(cover('open', 'blind'))).toBe('blind');
    expect(resolveCoverType(cover('open', 'curtain'))).toBe('curtain');
    expect(resolveCoverType(cover('open', 'awning'))).toBe('awning');
  });

  it('sin clase o con una que la tarjeta no contempla es una persiana', () => {
    expect(resolveCoverType(cover('open', null))).toBe('shutter');
    for (const deviceClass of ['garage', 'gate', 'door', 'window', 'shade', 'damper', 'rara']) {
      expect(resolveCoverType(cover('open', deviceClass))).toBe('shutter');
    }
  });

  it('el cover_type de la configuración manda sobre el device_class', () => {
    expect(resolveCoverType(cover('open', 'shutter'), 'awning')).toBe('awning');
    expect(resolveCoverType(cover('open', null), 'curtain')).toBe('curtain');
    expect(resolveCoverType(cover('open', 'curtain'), 'blind')).toBe('blind');
  });

  it('projector y tv solo se eligen con cover_type, nunca por device_class', () => {
    expect(resolveCoverType(cover('open', null), 'projector')).toBe('projector');
    expect(resolveCoverType(cover('open', 'blind'), 'tv')).toBe('tv');
    expect(resolveCoverType(cover('open', 'projector'))).toBe('shutter');
  });

  it('un cover_type que no es uno de los seis se ignora', () => {
    expect(resolveCoverType(cover('open', 'blind'), 'garage')).toBe('blind');
    expect(resolveCoverType(cover('open', null), 7)).toBe('shutter');
    expect(resolveCoverType(cover('open', 'awning'), '')).toBe('awning');
  });
});

describe('openFraction', () => {
  it('usa el porcentaje si lo hay', () => {
    expect(openFraction(cover('open'), 72)).toBe(0.72);
    expect(openFraction(cover('closed'), 0)).toBe(0);
  });

  it('sin porcentaje, va al estado de destino: abierta o abriéndose, 1; cerrada, cerrándose o no disponible, 0', () => {
    expect(openFraction(cover('open'), null)).toBe(1);
    expect(openFraction(cover('opening'), null)).toBe(1);
    expect(openFraction(cover('closing'), null)).toBe(0);
    expect(openFraction(cover('closed'), null)).toBe(0);
    expect(openFraction(cover('unavailable'), null)).toBe(0);
  });
});

describe('isBinaryCoverType', () => {
  it('solo la pantalla de proyector y la TV son binarias', () => {
    expect(isBinaryCoverType('projector')).toBe(true);
    expect(isBinaryCoverType('tv')).toBe(true);
    for (const type of ['shutter', 'blind', 'curtain', 'awning'] as const) expect(isBinaryCoverType(type)).toBe(false);
  });
});
