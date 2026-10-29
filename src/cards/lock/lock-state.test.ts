import { describe, it, expect } from 'vitest';
import { displayState, doorSensorOpen, isLockAlert, isLockHaloOn, isLockMoving, isLockOpenPose, isOpeningAction, lockChoices, lockSupportsOpen, resolveLockState, statusColorGroup, statusDotColor } from './lock-state';
import type { LockVisualState } from './types';
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

describe('lockSupportsOpen', () => {
  it('lee el bit de abrir de supported_features', () => {
    expect(lockSupportsOpen({ supported_features: 1 })).toBe(true);
    expect(lockSupportsOpen({ supported_features: 3 })).toBe(true);
    expect(lockSupportsOpen({ supported_features: 0 })).toBe(false);
    expect(lockSupportsOpen({ supported_features: 2 })).toBe(false);
    expect(lockSupportsOpen({})).toBe(false);
    expect(lockSupportsOpen(undefined)).toBe(false);
    expect(lockSupportsOpen({ supported_features: 'x' })).toBe(false);
  });
});

describe('lockChoices', () => {
  const toggle = { action: 'toggle' };
  it('con soporte de abrir: cerrada → desbloquear/abrir; desbloqueada → bloquear/abrir', () => {
    expect(lockChoices(toggle, 'locked', true)).toEqual(['unlock', 'open']);
    expect(lockChoices(toggle, 'unlocked', true)).toEqual(['lock', 'open']);
  });
  it('sin soporte de abrir, en otros estados o con otra acción no hay elección', () => {
    expect(lockChoices(toggle, 'locked', false)).toEqual([]);
    for (const s of ['open', 'locking', 'unlocking', 'opening', 'jammed', 'error', undefined] as const) expect(lockChoices(toggle, s, true)).toEqual([]);
    expect(lockChoices({ action: 'call-service', service: 'lock.unlock' }, 'locked', true)).toEqual([]);
    expect(lockChoices({ action: 'more-info' }, 'locked', true)).toEqual([]);
  });
});

describe('doorSensorOpen', () => {
  const hass = hassWith({ 'binary_sensor.abierta': 'on', 'binary_sensor.cerrada': 'off', 'binary_sensor.caida': 'unavailable', 'binary_sensor.rara': 'unknown' });

  it('true con el sensor activo, false con el inactivo', () => {
    expect(doorSensorOpen({ door_entity: 'binary_sensor.abierta' }, hass)).toBe(true);
    expect(doorSensorOpen({ door_entity: 'binary_sensor.cerrada' }, hass)).toBe(false);
  });

  it('undefined sin sensor configurado, sin hass, inexistente o sin dato válido', () => {
    expect(doorSensorOpen({}, hass)).toBeUndefined();
    expect(doorSensorOpen(undefined, hass)).toBeUndefined();
    expect(doorSensorOpen({ door_entity: 'binary_sensor.abierta' }, undefined)).toBeUndefined();
    expect(doorSensorOpen({ door_entity: 'binary_sensor.no_existe' }, hass)).toBeUndefined();
    expect(doorSensorOpen({ door_entity: 'binary_sensor.caida' }, hass)).toBeUndefined();
    expect(doorSensorOpen({ door_entity: 'binary_sensor.rara' }, hass)).toBeUndefined();
  });
});

describe('displayState', () => {
  const all: LockVisualState[] = ['locked', 'unlocked', 'locking', 'unlocking', 'jammed', 'open', 'opening', 'error'];

  it('sin sensor activo, «Puerta abierta» (open) no sale nunca: el estado open se muestra como opening', () => {
    for (const door of [undefined, false]) {
      for (const state of all) expect(displayState(state, door), `${state} / ${String(door)}`).not.toBe('open');
      expect(displayState('open', door)).toBe('opening');
    }
  });

  it('con el sensor activo sale open si la cerradura está desbloqueada, desbloqueándose o abierta/abriéndose', () => {
    for (const state of ['unlocked', 'unlocking', 'open', 'opening'] as const) expect(displayState(state, true), state).toBe('open');
  });

  it('con el sensor activo el resto de estados no cambia', () => {
    for (const state of ['locked', 'locking', 'jammed', 'error'] as const) expect(displayState(state, true), state).toBe(state);
  });

  it('sin sensor, el resto de estados es el de la entidad', () => {
    for (const state of ['locked', 'unlocked', 'locking', 'unlocking', 'jammed', 'opening', 'error'] as const) {
      expect(displayState(state, undefined), state).toBe(state);
    }
  });

  it('sin estado (sin hass) devuelve undefined', () => {
    expect(displayState(undefined, true)).toBeUndefined();
    expect(displayState(undefined, undefined, true)).toBeUndefined();
  });

  it('con «Abrir» pendiente y la entidad sin cambiar (cerrada o desbloqueada) muestra opening', () => {
    expect(displayState('locked', undefined, true)).toBe('opening');
    expect(displayState('unlocked', undefined, true)).toBe('opening');
    expect(displayState('locked', false, true)).toBe('opening');
  });

  it('el pendiente no pisa avería, error ni el sensor activo', () => {
    expect(displayState('jammed', undefined, true)).toBe('jammed');
    expect(displayState('error', undefined, true)).toBe('error');
    expect(displayState('unlocked', true, true)).toBe('open');
  });
});

describe('statusColorGroup', () => {
  it('agrupa los estados en cerrada, desbloqueada/abierta y avería', () => {
    expect(['locked', 'locking'].map((s) => statusColorGroup(s as never))).toEqual(['closed', 'closed']);
    expect(['unlocked', 'unlocking', 'open', 'opening'].map((s) => statusColorGroup(s as never))).toEqual(['open', 'open', 'open', 'open']);
    expect(['jammed', 'error'].map((s) => statusColorGroup(s as never))).toEqual(['alert', 'alert']);
  });
});

describe('statusDotColor', () => {
  const cfg = { status_color_closed: '#111111', status_color_open: ' #222222 ', status_color_alert: 'rgb(3, 3, 3)' };
  it('devuelve el color del grupo del estado', () => {
    expect(statusDotColor(cfg, 'locked')).toBe('#111111');
    expect(statusDotColor(cfg, 'locking')).toBe('#111111');
    expect(statusDotColor(cfg, 'unlocked')).toBe('#222222'); // recortado
    expect(statusDotColor(cfg, 'open')).toBe('#222222');
    expect(statusDotColor(cfg, 'jammed')).toBe('rgb(3, 3, 3)');
    expect(statusDotColor(cfg, 'error')).toBe('rgb(3, 3, 3)');
  });
  it('sin color en la config, o inválido, no devuelve nada (vale el de la hoja de estilos)', () => {
    expect(statusDotColor({}, 'locked')).toBeUndefined();
    expect(statusDotColor(undefined, 'locked')).toBeUndefined();
    expect(statusDotColor({ status_color_closed: 'red; x:y' }, 'locked')).toBeUndefined();
    expect(statusDotColor({ status_color_closed: '#111111' }, 'unlocked')).toBeUndefined(); // otro grupo
  });
});
