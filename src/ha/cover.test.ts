import { describe, it, expect } from 'vitest';
import { COVER_FEATURES, getCoverState } from './cover';
import type { HomeAssistant } from './types';

function hassWith(entityId: string, state: string, attributes: Record<string, unknown> = {}): HomeAssistant {
  return {
    states: { [entityId]: { entity_id: entityId, state, last_changed: '', last_updated: '', attributes } },
    callService: async () => undefined,
  };
}

const ALL = COVER_FEATURES.OPEN | COVER_FEATURES.CLOSE | COVER_FEATURES.STOP | COVER_FEATURES.SET_POSITION;

describe('getCoverState', () => {
  it('devuelve null si no es del dominio cover o no existe', () => {
    expect(getCoverState('light.salon', hassWith('light.salon', 'on'))).toBeNull();
    expect(getCoverState('cover.salon', hassWith('cover.otra', 'open'))).toBeNull();
  });

  it('lee estado, posición, inclinación y clase de dispositivo', () => {
    const hass = hassWith('cover.salon', 'open', { current_position: 72, current_tilt_position: 40, device_class: 'blind', supported_features: ALL | COVER_FEATURES.SET_TILT_POSITION });
    expect(getCoverState('cover.salon', hass)).toEqual({
      entity: 'cover.salon',
      state: 'open',
      available: true,
      position: 72,
      tiltPosition: 40,
      deviceClass: 'blind',
      canOpen: true,
      canClose: true,
      canStop: true,
      canSetPosition: true,
      canSetTilt: true,
    });
  });

  it.each(['open', 'closed', 'opening', 'closing'])('reconoce el estado %s', (name) => {
    expect(getCoverState('cover.salon', hassWith('cover.salon', name))?.state).toBe(name);
  });

  it('unavailable, unknown o un valor raro cuentan como no disponible', () => {
    for (const name of ['unavailable', 'unknown', 'raro']) {
      const cover = getCoverState('cover.salon', hassWith('cover.salon', name));
      expect(cover?.state).toBe('unavailable');
      expect(cover?.available).toBe(false);
    }
  });

  it('acota la posición a 0–100 y la redondea; un valor que no es número es null', () => {
    const read = (value: unknown) => getCoverState('cover.salon', hassWith('cover.salon', 'open', { current_position: value }))?.position;
    expect(read(72.6)).toBe(73);
    expect(read(140)).toBe(100);
    expect(read(-5)).toBe(0);
    expect(read('72')).toBeNull();
    expect(read(undefined)).toBeNull();
  });

  it('respeta supported_features: sin parar ni fijar posición', () => {
    const cover = getCoverState('cover.salon', hassWith('cover.salon', 'open', { current_position: 50, supported_features: COVER_FEATURES.OPEN | COVER_FEATURES.CLOSE }));
    expect(cover).toMatchObject({ canOpen: true, canClose: true, canStop: false, canSetPosition: false, canSetTilt: false });
  });

  it('sin supported_features asume abrir/cerrar/parar y fijar solo lo que la entidad informa', () => {
    const plain = getCoverState('cover.salon', hassWith('cover.salon', 'open'));
    expect(plain).toMatchObject({ canOpen: true, canClose: true, canStop: true, canSetPosition: false, canSetTilt: false });
    const withValues = getCoverState('cover.salon', hassWith('cover.salon', 'open', { current_position: 10, current_tilt_position: 20 }));
    expect(withValues).toMatchObject({ canSetPosition: true, canSetTilt: true });
  });

  it('una clase de dispositivo vacía o que no es texto es null', () => {
    expect(getCoverState('cover.salon', hassWith('cover.salon', 'open', { device_class: '' }))?.deviceClass).toBeNull();
    expect(getCoverState('cover.salon', hassWith('cover.salon', 'open', { device_class: 3 }))?.deviceClass).toBeNull();
  });
});
