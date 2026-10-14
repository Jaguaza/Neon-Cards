import { html } from 'lit';
import type { LockIconDef } from './types';
import { clamp01, easeInOut, round } from './easing';

/**
 * Icono «puerta abriéndose»: una hoja con bisagra a la izquierda que se
 * abre HACIA el espectador. Visto de frente, el canto libre se acerca a la
 * bisagra (ancho · cos θ) y, por la perspectiva, la hoja crece en altura
 * (el canto libre está más cerca de nosotros). Detrás de la hoja se
 * descubre el hueco de la puerta, que se va marcando a medida que se abre.
 * El pomo es un agujero (regla evenodd) para no depender del color de
 * fondo de la tarjeta.
 *
 * Marco: jambas y dintel de y=3,4 a y=21,6 (trazo de 1,8); hoja de x=6,3 a
 * 17,7 (hueco de ~1 unidad a cada lado).
 */
export const DOOR_DURATION_MS = 800;

const HINGE_X = 6.3;
const LEAF_W = 11.4;
const LEAF_TOP = 5.0;
const LEAF_BOTTOM = 20.4;
const MID_Y = (LEAF_TOP + LEAF_BOTTOM) / 2;
const HALF_H = (LEAF_BOTTOM - LEAF_TOP) / 2;
/** Apertura máxima de la hoja, en grados. */
export const DOOR_MAX_ANGLE = 72;
/** Cuánto crece la altura del canto libre con sen θ. */
const PERSPECTIVE = 0.16;

export const doorAngle = (s: number): number => DOOR_MAX_ANGLE * easeInOut(s);

export function doorLeafPath(s: number): string {
  const angle = (doorAngle(s) * Math.PI) / 180;
  const freeX = HINGE_X + LEAF_W * Math.cos(angle);
  const grow = 1 + PERSPECTIVE * Math.sin(angle);
  const top = MID_Y - HALF_H * grow;
  const bottom = MID_Y + HALF_H * grow;
  const width = freeX - HINGE_X;
  let d = `M${HINGE_X} ${LEAF_TOP}L${round(freeX)} ${round(top)}V${round(bottom)}L${HINGE_X} ${LEAF_BOTTOM}Z`;
  const r = Math.min(0.9, width * 0.12);
  if (r >= 0.35) {
    const kx = HINGE_X + width * 0.82;
    const ky = MID_Y + 1;
    d += `M${round(kx - r)} ${ky}a${round(r)} ${round(r)} 0 1 0 ${round(2 * r)} 0a${round(r)} ${round(r)} 0 1 0 ${round(-2 * r)} 0Z`;
  }
  return d;
}

/** Opacidad del hueco que se descubre tras la hoja (0 cerrada, 1 abierta). */
export const doorRoomOpacity = (s: number): number => round(clamp01(s));

export const DOOR_ICON: LockIconDef = {
  durationMs: DOOR_DURATION_MS,
  template: (open) => html`
    <svg class="lock-icon neon-halo-icon ${open ? 'is-open' : ''}" viewBox="0 0 24 24" aria-hidden="true">
      <path class="line" d="M2.6 21.6H21.4M4.4 21.6V3.4H19.6V21.6"></path>
      <path class="room soft" d="M5.3 4.3H18.7V20.7H5.3Z"></path>
      <path class="leaf solid" fill-rule="evenodd"></path>
    </svg>
  `,
  paint: (svg, s) => {
    svg.querySelector('.room')?.setAttribute('opacity', String(doorRoomOpacity(s)));
    svg.querySelector('.leaf')?.setAttribute('d', doorLeafPath(s));
  },
};
