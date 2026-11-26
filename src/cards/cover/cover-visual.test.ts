import { describe, expect, it } from 'vitest';
import type { CoverState, CoverStateName } from '../../ha/cover';
import { iconColor, isBinaryCoverType, isHaloOn, openFraction, resolveCoverSize, resolveCoverType, statusDotColor, statusGroup } from './cover-visual';

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
  it('sin cover_type es una persiana enrollable', () => {
    expect(resolveCoverType()).toBe('shutter');
    expect(resolveCoverType(undefined)).toBe('shutter');
  });

  it('el cover_type de la configuración elige el dibujo', () => {
    for (const type of ['shutter', 'blind', 'curtain', 'awning', 'projector', 'tv'] as const) expect(resolveCoverType(type)).toBe(type);
  });

  it('un cover_type que no es uno de los seis se ignora', () => {
    for (const bad of ['garage', '', 7, null, 'auto']) expect(resolveCoverType(bad)).toBe('shutter');
  });
});

describe('statusDotColor', () => {
  it('devuelve el color de cada grupo si es válido', () => {
    const config = { status_color_open: '#112233', status_color_moving: ' rgb(1, 2, 3) ', status_color_closed: 'red', status_color_alert: 'var(--error-color)' };
    expect(statusDotColor(config, 'open')).toBe('#112233');
    expect(statusDotColor(config, 'moving')).toBe('rgb(1, 2, 3)');
    expect(statusDotColor(config, 'closed')).toBe('red');
    expect(statusDotColor(config, 'alert')).toBe('var(--error-color)');
  });

  it('sin color, con uno inválido o sin config es undefined', () => {
    expect(statusDotColor({}, 'open')).toBeUndefined();
    expect(statusDotColor({ status_color_open: 'rojo;color:red' }, 'open')).toBeUndefined();
    expect(statusDotColor({ status_color_open: 5 }, 'open')).toBeUndefined();
    expect(statusDotColor(undefined, 'closed')).toBeUndefined();
  });
});

describe('iconColor', () => {
  it('devuelve el color del icono si es válido', () => {
    expect(iconColor({ icon_color: '#ff8800' })).toBe('#ff8800');
    expect(iconColor({ icon_color: ' hsl(10, 50%, 50%) ' })).toBe('hsl(10, 50%, 50%)');
  });

  it('sin color o con uno inválido es undefined: el icono sigue al halo', () => {
    expect(iconColor({})).toBeUndefined();
    expect(iconColor({ icon_color: 'rojo;color:red' })).toBeUndefined();
    expect(iconColor(undefined)).toBeUndefined();
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

describe('resolveCoverSize', () => {
  it('large, medium o compact, tal cual', () => {
    expect(resolveCoverSize('large')).toBe('large');
    expect(resolveCoverSize('medium')).toBe('medium');
    expect(resolveCoverSize('compact')).toBe('compact');
  });

  it('sin valor, o con uno que no es uno de los tres, es la grande', () => {
    for (const value of [undefined, '', 'giant', 'normal', 3, null]) expect(resolveCoverSize(value)).toBe('large');
  });
});
