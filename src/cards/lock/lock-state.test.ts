import { describe, it, expect } from 'vitest';
import { isLockAlert, isLockHaloOn, isLockMoving, isLockOpenPose, isOpeningAction, resolveLockState } from './lock-state';
import { HA_LOCK_STATES } from './constants';
import type { HomeAssistant } from '../../ha/types';

function hassWith(states: Record<string, string>): HomeAssistant {
  const full: HomeAssistant['states'] = {};
  for (const [id, state] of Object.entries(states)) {
    full[id] = { entity_id: id, state, last_changed: '', last_updated: '', attributes: {} };
  }
  return { states: full, callService: async () => undefined };
}

describe('resolveLockState', () => {
  const hass = hassWith({
    'lock.puerta': 'locked',
    'lock.garaje': 'unlocking',
    'lock.caida': 'unavailable',
    'lock.rara': 'unknown',
    'switch.no_es_lock': 'on',
  });

  it('devuelve undefined mientras no haya hass (no es un error)', () => {
    expect(resolveLockState({ entity: 'lock.puerta' }, undefined)).toBeUndefined();
  });

  it('es error sin entity configurada', () => {
    expect(resolveLockState({}, hass)).toBe('error');
    expect(resolveLockState(undefined, hass)).toBe('error');
  });

  it('devuelve el estado oficial del dominio lock', () => {
    expect(resolveLockState({ entity: 'lock.puerta' }, hass)).toBe('locked');
    expect(resolveLockState({ entity: 'lock.garaje' }, hass)).toBe('unlocking');
  });

  it('es error con entidad inexistente, unavailable, unknown o de otro dominio', () => {
    expect(resolveLockState({ entity: 'lock.no_existe' }, hass)).toBe('error');
    expect(resolveLockState({ entity: 'lock.caida' }, hass)).toBe('error');
    expect(resolveLockState({ entity: 'lock.rara' }, hass)).toBe('error');
    expect(resolveLockState({ entity: 'switch.no_es_lock' }, hass)).toBe('error');
  });

  it('reconoce los siete estados oficiales de lock', () => {
    for (const state of HA_LOCK_STATES) {
      const h = hassWith({ 'lock.x': state });
      expect(resolveLockState({ entity: 'lock.x' }, h)).toBe(state);
    }
  });
});

describe('isLockAlert', () => {
  it('solo atascada o en error', () => {
    expect(isLockAlert('jammed')).toBe(true);
    expect(isLockAlert('error')).toBe(true);
    for (const s of ['locked', 'unlocked', 'locking', 'unlocking', 'open', 'opening', undefined] as const) {
      expect(isLockAlert(s)).toBe(false);
    }
  });
});

describe('isLockMoving', () => {
  it('solo en los estados transitorios', () => {
    for (const s of ['locking', 'unlocking', 'opening'] as const) expect(isLockMoving(s)).toBe(true);
    for (const s of ['locked', 'unlocked', 'jammed', 'open', 'error', undefined] as const) expect(isLockMoving(s)).toBe(false);
  });
});

describe('isLockHaloOn', () => {
  it('encendido mientras está abierta o moviéndose, apagado al llegar a locked', () => {
    for (const s of ['unlocking', 'unlocked', 'open', 'opening', 'locking'] as const) expect(isLockHaloOn(s)).toBe(true);
    for (const s of ['locked', 'jammed', 'error', undefined] as const) expect(isLockHaloOn(s)).toBe(false);
  });
});

describe('isLockOpenPose', () => {
  it('abierto en unlocking, unlocked, open y opening', () => {
    for (const s of ['unlocking', 'unlocked', 'open', 'opening'] as const) expect(isLockOpenPose(s)).toBe(true);
  });

  it('cerrado en locked, locking, jammed, error y sin hass', () => {
    for (const s of ['locked', 'locking', 'jammed', 'error', undefined] as const) expect(isLockOpenPose(s)).toBe(false);
  });
});

describe('isOpeningAction', () => {
  it('toggle abre solo si está cerrada', () => {
    expect(isOpeningAction({ action: 'toggle' }, 'locked')).toBe(true);
    for (const s of ['unlocked', 'open', 'locking', 'unlocking', 'opening', 'jammed', 'error', undefined] as const) {
      expect(isOpeningAction({ action: 'toggle' }, s)).toBe(false);
    }
  });

  it('un servicio se decide por su nombre: lock.unlock y lock.open abren, lock.lock no', () => {
    expect(isOpeningAction({ action: 'call-service', service: 'lock.unlock' }, 'unlocked')).toBe(true);
    expect(isOpeningAction({ action: 'perform-action', perform_action: 'lock.open' }, 'locked')).toBe(true);
    expect(isOpeningAction({ action: 'call-service', service: 'lock.lock' }, 'locked')).toBe(false);
  });

  it('otro servicio (un script) se entiende que abre si está cerrada', () => {
    expect(isOpeningAction({ action: 'call-service', service: 'script.portón' }, 'locked')).toBe(true);
    expect(isOpeningAction({ action: 'call-service', service: 'script.portón' }, 'unlocked')).toBe(false);
  });

  it('las acciones que no operan la cerradura nunca abren', () => {
    for (const a of ['more-info', 'navigate', 'url', 'assist', 'none']) expect(isOpeningAction({ action: a }, 'locked')).toBe(false);
  });
});
