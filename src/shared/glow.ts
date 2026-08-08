import { css, html } from 'lit';
import type { TemplateResult } from 'lit';
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

/**
 * Aro nítido con gradiente de 3 colores, mismo lenguaje visual Y MISMA
 * ANIMACIÓN DE ENCENDIDO que el aro SVG de la Entity Card: no es un
 * fundido de opacidad, es un trazo que se "dibuja" (stroke-dasharray +
 * stroke-dashoffset) alrededor del contorno de la tarjeta.
 *
 * A diferencia del switch de Entity (tamaño fijo 64×34, geometría
 * calculada a mano en el `path`), aquí el rect debe adaptarse a
 * cualquier tamaño/`border-radius` de tarjeta. Se resuelve con:
 * - `x`/`y`/`width`/`height`/`rx` fijados por CSS (propiedades de
 *   geometría SVG como CSS, soportado en navegadores modernos) en vez
 *   de atributos XML fijos, para que seguir el tamaño real del host.
 * - `pathLength="100"` en el `<rect>`: normaliza la longitud del
 *   contorno a 100 unidades sea cual sea el tamaño real, así
 *   `stroke-dasharray: 100` + `stroke-dashoffset` funcionan igual en
 *   una tarjeta de 2 columnas que en una de 6, sin recalcular nada.
 *
 * Uso: la tarjeta anfitriona añade `NEON_RING_STYLES`, incluye
 * `neonRingTemplate(uid)` como primer hijo dentro de `ha-card`, pone la
 * clase `neon-ring-host` en el contenedor y `neon-halo-active`
 * (compartida con `NEON_HALO_STYLES`) cuando el estado es "activo".
 * `uid` debe ser estable y único por instancia (para no chocar los
 * `id` del `<linearGradient>` cuando hay varias tarjetas en el mismo
 * dashboard).
 */
export const NEON_RING_STYLES = css`
  .neon-ring-host {
    position: relative;
  }
  .neon-ring-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }
  .neon-ring-rect {
    x: 1.2px;
    y: 1.2px;
    width: calc(100% - 2.4px);
    height: calc(100% - 2.4px);
    rx: var(--ha-card-border-radius, 12px);
    fill: none;
    stroke-width: 2.4px;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--neon-c2) 65%, transparent));
    transition: stroke-dashoffset 900ms ease-in-out;
  }
  .neon-ring-host.neon-halo-active .neon-ring-rect {
    stroke-dashoffset: 0;
  }
`;

/**
 * Markup del aro SVG que consume `NEON_RING_STYLES`. `uid` identifica el
 * `<linearGradient>` para que no colisione con el de otras tarjetas
 * Button en el mismo dashboard.
 */
export function neonRingTemplate(uid: string): TemplateResult {
  return html`
    <svg class="neon-ring-svg" aria-hidden="true">
      <defs>
        <linearGradient id="neon-ring-grad-${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="var(--neon-c1)" />
          <stop offset="50%" stop-color="var(--neon-c2)" />
          <stop offset="100%" stop-color="var(--neon-c3)" />
        </linearGradient>
      </defs>
      <rect class="neon-ring-rect" pathLength="100" stroke="url(#neon-ring-grad-${uid})"></rect>
    </svg>
  `;
}

/** Fija las variables CSS `--neon-c1/c2/c3` que consume NEON_HALO_STYLES. */
export function neonHaloVars(colors: GradientColors): string {
  return `--neon-c1: ${colors.c1}; --neon-c2: ${colors.c2}; --neon-c3: ${colors.c3};`;
}
