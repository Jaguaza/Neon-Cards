/**
 * Gestos tap / hold / double-tap compartidos por todas las tarjetas
 * (acuerdo nº4: reutilizable se mueve al framework, nunca se copia).
 *
 * El estado de cada gesto se guarda fuera de `render()` a propósito: en
 * Lit, `render()` se vuelve a ejecutar en cada actualización reactiva, así
 * que unas variables declaradas dentro de una función de renderizado no
 * sobrevivirían entre pulsaciones. `createGestureState()` crea un objeto
 * que la tarjeta guarda ella misma (una instancia por entidad) y pasa a
 * estas funciones en cada evento.
 */

export const HOLD_DELAY_MS = 500;
export const DOUBLE_TAP_DELAY_MS = 280;

export interface GestureState {
  holdTimer?: ReturnType<typeof setTimeout>;
  isHoldActive: boolean;
  lastTapTime: number;
  tapTimeout?: ReturnType<typeof setTimeout>;
}

export function createGestureState(): GestureState {
  return { isHoldActive: false, lastTapTime: 0 };
}

/**
 * @param ignoreSelector Elementos dentro de los que un tap no debe iniciar
 *   un gesto (p. ej. el propio interruptor: `.switch`).
 */
export function handlePointerDown(
  state: GestureState,
  ev: PointerEvent,
  ignoreSelector: string,
  onHold: () => void
): void {
  if ((ev.target as HTMLElement).closest(ignoreSelector)) return;
  state.isHoldActive = false;
  state.holdTimer = setTimeout(() => {
    state.isHoldActive = true;
    onHold();
  }, HOLD_DELAY_MS);
}

export function cancelHold(state: GestureState): void {
  clearTimeout(state.holdTimer);
}

export interface TapHandlers {
  onTap: () => void;
  onDoubleTap: () => void;
  hasDoubleTap: boolean;
}

export function handleClick(
  state: GestureState,
  ev: MouseEvent,
  ignoreSelector: string,
  handlers: TapHandlers
): void {
  if ((ev.target as HTMLElement).closest(ignoreSelector)) return;

  if (state.isHoldActive) {
    state.isHoldActive = false;
    return;
  }

  const now = Date.now();
  if (now - state.lastTapTime < DOUBLE_TAP_DELAY_MS) {
    clearTimeout(state.tapTimeout);
    state.lastTapTime = 0;
    handlers.onDoubleTap();
  } else {
    state.lastTapTime = now;
    if (handlers.hasDoubleTap) {
      state.tapTimeout = setTimeout(() => handlers.onTap(), DOUBLE_TAP_DELAY_MS);
    } else {
      handlers.onTap();
    }
  }
}
