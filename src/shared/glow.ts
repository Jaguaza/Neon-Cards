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
 * Toda la animación es CSS puro (opacity + transform), sin JS, para
 * cumplir el objetivo de rendimiento (250-350ms, mínimos re-renderizados).
 *
 * Uso: la tarjeta anfitriona añade `NEON_HALO_STYLES` a su `static
 * styles`, pone la clase `neon-halo-host` en el contenedor y
 * `neon-halo-active` cuando el estado es "activo", fijando las variables
 * con `neonHaloVars(colors)` en el `style` inline del mismo contenedor.
 */
export const NEON_HALO_STYLES = css`
  .neon-halo-host {
    position: relative;
    isolation: isolate;
  }
  .neon-halo-host::before {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: inherit;
    background: radial-gradient(circle at 28% 22%, var(--neon-c1) 0%, transparent 62%),
      radial-gradient(circle at 72% 78%, var(--neon-c3) 0%, transparent 62%),
      radial-gradient(circle at 50% 50%, var(--neon-c2) 0%, transparent 68%);
    filter: blur(20px);
    opacity: 0;
    transform: scale(0.94);
    transition: opacity 300ms ease-out, transform 300ms ease-out;
    pointer-events: none;
    z-index: -1;
  }
  .neon-halo-host.neon-halo-active::before {
    opacity: 0.5;
    transform: scale(1);
  }
  /* La fuente de luz "nace" del icono: el propio icono recibe un
     drop-shadow con el color medio de la paleta cuando está activo. */
  .neon-halo-icon {
    transition: filter 300ms ease-out, opacity 300ms ease-out;
  }
  .neon-halo-active .neon-halo-icon {
    filter: drop-shadow(0 0 6px var(--neon-c2));
  }
`;

/** Fija las variables CSS `--neon-c1/c2/c3` que consume NEON_HALO_STYLES. */
export function neonHaloVars(colors: GradientColors): string {
  return `--neon-c1: ${colors.c1}; --neon-c2: ${colors.c2}; --neon-c3: ${colors.c3};`;
}
