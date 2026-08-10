import { css, html } from 'lit';
import type { TemplateResult } from 'lit';
import type { GradientColors } from './neon-palette';

/**
 * Brillo de icono neón reutilizable: en estado activo adopta el color de
 * la paleta (variables `--neon-c1/c2/c3` que resuelve
 * `resolveGradientColors` en `neon-palette.ts`) con doble capa de
 * `drop-shadow`, en vez del color neutro del tema — la fuente de luz
 * "nace" del propio icono. Cualquier tarjeta que quiera este efecto
 * comparte exactamente el mismo lenguaje visual y la misma paleta.
 *
 * Uso: la tarjeta anfitriona añade `NEON_HALO_STYLES` a su `static
 * styles`, pone la clase `neon-halo-icon` en el icono y `neon-halo-active`
 * en un ancestro (normalmente el host) cuando el estado es "activo",
 * fijando las variables con `neonHaloVars(colors)` en el `style` inline.
 */
export const NEON_HALO_STYLES = css`
  .neon-halo-icon {
    transition: color 300ms ease-out, filter 300ms ease-out;
  }
  .neon-halo-active .neon-halo-icon {
    color: var(--neon-c1);
    filter: drop-shadow(0 0 3px var(--neon-c1)) drop-shadow(0 0 10px color-mix(in srgb, var(--neon-c1) 70%, transparent));
  }
`;

/**
 * Aro nítido con gradiente de 3 colores dividido en DOS mitades, igual
 * que el aro SVG de la Entity Card: ambas arrancan del mismo punto
 * (esquina superior izquierda) y se dibujan en direcciones opuestas —
 * una via el borde superior + derecho, la otra via el izquierdo +
 * inferior — encontrándose en la esquina inferior derecha.
 *
 * Requiere JavaScript: un `<path>` con arcos de esquina necesita
 * coordenadas en unidades reales — el atributo `d` no admite `%` ni
 * `calc()` — así que recibe el ancho/alto real medido de la tarjeta.
 * (Ver Button Card: en vez de `ResizeObserver`, que resultó no
 * disparar de forma fiable tras crear/mover tarjetas en el editor de
 * HA, se mide con `requestAnimationFrame` en bucle continuo mientras
 * la tarjeta está montada — no depende de que ningún evento "avise"
 * del cambio, así que no puede quedarse desincronizado.)
 *
 * Cada mitad usa `pathLength="50"` + `stroke-dasharray: 50` +
 * `stroke-dashoffset` 50→0, exactamente la misma técnica que usan los
 * dos `<path>` del aro de Entity.
 *
 * Uso: la tarjeta anfitriona añade `NEON_RING_SPLIT_STYLES`, incluye
 * `neonRingSplitTemplate(uid, width, height, radius)` como primer hijo
 * dentro de `ha-card`, pone la clase `neon-ring-host` en el contenedor
 * y `neon-halo-active` (compartida con `NEON_HALO_STYLES`) cuando el
 * estado es "activo". `uid` debe ser estable y único por instancia
 * (para no chocar los `id` del `<linearGradient>` cuando hay varias
 * tarjetas en el mismo dashboard).
 */
export const NEON_RING_SPLIT_STYLES = css`
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
  .neon-ring-path {
    fill: none;
    stroke-width: 2.4px;
    /* SIN stroke-linecap: round — con dash+gap y linecap redondeado, el
       instante en que el trazo pasa por longitud casi cero (al empezar
       a encenderse o justo en el punto de encuentro de las dos
       mitades) deja un punto redondeado residual visible. El aro de la
       Entity Card tampoco usa linecap redondeado. "butt" (por defecto)
       no genera ese artefacto. */
    stroke-dasharray: 50;
    stroke-dashoffset: 50;
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--neon-c2) 65%, transparent));
    transition: stroke-dashoffset 900ms ease-in-out;
  }
  .neon-ring-host.neon-halo-active .neon-ring-path {
    stroke-dashoffset: 0;
  }
`;

