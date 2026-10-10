import type { NeonSensorCardConfig, SensorLevel } from './types';

export interface SensorStatus {
  level: SensorLevel;
}

export interface StatusInput {
  domain: string;
  state: string;
  available: boolean;
}

/**
 * Nivel de la lectura.
 * - Sin datos: `unavailable`. Umbrales desactivados: `normal`.
 * - `sensor` numérico: por debajo de `threshold_low` = `low`, por encima
 *   de `threshold_high` = `high`, entre ambos (los límites incluidos) =
 *   `ok`. Un límite sin definir no se evalúa. Un estado no numérico
 *   (texto) se queda en `normal`.
 * - `binary_sensor`: `high` si su estado coincide con `alert_state`;
 *   si no, `ok`.
 */
export function computeSensorStatus(input: StatusInput, config: NeonSensorCardConfig): SensorStatus {
  if (!input.available) return { level: 'unavailable' };
  if (!config.thresholds_enabled) return { level: 'normal' };
  if (input.domain === 'binary_sensor') {
    return { level: config.alert_state && input.state === config.alert_state ? 'high' : 'ok' };
  }
  const value = Number(input.state);
  if (input.state === '' || !Number.isFinite(value)) return { level: 'normal' };
  const { threshold_low: low, threshold_high: high } = config;
  if (low !== undefined && value < low) return { level: 'low' };
  if (high !== undefined && value > high) return { level: 'high' };
  return { level: 'ok' };
}
