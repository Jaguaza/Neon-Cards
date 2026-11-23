import { describe, expect, it } from 'vitest';
import type { CoverState, CoverStateName } from '../../ha/cover';
import { coverGlyph, isHaloOn, openFraction, statusGroup } from './cover-visual';

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

describe('coverGlyph', () => {
  it('shutter y sin clase son la persiana enrollable; blind, la veneciana', () => {
    expect(coverGlyph(cover('open', 'shutter'))).toBe('shutter');
    expect(coverGlyph(cover('open', null))).toBe('shutter');
    expect(coverGlyph(cover('open', 'blind'))).toBe('blind');
  });

  it('curtain es la cortina y awning, el toldo', () => {
    expect(coverGlyph(cover('open', 'curtain'))).toBe('curtain');
    expect(coverGlyph(cover('open', 'awning'))).toBe('awning');
  });

  it('sin clase o con una que la tarjeta no contempla se dibuja como persiana', () => {
    expect(coverGlyph(cover('open', null))).toBe('shutter');
    for (const deviceClass of ['garage', 'gate', 'door', 'window', 'shade', 'damper', 'rara']) {
      expect(coverGlyph(cover('open', deviceClass))).toBe('shutter');
    }
  });
});

describe('openFraction', () => {
  it('usa el porcentaje si lo hay', () => {
    expect(openFraction(cover('open'), 72)).toBe(0.72);
    expect(openFraction(cover('closed'), 0)).toBe(0);
  });

  it('sin porcentaje, abierta del todo o cerrada según el estado', () => {
    expect(openFraction(cover('open'), null)).toBe(1);
    expect(openFraction(cover('opening'), null)).toBe(1);
    expect(openFraction(cover('closing'), null)).toBe(1);
    expect(openFraction(cover('closed'), null)).toBe(0);
    expect(openFraction(cover('unavailable'), null)).toBe(0);
  });
});
