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

/** Opciones del pie: entidades que no se cuentan y si solo se enseña lo activo. */
export interface FooterOptions {
  excluded?: readonly string[];
  onlyActive?: boolean;
}

/** Entidades excluidas válidas: solo textos, sin repetidos ni vacíos. */
export function normalizeExcluded(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && item.trim() !== '').map((item) => item.trim()))];
}

function byActiveThenName(a: SensorEntry, b: SensorEntry): number {
  return Number(b.active) - Number(a.active) || a.name.localeCompare(b.name);
}

/**
 * Los sensores de HA de este tipo con un estado válido, sin los excluidos,
 * los activos primero y luego por nombre.
 */
export function sensorsOfType(hass: HomeAssistant | undefined, type: string, excluded: readonly string[] = []): SensorEntry[] {
  if (!hass) return [];
  return Object.values(hass.states)
    .filter((stateObj) => matchesType(stateObj, type) && !INVALID_STATES.includes(stateObj.state) && !excluded.includes(stateObj.entity_id))
    .map((stateObj) => entryOf(stateObj, type))
    .sort(byActiveThenName);
}

/**
 * Todos los sensores de HA de este tipo, también los caídos o desconocidos,
 * por nombre: es lo que lista el editor para marcar los que se ocultan.
 */
export function allSensorsOfType(hass: HomeAssistant | undefined, type: string): SensorEntry[] {
  if (!hass) return [];
  return Object.values(hass.states)
    .filter((stateObj) => matchesType(stateObj, type))
    .map((stateObj) => entryOf(stateObj, type))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Un dato del pie. `total` y `activeCount` cuentan todos los sensores del tipo
 * (menos los excluidos); con `onlyActive` la lista `entries` lleva solo los activos.
 */
export function footerSensorView(hass: HomeAssistant | undefined, type: string, options: FooterOptions = {}): FooterSensorView {
  const all = sensorsOfType(hass, type, options.excluded);
  const activeCount = all.filter((entry) => entry.active).length;
  const icons = SENSOR_ICONS[type] ?? DEFAULT_SENSOR_ICONS;
  const entries = options.onlyActive ? all.filter((entry) => entry.active) : all;
  return { type, icon: activeCount > 0 ? icons[0] : icons[1], total: all.length, activeCount, entries };
}

/** Los datos del pie en el orden configurado; con `onlyActive` desaparecen los tipos sin ningún sensor activo. */
export function visibleFooterViews(hass: HomeAssistant | undefined, types: readonly string[], options: FooterOptions = {}): FooterSensorView[] {
  const views = types.map((type) => footerSensorView(hass, type, options));
  return options.onlyActive ? views.filter((view) => view.activeCount > 0) : views;
}
