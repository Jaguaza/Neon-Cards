import { NEON_CARDS_VERSION } from '../../version';
import type { HvacMode } from '../../ha/climate';
import type { ThermostatSize } from './types';
import type { ThermostatTranslations } from './translations';

export const CARD_AUTHOR = 'Jaguaza';
export const CARD_VERSION = NEON_CARDS_VERSION;

export const DEFAULT_SIZE: ThermostatSize = 'normal';

/** Fallback cuando la entidad no expone `target_temp_step` ni la
    config trae `step:` propio. */
export const DEFAULT_TEMP_STEP = 0.5;

/** Máximo de sensores en el footer de la vista grande/normal — mismo
    tope que Button Card. La vista compacta no lleva footer. */
export const MAX_FOOTER_SENSORS = 3;

/** Icono por modo HVAC. Solo se usan los modos que la entidad soporta
    de verdad (`hvac_modes`) — nunca se muestran los demás. */
export const HVAC_MODE_ICONS: Record<HvacMode, string> = {
  heat: 'mdi:fire',
  cool: 'mdi:snowflake',
  heat_cool: 'mdi:sun-snowflake-variant',
  auto: 'mdi:autorenew',
  dry: 'mdi:water',
  fan_only: 'mdi:fan',
  off: 'mdi:power',
};

/** Iconos de los selectores de preset y ventilador de la vista grande. */
export const PRESET_ICON = 'mdi:tune-variant';
export const FAN_ICON = 'mdi:fan';

/** Color semántico por defecto de cada modo — paleta viva, saturación a
    juego con `src/shared/neon-palette.ts`. heat_cool con hue propio
    (índigo/violeta) para no confundirse con el naranja de heat; dry en
    magenta porque el violeta pasó a heat_cool. */
export const HVAC_MODE_DEFAULT_COLORS: Record<HvacMode, string> = {
  heat: '#ff4500',
  cool: '#0080ff',
  heat_cool: '#5b3df6',
  auto: '#39e07a',
  dry: '#e619b3',
  fan_only: '#ffe135',
  off: '#9aa0a6',
};

/** Ángulos (convención reloj: 0° = arriba, crece en sentido horario) de
    la semicircunferencia del aro/dial — EXACTAMENTE 180° de barrido,
    diámetro horizontal puro. Compartidos por el dial de la vista grande
    y el aro de normal/compacta. */
export const DIAL_START_ANGLE = -90;
export const DIAL_END_ANGLE = 90;

/** Clave de traducción (`translations/*.ts`) para el nombre visible de
    cada modo HVAC, usada tanto en el header como en el selector único. */
export const HVAC_MODE_LABEL_KEYS: Record<HvacMode, keyof ThermostatTranslations> = {
  heat: 'hvac_mode_heat',
  cool: 'hvac_mode_cool',
  heat_cool: 'hvac_mode_heat_cool',
  auto: 'hvac_mode_auto',
  dry: 'hvac_mode_dry',
  fan_only: 'hvac_mode_fan_only',
  off: 'hvac_mode_off',
};
