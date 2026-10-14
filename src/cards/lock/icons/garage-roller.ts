import { html } from 'lit';
import type { LockIconDef } from './types';
import { easeInOut, round } from './easing';

/**
 * Icono «garaje con puerta enrollable», con la silueta de
 * `mdi:garage-variant`: tejado y jambas macizos y tres lamas de 2 de alto
 * (paso 3) dentro del hueco. Al abrir, la puerta SUBE: las lamas ascienden
 * y se recortan al entrar bajo el dintel (y=11), como si se enrollaran en
 * el tambor que hay tras él. Abierto queda solo la lama inferior pegada al
 * dintel, igual que `mdi:garage-open-variant`.
 *
 * Marco: x de 2 a 22, tejado hasta y=5, dintel en y=11, suelo en y=20.
 * Lamas: x de 5 a 19, a y=12, 15 y 18.
 */
export const GARAGE_ROLLER_DURATION_MS = 1100;

const X0 = 5;
const X1 = 19;
const LINTEL_Y = 11;
const SLAT_H = 2;
const SLAT_PITCH = 3;
const SLAT_FIRST_Y = 12;
const SLAT_COUNT = 3;
/** Lo que sube la puerta: la lama inferior acaba donde empezaba la superior. */
const LIFT = SLAT_PITCH * (SLAT_COUNT - 1);
/** Una lama recortada a menos de esto ya no se dibuja. */
const MIN_VISIBLE = 0.15;

export interface RollerSlat {
  y: number;
  height: number;
}

export interface RollerGeometry {
  lift: number;
  slats: RollerSlat[];
}

export function rollerGeometry(s: number): RollerGeometry {
  const lift = LIFT * easeInOut(s);
  const slats: RollerSlat[] = [];
  for (let k = 0; k < SLAT_COUNT; k++) {
    const top = SLAT_FIRST_Y + k * SLAT_PITCH - lift;
    const visibleTop = Math.max(top, LINTEL_Y);
    const height = top + SLAT_H - visibleTop;
    if (height >= MIN_VISIBLE) slats.push({ y: round(visibleTop), height: round(height) });
  }
  return { lift: round(lift), slats };
}

export const slatsPath = (slats: RollerSlat[]): string =>
  slats.map(({ y, height }) => `M${X0} ${y}H${X1}V${round(y + height)}H${X0}Z`).join('');

export const GARAGE_ROLLER_ICON: LockIconDef = {
  durationMs: GARAGE_ROLLER_DURATION_MS,
  template: (open) => html`
    <svg class="lock-icon neon-halo-icon ${open ? 'is-open' : ''}" viewBox="0 0 24 24" aria-hidden="true">
      <path class="frame solid" d="M22 9V20H20V11H4V20H2V9L12 5L22 9Z"></path>
      <path class="slats solid"></path>
    </svg>
  `,
  paint: (svg, s) => {
    svg.querySelector('.slats')?.setAttribute('d', slatsPath(rollerGeometry(s).slats));
  },
};
