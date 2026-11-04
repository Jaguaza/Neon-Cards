import { describe, expect, it } from 'vitest';
import { INFO_ACTION_DEFAULTS, TOGGLE_ACTION_DEFAULTS, actionConfigFor, gestureActionFor, resolveActionConfigs } from './actions';

const CUSTOM = { tap_action: { action: 'navigate', navigation_path: '/casa' }, hold_action: { action: 'none' } };

describe('actionConfigFor', () => {
  it('devuelve la acción configurada tal cual', () => {
    expect(actionConfigFor(CUSTOM, 'tap_action', 'toggle')).toBe(CUSTOM.tap_action);
  });

  it('sin acción configurada (o sin configuración) usa la acción por defecto', () => {
    expect(actionConfigFor(CUSTOM, 'double_tap_action', 'none')).toEqual({ action: 'none' });
    expect(actionConfigFor(undefined, 'tap_action', 'more-info')).toEqual({ action: 'more-info' });
  });
});

describe('gestureActionFor', () => {
  it('traduce el gesto a su clave y aplica los valores por defecto de la tarjeta', () => {
    expect(gestureActionFor(undefined, 'tap', TOGGLE_ACTION_DEFAULTS)).toEqual({ action: 'toggle' });
    expect(gestureActionFor(undefined, 'hold', TOGGLE_ACTION_DEFAULTS)).toEqual({ action: 'more-info' });
    expect(gestureActionFor(undefined, 'double_tap', TOGGLE_ACTION_DEFAULTS)).toEqual({ action: 'none' });
    expect(gestureActionFor(undefined, 'tap', INFO_ACTION_DEFAULTS)).toEqual({ action: 'more-info' });
  });

  it('respeta lo configurado y trata cualquier gesto desconocido como pulsar', () => {
    expect(gestureActionFor(CUSTOM, 'hold', TOGGLE_ACTION_DEFAULTS)).toBe(CUSTOM.hold_action);
    expect(gestureActionFor(CUSTOM, 'otro', TOGGLE_ACTION_DEFAULTS)).toBe(CUSTOM.tap_action);
  });
});

describe('resolveActionConfigs', () => {
  it('devuelve las tres acciones, con lo configurado y con los valores por defecto del resto', () => {
    expect(resolveActionConfigs(CUSTOM, TOGGLE_ACTION_DEFAULTS)).toEqual({
      tap_action: CUSTOM.tap_action,
      hold_action: CUSTOM.hold_action,
      double_tap_action: { action: 'none' },
    });
    expect(resolveActionConfigs(undefined, INFO_ACTION_DEFAULTS)).toEqual({
      tap_action: { action: 'more-info' },
      hold_action: { action: 'none' },
      double_tap_action: { action: 'none' },
    });
  });
});
