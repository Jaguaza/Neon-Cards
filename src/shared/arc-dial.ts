/**
 * Geometría pura del dial en arco de 180° — sin `this`, sin `hass`, sin lit:
 * solo trigonometría. La comparten las tarjetas que dibujan un arco
 * arrastrable (valor entre un mínimo y un máximo), cada una con su unidad:
 * grados de temperatura, porcentaje de apertura...
 */

/** Ángulos (convención reloj: 0° = arriba, crece en sentido horario) de la
    semicircunferencia — EXACTAMENTE 180° de barrido, diámetro horizontal
    puro. */
export const DIAL_START_ANGLE = -90;
export const DIAL_END_ANGLE = 90;

/** Punto (x,y) sobre el aro para un ángulo dado, convención reloj
    (0° = arriba, crece en sentido horario). */
export function pointOnDial(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

/** Trazo SVG del arco entre dos ángulos. El barrido es siempre exactamente
    180° (`DIAL_START_ANGLE` a `DIAL_END_ANGLE`), así que el flag de «arco
    grande» queda fijo en 0. */
export function dialArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = pointOnDial(cx, cy, r, startAngle);
  const end = pointOnDial(cx, cy, r, endAngle);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
}

/** Ángulo del dial (convención reloj) que corresponde a un valor:
    `DIAL_START_ANGLE` en el mínimo y `DIAL_END_ANGLE` en el máximo. Un valor
    fuera de [min, max] se queda en el extremo. Con un rango nulo o
    invertido devuelve el ángulo inicial. */
export function angleForValue(value: number, min: number, max: number): number {
  const range = max - min;
  const fraction = range <= 0 ? 0 : Math.min(1, Math.max(0, (value - min) / range));
  return DIAL_START_ANGLE + (DIAL_END_ANGLE - DIAL_START_ANGLE) * fraction;
}

/** Valor (sin ajustar a ningún paso) que corresponde a un ángulo del dial;
    un ángulo fuera del arco se queda en el extremo más cercano. */
export function valueForAngle(angleDeg: number, min: number, max: number): number {
  const clamped = Math.max(DIAL_START_ANGLE, Math.min(DIAL_END_ANGLE, angleDeg));
  const fraction = (clamped - DIAL_START_ANGLE) / (DIAL_END_ANGLE - DIAL_START_ANGLE);
  return min + fraction * (max - min);
}

/** Ángulo del dial (convención reloj, en grados) bajo un punto de la
    pantalla, tomando como centro el de la caja `rect` (la del `<svg>` del
    dial). Sin acotar al arco: eso lo hace `valueForAngle`. */
export function angleFromPoint(
  rect: { left: number; top: number; width: number; height: number },
  clientX: number,
  clientY: number
): number {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return Math.atan2(clientX - cx, -(clientY - cy)) * (180 / Math.PI);
}

/** Todo lo que necesita un dial para dibujar el arco de 180° con su punto:
    trazo, punto, extremos del degradado y fracción (acotada) donde el
    degradado llega a color sólido. `idPrefix` + `id` dan un id de degradado
    único por tarjeta (varias tarjetas en el mismo panel no deben compartir
    el suyo). */
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

export function buildArcModel(idPrefix: string, id: string, min: number, max: number, value: number | null): ArcModel {
  const valueAngle = value !== null ? angleForValue(value, min, max) : DIAL_START_ANGLE;
  return {
    fullPath: dialArcPath(ARC_CX, ARC_CY, ARC_R, DIAL_START_ANGLE, DIAL_END_ANGLE),
    dot: pointOnDial(ARC_CX, ARC_CY, ARC_R, valueAngle),
    start: pointOnDial(ARC_CX, ARC_CY, ARC_R, DIAL_START_ANGLE),
    end: pointOnDial(ARC_CX, ARC_CY, ARC_R, DIAL_END_ANGLE),
    dotFraction: Math.min(0.92, Math.max(0.08, (valueAngle - DIAL_START_ANGLE) / (DIAL_END_ANGLE - DIAL_START_ANGLE))),
    gradientId: `${idPrefix}-${id.replace(/[^a-zA-Z0-9]/g, '-')}`,
  };
}
