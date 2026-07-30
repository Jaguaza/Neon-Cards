/**
 * src/core
 *
 * Clases y contratos base que todas las tarjetas de Neón Cards extienden.
 * No contiene nada específico de Home Assistant (eso vive en `src/ha`) ni
 * utilidades genéricas (eso vive en `src/utils`).
 */

export { BaseNeonCard } from './base-card';
export {
  createGestureState,
  handlePointerDown,
  cancelHold,
  handleClick,
  HOLD_DELAY_MS,
  DOUBLE_TAP_DELAY_MS,
} from './gestures';
export type { GestureState, TapHandlers } from './gestures';
export { dispatchHassAction } from './actions';
export { computeInfoDisplay, INFO_OPTIONS, INFO_LABELS } from './info';
export type { InfoOption } from './info';
