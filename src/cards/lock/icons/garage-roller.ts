import { html } from 'lit';
import type { LockIconDef } from './types';
import { easeInOut, round } from './easing';

/**
 * Icono «garaje con puerta enrollable»: la puerta de lamas SUBE y se enrolla
 * en el tambor que hay bajo el dintel. La barra inferior sube hasta casi
 * tocar el tambor, las lamas (ancladas a la barra) van desapareciendo por
 * arriba y el tambor engorda a medida que recoge puerta.
 *
 * Marco de casa: jambas en x=2,6 y 21,4, tejado hasta y=3,4 y dintel en
 * y=10,4; la puerta ocupa x de 3,9 a 20,1 y de y=11,6 a y=20,6.
 */
export const GARAGE_ROLLER_DURATION_MS = 1100;

const X0 = 3.9;
const WIDTH = 16.2;
const X1 = round(X0 + WIDTH);
const TOP = 11.6;
const BAR_H = 1.6;
const BAR_CLOSED_Y = 19.0;
const BAR_OPEN_Y = 14.2;
const ROLL_CLOSED = 0.7;
const ROLL_OPEN = 2.4;
const SLAT_PITCH = 2.2;
const SLAT_FIRST_OFFSET = 1.3;
const SLAT_MARGIN = 0.9;

export interface RollerGeometry {
  barY: number;
  rollHeight: number;
  panelY: number;
  panelHeight: number;
  slats: number[];
}

export function rollerGeometry(s: number): RollerGeometry {
  const e = easeInOut(s);
  const barY = BAR_CLOSED_Y + (BAR_OPEN_Y - BAR_CLOSED_Y) * e;
  const rollHeight = ROLL_CLOSED + (ROLL_OPEN - ROLL_CLOSED) * e;
  const panelY = TOP + rollHeight;
  const slats: number[] = [];
  for (let y = barY - SLAT_FIRST_OFFSET; y > panelY + SLAT_MARGIN; y -= SLAT_PITCH) slats.push(round(y));
  return { barY: round(barY), rollHeight: round(rollHeight), panelY: round(panelY), panelHeight: round(barY - panelY), slats };
}

export const GARAGE_ROLLER_ICON: LockIconDef = {
  durationMs: GARAGE_ROLLER_DURATION_MS,
  template: (open) => html`
    <svg class="lock-icon neon-halo-icon ${open ? 'is-open' : ''}" viewBox="0 0 24 24" aria-hidden="true">
      <path class="line" d="M2.6 21.6V9.6L12 3.4l9.4 6.2v12H2.6ZM2.6 10.4H21.4"></path>
      <rect class="panel soft" x="${X0}" width="${WIDTH}"></rect>
      <path class="slats line"></path>
      <rect class="roll solid" x="${X0}" y="${TOP}" width="${WIDTH}" rx="0.6"></rect>
      <rect class="bar solid" x="${X0}" width="${WIDTH}" height="${BAR_H}" rx="0.6"></rect>
    </svg>
  `,
  paint: (svg, s) => {
    const g = rollerGeometry(s);
    const set = (sel: string, attrs: Record<string, string | number>) => {
      const el = svg.querySelector(sel);
      if (el) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    };
    set('.roll', { height: g.rollHeight });
    set('.panel', { y: g.panelY, height: g.panelHeight });
    set('.bar', { y: g.barY });
    set('.slats', { d: g.slats.map((y) => `M${X0} ${y}H${X1}`).join('') });
  },
};
