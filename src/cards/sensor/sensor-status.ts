import type { NeonSensorCardConfig, SensorLevel } from './types';

export type SensorDirection = 'high' | 'low' | null;

export interface SensorStatus {
  level: SensorLevel;
  /** Hacia dónde se ha pasado el umbral; `null` si no aplica. */
  direction: SensorDirection;
}

export interface StatusInput {
  domain: string;
  state: string;
  available: boolean;
}

const NORMAL: SensorStatus = { level: 'normal', direction: null };

function numericStatus(value: number, c: NeonSensorCardConfig): SensorStatus {
  if (c.critical_above !== undefined && value >= c.critical_above) return { level: 'critical', direction: 'high' };
  if (c.critical_below !== undefined && value <= c.critical_below) return { level: 'critical', direction: 'low' };
  if (c.warning_above !== undefined && value >= c.warning_above) return { level: 'warning', direction: 'high' };
  if (c.warning_below !== undefined && value <= c.warning_below) return { level: 'warning', direction: 'low' };
  return NORMAL;
}

/**
 * Severidad de la lectura. `binary_sensor`: crítico solo si su estado
 * coincide con `alert_state`. `sensor`: umbrales numéricos; crítico gana
 * sobre aviso. Un estado no numérico (texto) se queda en normal.
 */
export function computeSensorStatus(input: StatusInput, config: NeonSensorCardConfig): SensorStatus {
  if (!input.available) return { level: 'unavailable', direction: null };
  if (input.domain === 'binary_sensor') {
    return config.alert_state && input.state === config.alert_state ? { level: 'critical', direction: null } : NORMAL;
  }
  const value = Number(input.state);
  if (input.state === '' || !Number.isFinite(value)) return NORMAL;
  return numericStatus(value, config);
}
