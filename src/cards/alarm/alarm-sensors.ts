import type { HassEntityState, HomeAssistant } from '../../ha/types';
import { DEFAULT_SENSOR_ICONS, FOOTER_MAX, LOCK_SENSOR_TYPE, SENSOR_ICONS } from './constants';
import type { AlarmSize } from './types';

/** Un sensor del pie ya clasificado: su entidad y si está «abierto» (activo). */
export interface SensorEntry {
  entityId: string;
  name: string;
  active: boolean;
}

/** Lo que pinta un dato del pie: icono, recuento y sensores. */
export interface FooterSensorView {
  type: string;
  icon: string;
  total: number;
  activeCount: number;
  entries: SensorEntry[];
}

const INVALID_STATES = ['unknown', 'unavailable', ''];

/** Tipos válidos del pie: sin repetidos ni vacíos y, como mucho, los que caben en el tamaño. */
export function normalizeFooterTypes(value: unknown, size: AlarmSize): string[] {
  if (!Array.isArray(value)) return [];
  const clean = value.filter((item): item is string => typeof item === 'string' && item.trim() !== '').map((item) => item.trim());
  return [...new Set(clean)].slice(0, FOOTER_MAX[size]);
}

/** ¿Pertenece la entidad a este tipo (cerradura o `binary_sensor` con esa `device_class`)? */
function matchesType(stateObj: HassEntityState, type: string): boolean {
  if (type === LOCK_SENSOR_TYPE) return stateObj.entity_id.startsWith('lock.');
  return stateObj.entity_id.startsWith('binary_sensor.') && stateObj.attributes.device_class === type;
}

/** Una cerradura cuenta como «abierta» si no está cerrada con llave; un sensor, si está `on`. */
function isActive(stateObj: HassEntityState, type: string): boolean {
  return type === LOCK_SENSOR_TYPE ? stateObj.state !== 'locked' : stateObj.state === 'on';
}

function entryOf(stateObj: HassEntityState, type: string): SensorEntry {
  const name = (stateObj.attributes.friendly_name as string | undefined) || stateObj.entity_id;
  return { entityId: stateObj.entity_id, name, active: isActive(stateObj, type) };
}

/** Todos los sensores de HA de este tipo con un estado válido, los activos primero y luego por nombre. */
export function sensorsOfType(hass: HomeAssistant | undefined, type: string): SensorEntry[] {
  if (!hass) return [];
  return Object.values(hass.states)
    .filter((stateObj) => matchesType(stateObj, type) && !INVALID_STATES.includes(stateObj.state))
    .map((stateObj) => entryOf(stateObj, type))
    .sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name));
}

export function footerSensorView(hass: HomeAssistant | undefined, type: string): FooterSensorView {
  const entries = sensorsOfType(hass, type);
  const activeCount = entries.filter((entry) => entry.active).length;
  const icons = SENSOR_ICONS[type] ?? DEFAULT_SENSOR_ICONS;
  return { type, icon: activeCount > 0 ? icons[0] : icons[1], total: entries.length, activeCount, entries };
}
