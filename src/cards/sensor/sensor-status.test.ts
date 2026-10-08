import { describe, it, expect } from 'vitest';
import { computeSensorStatus } from './sensor-status';
import { resolveCardColors } from './sensor-colors';
import { DEFAULT_STATE_COLORS } from './constants';

const s = (state: string, domain = 'sensor', available = true) => ({ domain, state, available });

describe('computeSensorStatus', () => {
  it('no disponible → unavailable', () => {
    expect(computeSensorStatus(s('unavailable', 'sensor', false), {}).level).toBe('unavailable');
  });
  it('sin umbrales → normal', () => {
    expect(computeSensorStatus(s('99'), {})).toEqual({ level: 'normal', direction: null });
  });
  it('aviso y crítico por arriba; crítico gana', () => {
    const c = { warning_above: 25, critical_above: 30 };
    expect(computeSensorStatus(s('24.9'), c).level).toBe('normal');
    expect(computeSensorStatus(s('25'), c)).toEqual({ level: 'warning', direction: 'high' });
    expect(computeSensorStatus(s('31'), c)).toEqual({ level: 'critical', direction: 'high' });
  });
  it('umbrales por debajo', () => {
    const c = { warning_below: 20, critical_below: 10 };
    expect(computeSensorStatus(s('15'), c)).toEqual({ level: 'warning', direction: 'low' });
    expect(computeSensorStatus(s('5'), c)).toEqual({ level: 'critical', direction: 'low' });
  });
  it('estado no numérico → normal', () => {
    expect(computeSensorStatus(s('cloudy'), { critical_above: 1 }).level).toBe('normal');
  });
  it('binary_sensor: crítico solo si coincide con alert_state', () => {
    expect(computeSensorStatus(s('on', 'binary_sensor'), {}).level).toBe('normal');
    expect(computeSensorStatus(s('on', 'binary_sensor'), { alert_state: 'on' }).level).toBe('critical');
    expect(computeSensorStatus(s('off', 'binary_sensor'), { alert_state: 'on' }).level).toBe('normal');
  });
});

describe('resolveCardColors', () => {
  it('single: usa la paleta; unavailable siempre neutro', () => {
    expect(resolveCardColors({ neon_palette: 'electric' }, 'critical').c1).toBe('#00f2fe');
    expect(resolveCardColors({}, 'unavailable').c1).toBe(DEFAULT_STATE_COLORS.unavailable);
  });
  it('state: color automático por nivel', () => {
    expect(resolveCardColors({ color_mode: 'state' }, 'warning').c1).toBe(DEFAULT_STATE_COLORS.warning);
  });
  it('custom_state: respeta el color del usuario y cae al por defecto', () => {
    const cfg = { color_mode: 'custom_state' as const, state_colors: { critical: '#ff0000' } };
    expect(resolveCardColors(cfg, 'critical')).toEqual({ c1: '#ff0000', c2: '#ff0000', c3: '#ff0000' });
    expect(resolveCardColors(cfg, 'normal').c1).toBe(DEFAULT_STATE_COLORS.normal);
  });
});
