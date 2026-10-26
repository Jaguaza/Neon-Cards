import { describe, expect, it } from 'vitest';
import { codeFormat, commandChoices, commandNeedsCode, isAlarmAlert, isAlarmHaloOn, isAlarmMoving, isArmedState, resolveAlarmState, supportedModes } from './alarm-state';
import { ALL_MODES, hassWith } from './neon-alarm-card.fixtures';
import type { HomeAssistant } from '../../ha/types';

const asHass = (state: string) => hassWith(state) as unknown as HomeAssistant;

describe('resolveAlarmState', () => {
  it('sin hass no hay estado (primer render), sin entidad es error', () => {
    expect(resolveAlarmState({ entity: 'alarm_control_panel.casa' }, undefined)).toBeUndefined();
    expect(resolveAlarmState({}, asHass('disarmed'))).toBe('error');
  });

  it('devuelve cada estado del dominio tal cual', () => {
    for (const state of ['disarmed', 'armed_home', 'armed_away', 'armed_night', 'armed_vacation', 'armed_custom_bypass', 'pending', 'arming', 'disarming', 'triggered', 'unavailable']) {
      expect(resolveAlarmState({ entity: 'alarm_control_panel.casa' }, asHass(state))).toBe(state);
    }
  });

  it('unknown, un estado ajeno al dominio o una entidad inexistente son error', () => {
    expect(resolveAlarmState({ entity: 'alarm_control_panel.casa' }, asHass('unknown'))).toBe('error');
    expect(resolveAlarmState({ entity: 'alarm_control_panel.casa' }, asHass('on'))).toBe('error');
    expect(resolveAlarmState({ entity: 'alarm_control_panel.otra' }, asHass('disarmed'))).toBe('error');
  });
});

describe('clasificación de estados', () => {
  it('halo: encendido armada, en transición y disparada; apagado desarmada, caída y error', () => {
    for (const state of ['armed_home', 'armed_away', 'armed_night', 'armed_vacation', 'armed_custom_bypass', 'pending', 'arming', 'disarming', 'triggered'] as const) {
      expect(isAlarmHaloOn(state), state).toBe(true);
    }
    for (const state of ['disarmed', 'unavailable', 'error', undefined] as const) expect(isAlarmHaloOn(state), String(state)).toBe(false);
  });

  it('alerta roja: disparada, no disponible y error', () => {
    expect(['triggered', 'unavailable', 'error', 'disarmed', 'armed_home'].map((s) => isAlarmAlert(s as never))).toEqual([true, true, true, false, false]);
  });

  it('pulso: transiciones y disparada', () => {
    expect(['pending', 'arming', 'disarming', 'triggered'].every((s) => isAlarmMoving(s as never))).toBe(true);
    expect(['disarmed', 'armed_away', 'unavailable'].some((s) => isAlarmMoving(s as never))).toBe(false);
  });

  it('modos armados', () => {
    expect(isArmedState('armed_night')).toBe(true);
    expect(isArmedState('pending')).toBe(false);
    expect(isArmedState(undefined)).toBe(false);
  });
});

describe('modos soportados y código', () => {
  it('supportedModes lee los bits de supported_features y respeta el orden de la tarjeta', () => {
    expect(supportedModes({ supported_features: ALL_MODES })).toEqual(['armed_home', 'armed_away', 'armed_night', 'armed_vacation', 'armed_custom_bypass']);
    expect(supportedModes({ supported_features: 3 })).toEqual(['armed_home', 'armed_away']);
    expect(supportedModes({ supported_features: 8 })).toEqual([]); // 8 es «disparar», no un modo de armado
    expect(supportedModes({})).toEqual([]);
    expect(supportedModes(undefined)).toEqual([]);
  });

  it('codeFormat solo acepta number y text', () => {
    expect(codeFormat({ code_format: 'number' })).toBe('number');
    expect(codeFormat({ code_format: 'text' })).toBe('text');
    expect(codeFormat({ code_format: null })).toBeUndefined();
    expect(codeFormat({})).toBeUndefined();
  });

  it('desarmar pide código si la entidad tiene formato; armar solo si code_arm_required no es false', () => {
    const attrs = { code_format: 'number' };
    expect(commandNeedsCode('disarm', attrs)).toBe(true);
    expect(commandNeedsCode('armed_away', attrs)).toBe(true);
    expect(commandNeedsCode('armed_away', { ...attrs, code_arm_required: false })).toBe(false);
    expect(commandNeedsCode('disarm', { ...attrs, code_arm_required: false })).toBe(true);
    expect(commandNeedsCode('disarm', {})).toBe(false);
  });

  it('commandChoices: desarmada ofrece los modos; armada, en transición o disparada solo desarmar; caída nada', () => {
    const attrs = { supported_features: 3 };
    expect(commandChoices('disarmed', attrs)).toEqual(['armed_home', 'armed_away']);
    for (const state of ['armed_home', 'pending', 'arming', 'disarming', 'triggered'] as const) expect(commandChoices(state, attrs), state).toEqual(['disarm']);
    for (const state of ['unavailable', 'error', undefined] as const) expect(commandChoices(state, attrs), String(state)).toEqual([]);
  });
});
