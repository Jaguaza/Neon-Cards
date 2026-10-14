/**
 * Geometría del candado animado (viewBox 24x24; cuerpo de y=12 a y=22).
 *
 * La forma del arco se CALCULA para cada instante en lugar de animarla con
 * transformaciones CSS: un giro por `scaleX` pasa por 0 (matriz no
 * invertible) y obliga a usar `vector-effect: non-scaling-stroke` para que
 * el alambre no cambie de grosor, y esa combinación se dibuja distinto (o
 * se queda congelada) según el motor del navegador. Aquí el arco siempre
 * es un trazo normal de grosor constante, así que no hay nada que
 * dependa del motor.
 *
 * Movimiento (progreso `s` de 0 = cerrado a 1 = abierto):
 *  1. `s` de 0 a LIFT_SHARE: el arco SUBE y su pata corta sale del cuerpo.
 *  2. `s` de LIFT_SHARE a 1: GIRA 180° sobre el eje vertical de la pata
 *     larga (que sigue dentro del cuerpo). Visto de frente, el giro de un
 *     arco semicircular es una semielipse cuyo ancho es R·|cos θ|.
 * Cerrar es recorrer el mismo `s` hacia atrás.
 */
export const POSE_TOTAL_MS = 660;
/** Parte del recorrido (240 ms de 660) que ocupa la subida. */
export const LIFT_SHARE = 240 / POSE_TOTAL_MS;

const AXIS_X = 8.5; // pata larga (eje del giro)
const RADIUS = 3.5; // radio del arco: la pata corta está a 2·RADIUS del eje
const TOP_Y = 10; // donde acaban las patas rectas y empieza el arco
const LONG_BOTTOM_Y = 17.5; // la pata larga baja hasta dentro del cuerpo
const SHORT_BOTTOM_Y = 13.6; // la corta apenas se mete en el cuerpo
const LIFT_UNITS = 3.4; // subida: la pata corta queda libre del cuerpo
/** Ancho mínimo (en fracción de RADIUS) del arco visto de canto: evita un arco degenerado de ancho 0. */
const MIN_WIDTH = 0.04;

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
const round = (n: number): number => Math.round(n * 1000) / 1000;

export interface ShackleGeometry {
  /** Unidades que ha subido el arco (0 a LIFT_UNITS). */
  lift: number;
  /** Ángulo de giro en grados (0 a 180). */
  angle: number;
}

export function shackleGeometry(s: number): ShackleGeometry {
  const lifting = clamp01(s / LIFT_SHARE);
  const turning = clamp01((s - LIFT_SHARE) / (1 - LIFT_SHARE));
  return {
    lift: LIFT_UNITS * (1 - (1 - lifting) ** 2), // ease-out al subir (ease-in al bajar)
    angle: 180 * turning, // velocidad angular constante
  };
}

/** Atributo `d` del arco para el progreso `s` (0 cerrado, 1 abierto). */
export function shacklePath(s: number): string {
  const { lift, angle } = shackleGeometry(s);
  const cos = Math.cos((angle * Math.PI) / 180);
  const width = Math.max(Math.abs(cos), MIN_WIDTH);
  const side = cos >= 0 ? 1 : -1;
  const rx = round(RADIUS * width);
  const freeX = round(AXIS_X + side * 2 * RADIUS * width);
  const y = (v: number) => round(v - lift);
  // M pata larga (abajo) → V hasta el arco → A semielipse → V pata corta (abajo)
  return `M${AXIS_X} ${y(LONG_BOTTOM_Y)}V${y(TOP_Y)}A${rx} ${RADIUS} 0 0 ${side > 0 ? 1 : 0} ${freeX} ${y(TOP_Y)}V${y(SHORT_BOTTOM_Y)}`;
}
