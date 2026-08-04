import type { HassEntityState, HomeAssistant } from './types';

/**
 * Helpers de entidades `sensor`/`binary_sensor` (acuerdo: las tarjetas
 * nunca hablan con `hass` directamente, siempre pasan por `src/ha`). Hoy
 * los usa la Button Card, pero cualquier tarjeta futura que muestre
 * sensores contextuales debería reutilizarlos en vez de releer
 * `hass.states` a mano.
 */

export const SENSOR_DOMAINS = ['sensor', 'binary_sensor'] as const;
export type SensorDomain = (typeof SENSOR_DOMAINS)[number];

export interface SensorDisplay {
  entity: string;
  icon: string;
  state: string;
  unit: string;
  available: boolean;
}

/** Decimales por defecto cuando el sensor no especifica los suyos. */
export const DEFAULT_SENSOR_DECIMALS = 1;

const DEFAULT_ICONS: Record<string, string> = {
  temperature: 'mdi:thermometer',
  humidity: 'mdi:water-percent',
  power: 'mdi:flash',
  energy: 'mdi:lightning-bolt',
  battery: 'mdi:battery',
  signal_strength: 'mdi:wifi',
  door: 'mdi:door',
  window: 'mdi:window-closed',
  moisture: 'mdi:water-alert',
  motion: 'mdi:motion-sensor',
};

function domainOf(entityId: string): string {
  return entityId.split('.')[0];
}

/**
 * Redondea un estado numérico a N decimales; deja intacto cualquier
 * estado no numérico (p. ej. "Cerrada", "on"/"off" de un binary_sensor).
 */
export function formatSensorState(state: string, decimals: number = DEFAULT_SENSOR_DECIMALS): string {
  const num = Number(state);
  if (Number.isNaN(num) || state.trim() === '') return state;
  return num.toFixed(Math.max(0, decimals));
}

/**
 * Icono/estado/unidad de una entidad `sensor`/`binary_sensor`. El icono y
 * los decimales por defecto se calculan automáticamente, pero ambos
 * pueden sobreescribirse por sensor (`iconOverride`/`decimals`).
 */
export function getSensorDisplay(
  entityId: string,
  hass: HomeAssistant,
  options?: { icon?: string; decimals?: number }
): SensorDisplay | null {
  const domain = domainOf(entityId);
  if (!SENSOR_DOMAINS.includes(domain as SensorDomain)) return null;

  const stateObj: HassEntityState | undefined = hass.states[entityId];
  const available = !!stateObj && stateObj.state !== 'unavailable' && stateObj.state !== 'unknown';
  const deviceClass = (stateObj?.attributes.device_class as string | undefined) || '';
  const icon =
    options?.icon ||
    (stateObj?.attributes.icon as string | undefined) ||
    DEFAULT_ICONS[deviceClass] ||
    (domain === 'binary_sensor' ? 'mdi:checkbox-blank-circle-outline' : 'mdi:eye');
  const unit = (stateObj?.attributes.unit_of_measurement as string | undefined) || '';
  const rawState = stateObj ? stateObj.state : 'unavailable';
  const state = available ? formatSensorState(rawState, options?.decimals) : rawState;

  return { entity: entityId, icon, state, unit, available };
}
