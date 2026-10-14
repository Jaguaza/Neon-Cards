import { html } from 'lit';
import type { LockIconDef } from './types';
import { easeInOut, round } from './easing';

/**
 * Icono «garaje con puerta corredera»: un panel que se DESLIZA en
 * horizontal hacia la derecha y se esconde tras la jamba, dejando el hueco
 * del garaje libre. El panel lleva ranuras verticales y un tirador en su
 * canto delantero, que se mueven con él y se recortan al llegar a la jamba
 * (el recorte es aritmético: nada se dibuja fuera del hueco).
 *
 * Mismo marco de casa que `garage-roller.ts`; el panel mide 16,2 y recorre
 * 13,2 unidades, de modo que abierto asoma una franja de 3 unidades.
 */
export const GARAGE_SLIDING_DURATION_MS = 1000;

const X0 = 3.9;
const X1 = 20.1;
const WIDTH = round(X1 - X0);
const TOP = 11.6;
const BOTTOM = 20.6;
const TRAVEL = 13.2;
const GROOVE_TOP = round(TOP + 0.9);
const GROOVE_BOTTOM = round(BOTTOM - 0.9);
const HANDLE_W = 1.4;
const HANDLE_Y = 14.2;
const HANDLE_H = 4.2;

export interface SlidingGeometry {
  left: number;
  grooves: number[];
  handleX: number | undefined;
}

export function slidingGeometry(s: number): SlidingGeometry {
  const left = X0 + TRAVEL * easeInOut(s);
  const grooves = [1, 2, 3].map((k) => left + (k * WIDTH) / 4).filter((x) => x < X1 - 0.4).map(round);
  const handle = left + 1.0;
  return { left: round(left), grooves, handleX: handle + HANDLE_W < X1 - 0.2 ? round(handle) : undefined };
}

export const GARAGE_SLIDING_ICON: LockIconDef = {
  durationMs: GARAGE_SLIDING_DURATION_MS,
  template: (open) => html`
    <svg class="lock-icon neon-halo-icon ${open ? 'is-open' : ''}" viewBox="0 0 24 24" aria-hidden="true">
      <path class="line" d="M2.6 21.6V9.6L12 3.4l9.4 6.2v12H2.6ZM2.6 10.4H21.4"></path>
      <path class="panel soft"></path>
      <path class="edge line"></path>
      <path class="grooves line groove"></path>
      <rect class="handle solid" y="${HANDLE_Y}" width="${HANDLE_W}" height="${HANDLE_H}" rx="0.6"></rect>
    </svg>
  `,
  paint: (svg, s) => {
    const g = slidingGeometry(s);
    svg.querySelector('.panel')?.setAttribute('d', `M${g.left} ${TOP}H${X1}V${BOTTOM}H${g.left}Z`);
    svg.querySelector('.edge')?.setAttribute('d', `M${X1} ${TOP}H${g.left}V${BOTTOM}H${X1}`);
    svg.querySelector('.grooves')?.setAttribute('d', g.grooves.map((x) => `M${x} ${GROOVE_TOP}V${GROOVE_BOTTOM}`).join(''));
    const handle = svg.querySelector('.handle');
    if (handle) {
      handle.setAttribute('opacity', g.handleX === undefined ? '0' : '1');
      if (g.handleX !== undefined) handle.setAttribute('x', String(g.handleX));
    }
  },
};
