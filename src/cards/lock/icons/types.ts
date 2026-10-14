import type { TemplateResult } from 'lit';

/**
 * Un icono animado de la Lock Card. La forma NO se anima con transiciones
 * CSS sino que se CALCULA para cada instante (`paint`): un giro por
 * `scaleX` pasa por 0 y obliga a usar `non-scaling-stroke`, combinación que
 * cada navegador dibuja distinto (o congela). Así todos los iconos se
 * mueven con `LockPoseAnimator` y comparten sus garantías: reversión a
 * mitad de recorrido sin saltos y posición correcta aunque el navegador
 * retrase los fotogramas.
 */
export interface LockIconDef {
  /** Duración del recorrido completo cerrado → abierto, en ms. */
  durationMs: number;
  /**
   * `<svg class="lock-icon neon-halo-icon">` con los elementos del icono.
   * Solo lleva la parte fija; la variable la escribe `paint`. `open` es el
   * marcador `is-open` de la pose de destino.
   */
  template(open: boolean): TemplateResult;
  /** Escribe la geometría del progreso `s` (0 cerrado, 1 abierto) en el SVG. */
  paint(svg: SVGElement, s: number): void;
}
