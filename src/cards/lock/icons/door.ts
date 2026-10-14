import { html } from 'lit';
import type { LockIconDef } from './types';
import { easeInOut, round } from './easing';

/**
 * Icono «puerta», de `mdi:door-closed` (cerrada) a `mdi:door-open`
 * (abierta). El marco (jambas, dintel redondeado y suelo) no se mueve.
 * La hoja gira como la página de un libro sobre el eje de la jamba
 * izquierda (x=11): cerrada ocupa el hueco (x de 12 a 19) y abierta queda
 * volcada a la izquierda (x de 3 a 10), exactamente como en el MDI.
 *
 * Durante el giro se ve la hoja de frente (primera mitad) como un contorno
 * en «U» que va engordando, se queda de canto a los 90° y aparece su cara
 * posterior maciza (segunda mitad). El pomo es relleno de frente y un
 * agujero en la cara maciza, como en los dos MDI. Por la perspectiva, el
 * canto libre crece un poco en altura a mitad del giro.
 */
export const DOOR_DURATION_MS = 900;

const HINGE_X = 11;
const R_NEAR = 1;
const R_FAR = 8;
const TOP_Y = 5;
const BOTTOM_Y = 19;
const GROW_TOP = 1.4;
const GROW_BOTTOM = 1.0;
const RIM = 1.6;
const RIM_RAMP_DEG = 25;
const MIN_RIM = 0.05;
const KNOB_Y = 11;
const KNOB_SIZE = 2;
const KNOB_R_CLOSED = 6;
const KNOB_R_OPEN = 5;
const MIN_KNOB_HALF = 0.05;
/** Apertura máxima de la hoja, en grados (volcada del todo). */
export const DOOR_MAX_ANGLE = 180;

export const doorAngle = (s: number): number => DOOR_MAX_ANGLE * easeInOut(s);

const rad = (deg: number): number => (deg * Math.PI) / 180;
const pt = (x: number, y: number): string => `${round(x)} ${round(y)}`;

/** Punto de la hoja a distancia `r` de la bisagra: su x y sus y de arriba y abajo. */
function edge(r: number, angle: number) {
  const lift = (Math.sin(rad(angle)) * r) / R_FAR;
  return { x: HINGE_X + r * Math.cos(rad(angle)), top: TOP_Y - GROW_TOP * lift, bottom: BOTTOM_Y + GROW_BOTTOM * lift };
}

function knobRect(angle: number): string {
  const c = Math.cos(rad(angle));
  const radius = KNOB_R_CLOSED + ((KNOB_R_OPEN - KNOB_R_CLOSED) * angle) / DOOR_MAX_ANGLE;
  const x = HINGE_X + radius * c;
  const half = (KNOB_SIZE / 2) * Math.abs(c);
  if (half < MIN_KNOB_HALF) return '';
  return `M${round(x - half)} ${KNOB_Y}H${round(x + half)}V${KNOB_Y + KNOB_SIZE}H${round(x - half)}Z`;
}

/**
 * Hoja: contorno en «U» de frente (<90°) o cuerpo macizo con el pomo como
 * agujero (≥90°). Cerrada no hay hoja que dibujar (el hueco es el MDI).
 */
export function doorLeafPath(s: number): string {
  const angle = doorAngle(s);
  const near = edge(R_NEAR, angle);
  const far = edge(R_FAR, angle);
  if (angle >= 90) {
    return `M${pt(near.x, near.top)}L${pt(far.x, far.top)}L${pt(far.x, far.bottom)}L${pt(near.x, near.bottom)}Z${knobRect(angle)}`;
  }
  const rim = RIM * Math.min(1, angle / RIM_RAMP_DEG);
  if (rim < MIN_RIM) return '';
  const nearIn = edge(R_NEAR + rim, angle);
  const farIn = edge(R_FAR - rim, angle);
  return (
    `M${pt(near.x, near.top)}L${pt(far.x, far.top)}L${pt(far.x, far.bottom)}L${pt(farIn.x, farIn.bottom)}` +
    `L${pt(farIn.x, farIn.top + rim)}L${pt(nearIn.x, nearIn.top + rim)}L${pt(nearIn.x, nearIn.bottom)}L${pt(near.x, near.bottom)}Z`
  );
}

/** Pomo relleno (solo de frente); de espaldas es un agujero de `doorLeafPath`. */
export const doorKnobPath = (s: number): string => {
  const angle = doorAngle(s);
  return angle < 90 ? knobRect(angle) : '';
};

export const DOOR_ICON: LockIconDef = {
  durationMs: DOOR_DURATION_MS,
  template: (open) => html`
    <svg class="lock-icon neon-halo-icon ${open ? 'is-open' : ''}" viewBox="0 0 24 24" aria-hidden="true">
      <path class="frame solid" fill-rule="evenodd" d="M12 3H19C20.11 3 21 3.89 21 5V19H22V21H2V19H10V5C10 3.89 10.89 3 12 3ZM12 5V19H19V5H12Z"></path>
      <path class="leaf solid" fill-rule="evenodd"></path>
      <path class="knob solid"></path>
    </svg>
  `,
  paint: (svg, s) => {
    svg.querySelector('.leaf')?.setAttribute('d', doorLeafPath(s));
    svg.querySelector('.knob')?.setAttribute('d', doorKnobPath(s));
  },
};
