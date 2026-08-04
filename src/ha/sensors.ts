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
 * Icono/estado/unidad automáticos de una entidad `sensor`/`binary_sensor`
 * (punto 9 de la spec: "no es configurable, esto garantiza una apariencia
 * uniforme"). Nunca lee dominios fuera de `SENSOR_DOMAINS`.
 */
export function getSensorDisplay(entityId: string, hass: HomeAssistant): SensorDisplay | null {
  const domain = domainOf(entityId);
  if (!SENSOR_DOMAINS.includes(domain as SensorDomain)) return null;

  const stateObj: HassEntityState | undefined = hass.states[entityId];
  const available = !!stateObj && stateObj.state !== 'unavailable' && stateObj.state !== 'unknown';
  const deviceClass = (stateObj?.attributes.device_class as string | undefined) || '';
  const icon =
    (stateObj?.attributes.icon as string | undefined) ||
    DEFAULT_ICONS[deviceClass] ||
    (domain === 'binary_sensor' ? 'mdi:checkbox-blank-circle-outline' : 'mdi:eye');
  const unit = (stateObj?.attributes.unit_of_measurement as string | undefined) || '';
  const state = stateObj ? stateObj.state : 'unavailable';

  return { entity: entityId, icon, state, unit, available };
}

/**
 * Distribución automática de la fila de sensores (punto 9: "el usuario
 * nunca indicará posiciones"). Devuelve el número de columnas de la
 * cuadrícula según cuántos sensores haya — 1 y 2 en una fila, 3 en una
 * fila, 4+ en dos filas de 2 columnas.
 */
export function sensorGridColumns(count: number): number {
  if (count <= 1) return 1;
  if (count === 3) return 3;
  return 2;
}