/**
 * Calcula los dos trazados (`d`) de las mitades del aro para un
 * rectángulo redondeado de `width`×`height` con radio `radius`,
 * separado `inset` px del borde real de la tarjeta (la mitad del
 * grosor del trazo, para que el aro quede centrado sobre el borde).
 * Ambos arrancan/terminan en el punto medio (45°) de la esquina
 * correspondiente para que el encuentro entre las dos mitades sea
 * exacto, sin solape ni hueco.
 */
export function neonRingSplitPaths(
  width: number,
  height: number,
  radius: number,
  inset: number,
): { top: string; bottom: string } {
  const r = Math.max(0, Math.min(radius, width / 2 - inset, height / 2 - inset));
  const x0 = inset;
  const y0 = inset;
  const x1 = Math.max(x0, width - inset);
  const y1 = Math.max(y0, height - inset);
  // Punto al 45° del arco de esquina (mitad de cada cuarto de círculo).
  const k = r * (1 - Math.SQRT1_2);
  const startX = x0 + k;
  const startY = y0 + k;
  const endX = x1 - k;
  const endY = y1 - k;

  // Mitad "superior-derecha": del punto medio de la esquina sup-izq,
  // termina el arco → borde superior → esquina sup-derecha (completa)
  // → borde derecho → mitad del arco inferior-derecho.
  const top = [
    `M ${startX} ${startY}`,
    `A ${r} ${r} 0 0 1 ${x0 + r} ${y0}`,
    `L ${x1 - r} ${y0}`,
    `A ${r} ${r} 0 0 1 ${x1} ${y0 + r}`,
    `L ${x1} ${y1 - r}`,
    `A ${r} ${r} 0 0 1 ${endX} ${endY}`,
  ].join(' ');

  // Mitad "inferior-izquierda": mismo punto de partida, sentido
  // contrario → borde izquierdo → esquina inf-izq (completa) → borde
  // inferior → mitad del arco inferior-derecho (mismo punto final).
  const bottom = [
    `M ${startX} ${startY}`,
    `A ${r} ${r} 0 0 0 ${x0} ${y0 + r}`,
    `L ${x0} ${y1 - r}`,
    `A ${r} ${r} 0 0 0 ${x0 + r} ${y1}`,
    `L ${x1 - r} ${y1}`,
    `A ${r} ${r} 0 0 0 ${endX} ${endY}`,
  ].join(' ');

  return { top, bottom };
}

/**
 * Markup del aro SVG partido en dos que consume `NEON_RING_SPLIT_STYLES`.
 * `uid` identifica el `<linearGradient>` para que no colisione con el de
 * otras tarjetas Button en el mismo dashboard.
 */
export function neonRingSplitTemplate(
  uid: string,
  width: number,
  height: number,
  radius: number,
): TemplateResult {
  const strokeWidth = 2.4;
  const paths = neonRingSplitPaths(width, height, radius, strokeWidth / 2);
  return html`
    <svg class="neon-ring-svg" aria-hidden="true">
      <defs>
        <linearGradient id="neon-ring-grad-${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="var(--neon-c1)" />
          <stop offset="50%" stop-color="var(--neon-c2)" />
          <stop offset="100%" stop-color="var(--neon-c3)" />
        </linearGradient>
      </defs>
      <path
        class="neon-ring-path"
        pathLength="50"
        stroke="url(#neon-ring-grad-${uid})"
        d=${paths.top}
      ></path>
      <path
        class="neon-ring-path"
        pathLength="50"
        stroke="url(#neon-ring-grad-${uid})"
        d=${paths.bottom}
      ></path>
    </svg>
  `;
}

/** Fija las variables CSS `--neon-c1/c2/c3` que consume NEON_HALO_STYLES. */
export function neonHaloVars(colors: GradientColors): string {
  return `--neon-c1: ${colors.c1}; --neon-c2: ${colors.c2}; --neon-c3: ${colors.c3};`;
}
