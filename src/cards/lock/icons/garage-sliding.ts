import { html } from 'lit';
import type { LockIconDef } from './types';
import { easeInOut, round } from './easing';

/**
 * Icono «garaje con puerta corredera», con la silueta de
 * `mdi:garage-variant`: el mismo marco macizo y las mismas tres lamas, que
 * aquí forman UN panel con un montante en su canto delantero (izquierdo).
 * Al abrir, el panel se DESLIZA hacia la derecha y se esconde tras la
 * jamba: lo que pasa de x=19 se recorta (aritmético, nada se dibuja fuera
 * del hueco). Abierto queda una franja de 3 unidades con el montante.
 *
 * Marco: x de 2 a 22, tejado hasta y=5, dintel en y=11, suelo en y=20.
 * Panel: x de 5 a 19, lamas a y=12, 15 y 18.
 */
export const GARAGE_SLIDING_DURATION_MS = 1000;

const X0 = 5;
const X1 = 19;
const TRAVEL = 11;
const SLAT_YS = [12, 15, 18];
const SLAT_H = 2;
const STILE_W = 1;
const STILE_Y = 12;
const STILE_H = 8;

export interface SlidingGeometry {
  left: number;
  right: number;
  stileRight: number;
}

export function slidingGeometry(s: number): SlidingGeometry {
  const left = X0 + TRAVEL * easeInOut(s);
  return { left: round(left), right: X1, stileRight: round(Math.min(left + STILE_W, X1)) };
}

export function panelPath(g: SlidingGeometry): string {
  const rect = (x0: number, x1: number, y: number, h: number) => `M${x0} ${y}H${x1}V${y + h}H${x0}Z`;
  return SLAT_YS.map((y) => rect(g.left, g.right, y, SLAT_H)).join('') + rect(g.left, g.stileRight, STILE_Y, STILE_H);
}

export const GARAGE_SLIDING_ICON: LockIconDef = {
  durationMs: GARAGE_SLIDING_DURATION_MS,
  template: (open) => html`
    <svg class="lock-icon neon-halo-icon ${open ? 'is-open' : ''}" viewBox="0 0 24 24" aria-hidden="true">
      <path class="frame solid" d="M22 9V20H20V11H4V20H2V9L12 5L22 9Z"></path>
      <path class="panel solid"></path>
    </svg>
  `,
  paint: (svg, s) => {
    svg.querySelector('.panel')?.setAttribute('d', panelPath(slidingGeometry(s)));
  },
};
