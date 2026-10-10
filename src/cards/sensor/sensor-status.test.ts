import { describe, expect, it } from 'vitest';
import { computeSensorStatus } from './sensor-status';
import type { NeonSensorCardConfig } from './types';

const sensor = (state: string, available = true) => ({ domain: 'sensor', state, available });
const binary = (state: string, available = true) => ({ domain: 'binary_sensor', state, available });
const temp: NeonSensorCardConfig = { thresholds_enabled: true, threshold_low: 22, threshold_high: 26 };

describe('computeSensorStatus', () => {
  it('sin datos: unavailable, estén o no activados los umbrales', () => {
    expect(computeSensorStatus(sensor('unavailable', false), temp).level).toBe('unavailable');
    expect(computeSensorStatus(sensor('20', false), {}).level).toBe('unavailable');
  });

  it('umbrales desactivados: siempre normal', () => {
    const off: NeonSensorCardConfig = { thresholds_enabled: false, threshold_low: 22, threshold_high: 26 };
    expect(computeSensorStatus(sensor('10'), off).level).toBe('normal');
    expect(computeSensorStatus(sensor('40'), off).level).toBe('normal');
    expect(computeSensorStatus(sensor('10'), {}).level).toBe('normal');
  });

  it('por debajo del mínimo es bajo', () => {
    expect(computeSensorStatus(sensor('21.9'), temp).level).toBe('low');
  });

  it('por encima del máximo es alto', () => {
    expect(computeSensorStatus(sensor('26.1'), temp).level).toBe('high');
  });

  it('entre los dos umbrales (límites incluidos) es correcto', () => {
    expect(computeSensorStatus(sensor('22'), temp).level).toBe('ok');
    expect(computeSensorStatus(sensor('24'), temp).level).toBe('ok');
    expect(computeSensorStatus(sensor('26'), temp).level).toBe('ok');
  });

  it('con un solo límite definido, el otro lado no se evalúa', () => {
    expect(computeSensorStatus(sensor('-50'), { thresholds_enabled: true, threshold_high: 26 }).level).toBe('ok');
    expect(computeSensorStatus(sensor('99'), { thresholds_enabled: true, threshold_low: 22 }).level).toBe('ok');
    expect(computeSensorStatus(sensor('30'), { thresholds_enabled: true, threshold_high: 26 }).level).toBe('high');
  });

  it('activados pero sin ningún límite: correcto', () => {
    expect(computeSensorStatus(sensor('5'), { thresholds_enabled: true }).level).toBe('ok');
  });

  it('un estado no numérico se queda en normal', () => {
    expect(computeSensorStatus(sensor('hola'), temp).level).toBe('normal');
    expect(computeSensorStatus(sensor(''), temp).level).toBe('normal');
  });

  it('binary_sensor: alto si coincide con alert_state, correcto si no', () => {
    const cfg: NeonSensorCardConfig = { thresholds_enabled: true, alert_state: 'on' };
    expect(computeSensorStatus(binary('on'), cfg).level).toBe('high');
    expect(computeSensorStatus(binary('off'), cfg).level).toBe('ok');
    expect(computeSensorStatus(binary('on'), { thresholds_enabled: true }).level).toBe('ok');
    expect(computeSensorStatus(binary('on'), { alert_state: 'on' }).level).toBe('normal');
  });
});
