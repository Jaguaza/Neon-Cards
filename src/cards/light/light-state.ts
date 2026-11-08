import type { HassEntityState, HomeAssistant } from '../../ha/types';
import { COLOR_MODES, CONTROL_ORDER, DEFAULT_KELVIN, DEFAULT_SATURATION, MIN_FILL_PERCENT } from './constants';
import type { FooterControl, GroupCount, NeonLightCardConfig } from './types';

type Attributes = HassEntityState['attributes'] | undefined;

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export function lightStateObj(config: NeonLightCardConfig | undefined, hass: HomeAssistant | undefined): HassEntityState | undefined {
  return config?.entity ? hass?.states[config.entity] : undefined;
}

/**
 * La luz no se puede mostrar: no hay `entity:`, no existe en `hass.states` o
 * su estado es `unavailable`/`unknown`. Sin `hass` todavía no se sabe: no es un error.
 */
export function isLightBroken(config: NeonLightCardConfig | undefined, hass: HomeAssistant | undefined): boolean {
  if (!config?.entity) return true;
  if (!hass) return false;
  const stateObj = hass.states[config.entity];
  return !stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown';
}

export function isLightOn(config: NeonLightCardConfig | undefined, hass: HomeAssistant | undefined): boolean {
  return lightStateObj(config, hass)?.state === 'on';
}

/** `supported_color_modes` de la entidad (vacío si no los declara). */
export function supportedModes(attributes: Attributes): string[] {
  const modes = attributes?.supported_color_modes;
  return Array.isArray(modes) ? modes.filter((mode): mode is string => typeof mode === 'string') : [];
}

/** Cualquier modo que no sea solo encender/apagar admite brillo. */
export const supportsBrightness = (attributes: Attributes): boolean => supportedModes(attributes).some((mode) => mode !== 'onoff');

export const supportsColorTemp = (attributes: Attributes): boolean => supportedModes(attributes).includes('color_temp');

export const supportsColor = (attributes: Attributes): boolean => supportedModes(attributes).some((mode) => COLOR_MODES.includes(mode));

/** Controles que ofrece la luz, en el orden del pie. */
export function availableControls(attributes: Attributes): FooterControl[] {
  const supported: Record<FooterControl, boolean> = {
    brightness: supportsBrightness(attributes),
    color_temp: supportsColorTemp(attributes),
    color: supportsColor(attributes),
  };
  return CONTROL_ORDER.filter((control) => supported[control]);
}

/** Efectos que declara la luz. */
export function effectList(attributes: Attributes): string[] {
  const list = attributes?.effect_list;
  return Array.isArray(list) ? list.filter((effect): effect is string => typeof effect === 'string') : [];
}

/** Efecto activo, solo si está en la lista. */
export function currentEffect(attributes: Attributes): string | undefined {
  const effect = attributes?.effect;
  return typeof effect === 'string' && effectList(attributes).includes(effect) ? effect : undefined;
}

const clampPercent = (value: number): number => Math.min(100, Math.max(1, value));

/** Brillo (1-100) de la luz, o `undefined` si no lo informa. */
export function brightnessPercent(attributes: Attributes): number | undefined {
  const raw = attributes?.brightness;
  return isNumber(raw) ? clampPercent(Math.round((raw / 255) * 100)) : undefined;
}

/**
 * Altura (0-100 %) hasta la que se ilumina el icono. Mientras se arrastra el
 * brillo manda la vista previa; si no, apagada vale 0, encendida con brillo
 * su porcentaje y encendida sin brillo (solo on/off) el icono entero.
 */
export function fillPercent(stateObj: HassEntityState | undefined, preview?: number): number {
  if (preview !== undefined) return Math.max(MIN_FILL_PERCENT, clampPercent(preview));
  if (stateObj?.state !== 'on') return 0;
  return Math.max(MIN_FILL_PERCENT, brightnessPercent(stateObj.attributes) ?? 100);
}

export interface KelvinRange {
  min: number;
  max: number;
}

/** Rango de temperatura de color (K) de la luz, o el predeterminado si no lo declara bien. */
export function kelvinRange(attributes: Attributes): KelvinRange {
  const min = attributes?.min_color_temp_kelvin;
  const max = attributes?.max_color_temp_kelvin;
  return isNumber(min) && isNumber(max) && min < max ? { min, max } : { ...DEFAULT_KELVIN };
}

/** Temperatura actual dentro del rango; sin ella (la luz está en otro modo) el punto medio. */
export function currentKelvin(attributes: Attributes): number {
  const range = kelvinRange(attributes);
  const raw = attributes?.color_temp_kelvin;
  if (!isNumber(raw)) return Math.round((range.min + range.max) / 2);
  return Math.min(range.max, Math.max(range.min, Math.round(raw)));
}

function hsColor(attributes: Attributes): [number, number] | undefined {
  const hs = attributes?.hs_color;
  return Array.isArray(hs) && isNumber(hs[0]) && isNumber(hs[1]) ? [hs[0], hs[1]] : undefined;
}

/** Tono (0-360) de la luz, 0 si no tiene color. */
export const currentHue = (attributes: Attributes): number => Math.round(hsColor(attributes)?.[0] ?? 0) % 360;

/** Saturación (0-100) de la luz; sin color, la predeterminada. */
export const currentSaturation = (attributes: Attributes): number => Math.round(hsColor(attributes)?.[1] ?? DEFAULT_SATURATION);

/** Si la entidad es un grupo de luces (trae `entity_id` con sus miembros), cuántas están encendidas. */
export function groupCount(stateObj: HassEntityState | undefined, hass: HomeAssistant | undefined): GroupCount | undefined {
  const members = stateObj?.attributes.entity_id;
  if (!Array.isArray(members) || members.length === 0 || !hass) return undefined;
  const ids = members.filter((id): id is string => typeof id === 'string');
  return { on: ids.filter((id) => hass.states[id]?.state === 'on').length, total: ids.length };
}
