import { css } from 'lit';
import type { GradientColors } from './neon-palette';

/**
 * Halo/resplandor neón reutilizable para tarjetas completas (a diferencia
 * del aro SVG de la Entity Card, que rodea un interruptor concreto). Usa
 * las mismas variables `--neon-c1/c2/c3` que resuelve
 * `resolveGradientColors` en `neon-palette.ts`, así que cualquier tarjeta
 * que quiera un "glow" de card completa comparte exactamente el mismo
 * lenguaje visual y la misma paleta que el aro de la Entity Card.
 *
 * Implementado con `box-shadow` en capas (no `radial-gradient` +
 * pseudo-elemento): un `box-shadow` siempre pinta por FUERA del borde del
 * elemento, nunca por dentro, así que separación y "flotar sobre el
 * cristal" quedan garantizados por cómo funciona la propiedad, no hay
 * que pelear con z-index/stacking contexts. El `spread` negativo retrasa
 * dónde empieza a verse el resplandor (separación real de unos píxeles
 * antes de que se note el halo) y los offsets asimétricos concentran más
 * brillo en la esquina superior izquierda, donde vive el icono, en vez
 * de un resplandor uniforme (punto 15 de la spec).
 *
 * Toda la animación es CSS puro (box-shadow + filter), sin JS, para
 * cumplir el objetivo de rendimiento (250-350ms, mínimos re-renderizados).
 *
 * Uso: la tarjeta anfitriona añade `NEON_HALO_STYLES` a su `static
 * styles`, pone la clase `neon-halo-host` en el contenedor y
 * `neon-halo-active` cuando el estado es "activo", fijando las variables
 * con `neonHaloVars(colors)` en el `style` inline del mismo contenedor.
 */
export const NEON_HALO_STYLES = css`
  .neon-halo-host {
    box-shadow: 0 0 0 0 transparent;
    transition: box-shadow 300ms ease-out;
  }
  .neon-halo-host.neon-halo-active {
    /* Las 3 capas se leen de "más cerca del icono" a "más lejos":
       offset negativo (arriba-izquierda, junto al icono) más intenso,
       offset positivo (esquina opuesta) más tenue, capa central para
       rellenar el contorno completo sin que se vea partido en dos. */
    box-shadow:
      -6px -6px 26px -4px color-mix(in srgb, var(--neon-c1) 75%, transparent),
      6px 6px 26px -6px color-mix(in srgb, var(--neon-c3) 55%, transparent),
      0 0 18px -6px color-mix(in srgb, var(--neon-c2) 65%, transparent);
  }
  /* La fuente de luz "nace" del icono: en estado activo adopta el color
     de la paleta (no el neutro del tema) y una doble capa de
     drop-shadow para que "resalte" con claridad, coherente con que el
     halo es más intenso en su esquina (punto 15: "el icono es la fuente
     de iluminación de la tarjeta"). */
  .neon-halo-icon {
    transition: color 300ms ease-out, filter 300ms ease-out;
  }
  .neon-halo-active .neon-halo-icon {
    color: var(--neon-c1);
    filter: drop-shadow(0 0 3px var(--neon-c1)) drop-shadow(0 0 10px color-mix(in srgb, var(--neon-c1) 70%, transparent));
  }
`;

/** Fija las variables CSS `--neon-c1/c2/c3` que consume NEON_HALO_STYLES. */
export function neonHaloVars(colors: GradientColors): string {
  return `--neon-c1: ${colors.c1}; --neon-c2: ${colors.c2}; --neon-c3: ${colors.c3};`;
}
