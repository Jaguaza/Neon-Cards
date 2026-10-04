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
