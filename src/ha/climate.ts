import type { HassEntityState, HomeAssistant } from './types';

/**
 * Helpers de entidades `climate` (acuerdo: las tarjetas nunca hablan con
 * `hass` directamente, siempre pasan por `src/ha`).
 */

export const HVAC_MODES = ['off', 'heat', 'cool', 'heat_cool', 'auto', 'dry', 'fan_only'] as const;
export type HvacMode = (typeof HVAC_MODES)[number];

/** `hvac_action` — lo que el equipo está haciendo AHORA, distinto del
    modo seleccionado. */
export type HvacAction = 'off' | 'idle' | 'preheating' | 'heating' | 'cooling' | 'drying' | 'fan';

export interface ClimateState {
  entity: string;
  mode: HvacMode;
  hvacModes: HvacMode[];
  hvacAction: HvacAction | null;
  currentTemperature: number | null;
  targetTemperature: number | null;
  minTemp: number;
  maxTemp: number;
  step: number;
  available: boolean;
}

const DEFAULT_MIN_TEMP = 7;
const DEFAULT_MAX_TEMP = 35;
const DEFAULT_STEP = 0.5;

function isHvacMode(value: unknown): value is HvacMode {
  return typeof value === 'string' && (HVAC_MODES as readonly string[]).includes(value);
}

/**
 * Lee estado y capacidades de una entidad `climate`. Devuelve `null` si
 * `entityId` no es del dominio `climate` o no existe en `hass.states`.
 */
export function getClimateState(entityId: string, hass: HomeAssistant): ClimateState | null {
  if (!entityId.startsWith('climate.')) return null;

  const stateObj: HassEntityState | undefined = hass.states[entityId];
  if (!stateObj) return null;

  const available = stateObj.state !== 'unavailable' && stateObj.state !== 'unknown';
  const attrs = stateObj.attributes;

  const rawModes = Array.isArray(attrs.hvac_modes) ? (attrs.hvac_modes as unknown[]) : [];
  // dedupe defensivo: alguna integración de climate puede repetir un modo
  // en hvac_modes; sin esto el selector mostraría la misma opción dos
  // veces.
  const hvacModes = [...new Set(rawModes.filter(isHvacMode))];

  const mode: HvacMode = isHvacMode(stateObj.state) ? stateObj.state : 'off';
  const hvacAction = typeof attrs.hvac_action === 'string' ? (attrs.hvac_action as HvacAction) : null;

  const currentTemperature = typeof attrs.current_temperature === 'number' ? attrs.current_temperature : null;
  const targetTemperature = typeof attrs.temperature === 'number' ? attrs.temperature : null;
  const minTemp = typeof attrs.min_temp === 'number' ? attrs.min_temp : DEFAULT_MIN_TEMP;
  const maxTemp = typeof attrs.max_temp === 'number' ? attrs.max_temp : DEFAULT_MAX_TEMP;
  const step = typeof attrs.target_temp_step === 'number' ? attrs.target_temp_step : DEFAULT_STEP;

  return {
    entity: entityId,
    mode,
    hvacModes,
    hvacAction,
    currentTemperature,
    targetTemperature,
    minTemp,
    maxTemp,
    step,
    available,
  };
}

/** Redondea `value` al múltiplo de `step` más cercano dentro de
    [min, max] — usado por los controles −/+ y por el arrastre. */
export function clampToStep(value: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, value));
  const stepsFromMin = Math.round((clamped - min) / step);
  const snapped = min + stepsFromMin * step;
  return Math.min(max, Math.max(min, Number(snapped.toFixed(2))));
}

/** `true` si el climate está funcionando de verdad ahora mismo (no solo
    "seleccionado en modo X"). Usa `hvac_action` si la entidad lo expone;
    si no, compara consigna vs. actual según el modo. */
export function isClimateRunning(state: ClimateState): boolean {
  if (state.mode === 'off') return false;
  if (state.hvacAction) return state.hvacAction !== 'idle' && state.hvacAction !== 'off';
  if (state.currentTemperature === null || state.targetTemperature === null) return true;
  if (state.mode === 'heat') return state.currentTemperature < state.targetTemperature;
  if (state.mode === 'cool') return state.currentTemperature > state.targetTemperature;
  return state.currentTemperature !== state.targetTemperature;
}
