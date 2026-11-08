import type { HomeAssistant } from '../../ha/types';

/** Datos de una llamada a `light.turn_on`. */
export type LightCommand = Record<string, unknown>;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/** Brillo en porcentaje (1-100): `turn_on` también enciende la luz si estaba apagada. */
export const brightnessCommand = (entity: string, percent: number): LightCommand => ({ entity_id: entity, brightness_pct: clamp(Math.round(percent), 1, 100) });

export const colorTempCommand = (entity: string, kelvin: number): LightCommand => ({ entity_id: entity, color_temp_kelvin: Math.round(kelvin) });

/** Color por tono y saturación: `hs_color` vale para cualquier modo de color, Home Assistant lo convierte. */
export const colorCommand = (entity: string, hue: number, saturation: number): LightCommand => ({
  entity_id: entity,
  hs_color: [clamp(Math.round(hue), 0, 360), clamp(Math.round(saturation), 0, 100)],
});

export const effectCommand = (entity: string, effect: string): LightCommand => ({ entity_id: entity, effect });

export function sendLightCommand(hass: HomeAssistant, command: LightCommand): Promise<void> {
  return hass.callService('light', 'turn_on', command);
}
