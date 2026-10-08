import { DIAL_END_ANGLE, DIAL_START_ANGLE } from './constants';

/**
 * Geometría pura del dial/arco de la Thermostat Card — sin `this`, sin
 * `hass`, sin lit: solo trigonometría. Extraído de
 * `neon-thermostat-card.ts` (acuerdo nº7/nº8, ver "Una clase, una
 * responsabilidad" en `como-crear-una-tarjeta.md`).
 */

/** Punto (x,y) sobre el aro para un ángulo dado, convención reloj
    (0° = arriba, crece en sentido horario). */
export function pointOnDial(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

/** Trazo SVG del arco entre dos ángulos. El barrido de esta tarjeta es
    siempre exactamente 180° (DIAL_START_ANGLE a DIAL_END_ANGLE), así
    que el flag de "arco grande" queda fijo en 0. */
export function dialArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = pointOnDial(cx, cy, r, startAngle);
  const end = pointOnDial(cx, cy, r, endAngle);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
}

/** Ángulo del dial (convención reloj) que corresponde a una temperatura:
    `DIAL_START_ANGLE` en el mínimo y `DIAL_END_ANGLE` en el máximo. Una
    temperatura fuera de [min, max] se queda en el extremo. Con un rango
    nulo o invertido devuelve el ángulo inicial. */
export function angleForTemp(temp: number, min: number, max: number): number {
  const range = max - min;
  const fraction = range <= 0 ? 0 : Math.min(1, Math.max(0, (temp - min) / range));
  return DIAL_START_ANGLE + (DIAL_END_ANGLE - DIAL_START_ANGLE) * fraction;
}

/** Temperatura (sin ajustar al paso) que corresponde a un ángulo del
    dial; un ángulo fuera del arco se queda en el extremo más cercano. */
export function tempForAngle(angleDeg: number, min: number, max: number): number {
  const clamped = Math.max(DIAL_START_ANGLE, Math.min(DIAL_END_ANGLE, angleDeg));
  const fraction = (clamped - DIAL_START_ANGLE) / (DIAL_END_ANGLE - DIAL_START_ANGLE);
  return min + fraction * (max - min);
}

/** Todo lo que necesitan el dial grande y el aro de la vista normal para
    dibujar el arco de 180° con su punto: trazo, punto, extremos del
    degradado y fracción (acotada) donde el degradado llega a color
    sólido. `idPrefix` + entidad dan un id de degradado único por tarjeta
    (varias tarjetas en el mismo panel no deben compartir el suyo). */
export interface ArcModel {
  fullPath: string;
  dot: { x: number; y: number };
  start: { x: number; y: number };
  end: { x: number; y: number };
  dotFraction: number;
  gradientId: string;
}

const ARC_CX = 50;
const ARC_CY = 50;
const ARC_R = 42;

export function buildArcModel(
  idPrefix: string,
  entity: string,
  minTemp: number,
  maxTemp: number,
  displayTarget: number | null
): ArcModel {
  const targetAngle = displayTarget !== null ? angleForTemp(displayTarget, minTemp, maxTemp) : DIAL_START_ANGLE;
  return {
    fullPath: dialArcPath(ARC_CX, ARC_CY, ARC_R, DIAL_START_ANGLE, DIAL_END_ANGLE),
    dot: pointOnDial(ARC_CX, ARC_CY, ARC_R, targetAngle),
    start: pointOnDial(ARC_CX, ARC_CY, ARC_R, DIAL_START_ANGLE),
    end: pointOnDial(ARC_CX, ARC_CY, ARC_R, DIAL_END_ANGLE),
    dotFraction: Math.min(0.92, Math.max(0.08, (targetAngle - DIAL_START_ANGLE) / (DIAL_END_ANGLE - DIAL_START_ANGLE))),
    gradientId: `${idPrefix}-${entity.replace(/[^a-zA-Z0-9]/g, '-')}`,
  };
}
