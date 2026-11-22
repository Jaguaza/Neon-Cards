import type { HassEntityState, HomeAssistant } from './types';

/**
 * Helpers de entidades `cover` (acuerdo: las tarjetas nunca hablan con
 * `hass` directamente, siempre pasan por `src/ha`).
 */

/** Bits de `supported_features` de una entidad `cover`. */
export const COVER_FEATURES = {
  OPEN: 1,
  CLOSE: 2,
  SET_POSITION: 4,
  STOP: 8,
  OPEN_TILT: 16,
  CLOSE_TILT: 32,
  STOP_TILT: 64,
  SET_TILT_POSITION: 128,
} as const;

/** Estado de un cover. `unavailable` agrupa también `unknown` y cualquier
    valor que Home Assistant no defina para este dominio. */
export type CoverStateName = 'open' | 'closed' | 'opening' | 'closing' | 'unavailable';

export interface CoverState {
  entity: string;
  state: CoverStateName;
  available: boolean;
  /** `current_position` (0 = cerrado, 100 = abierto); `null` si la entidad no lo da. */
  position: number | null;
  /** `current_tilt_position` (0–100); `null` si la entidad no lo da. */
  tiltPosition: number | null;
  /** `device_class` (shutter, blind, curtain, awning…); `null` si no tiene. */
  deviceClass: string | null;
  canOpen: boolean;
  canClose: boolean;
  canStop: boolean;
  canSetPosition: boolean;
  canSetTilt: boolean;
}

const STATES: readonly CoverStateName[] = ['open', 'closed', 'opening', 'closing'];

/** Porcentaje 0–100 redondeado; `null` si el atributo no es un número. */
function readPercent(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function readStateName(state: string): CoverStateName {
  return (STATES as readonly string[]).includes(state) ? (state as CoverStateName) : 'unavailable';
}

/**
 * Lee estado y capacidades de una entidad `cover`. Devuelve `null` si
 * `entityId` no es del dominio `cover` o no existe en `hass.states`.
 *
 * Sin `supported_features` numérico se asume lo básico (abrir, cerrar y
 * parar) y que la posición y la inclinación se pueden fijar si la entidad
 * informa de ellas.
 */
export function getCoverState(entityId: string, hass: HomeAssistant): CoverState | null {
  if (!entityId.startsWith('cover.')) return null;

  const stateObj: HassEntityState | undefined = hass.states[entityId];
  if (!stateObj) return null;

  const attrs = stateObj.attributes;
  const state = readStateName(stateObj.state);
  const position = readPercent(attrs.current_position);
  const tiltPosition = readPercent(attrs.current_tilt_position);
  const features = typeof attrs.supported_features === 'number' ? attrs.supported_features : null;
  const has = (bit: number, fallback: boolean) => (features === null ? fallback : (features & bit) !== 0);

  return {
    entity: entityId,
    state,
    available: state !== 'unavailable',
    position,
    tiltPosition,
    deviceClass: typeof attrs.device_class === 'string' && attrs.device_class !== '' ? attrs.device_class : null,
    canOpen: has(COVER_FEATURES.OPEN, true),
    canClose: has(COVER_FEATURES.CLOSE, true),
    canStop: has(COVER_FEATURES.STOP, true),
    canSetPosition: has(COVER_FEATURES.SET_POSITION, position !== null),
    canSetTilt: has(COVER_FEATURES.SET_TILT_POSITION, tiltPosition !== null),
  };
}
