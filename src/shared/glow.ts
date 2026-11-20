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
  /**
   * Estado de error (entidad rota/no encontrada): mismo lenguaje visual
   * de base que el halo activo (drop-shadow, luz que nace del icono),
   * pero con rojo neón fijo (no la paleta configurada — es un estado
   * semántico, "algo falla", no una variante de color más) y con una
   * capa extra de glow para que lea como rótulo de neón, no como un
   * simple tinte. Si esta clase y .neon-halo-active coinciden alguna
   * vez en el mismo ancestro, el error va después en la hoja de
   * estilos y gana, que es el comportamiento correcto (con entidad
   * rota _isActive ya es false en la práctica, pero así queda
   * blindado).
   */
  .neon-halo-error .neon-halo-icon {
    color: var(--neon-error-color, #ff2d6b);
    /* Tres capas (núcleo nítido → medio → halo amplio y difuso) en vez
       de las dos que usa el halo activo normal — más cerca de un rótulo
       de neón real (referencia: letreros "neon X" con núcleo blanco-
       rosado muy saturado y una difusión amplia alrededor), ya que este
       icono debe llamar la atención como una alerta, no fundirse con el
       resto de iconos en reposo. */
    filter: drop-shadow(0 0 2px var(--neon-error-color, #ff2d6b))
      drop-shadow(0 0 6px var(--neon-error-color, #ff2d6b))
      drop-shadow(0 0 16px color-mix(in srgb, var(--neon-error-color, #ff2d6b) 65%, transparent));
  }
  /**
   * Tema claro (\`BaseNeonCard\` pone \`data-neon-light\` en el host cuando
   * \`hass.themes.darkMode\` es false). Los colores neón apenas contrastan
   * con un fondo claro (entre 1,1 y 2,2 sobre el cristal, cuando lo mínimo
   * para un elemento gráfico es 3) y el halo difuminaba el borde, así que
   * el icono perdía la silueta. Se conserva el color neón puro y se cambia
   * el resplandor por un contorno fino del mismo tono oscurecido, con un
   * halo muy suave. En oscuro no cambia nada. Va después del error para
   * ganar con la misma especificidad en ambos estados.
   */
  :host([data-neon-light]) .neon-halo-active .neon-halo-icon {
    filter: drop-shadow(0 0 0.6px color-mix(in srgb, var(--neon-c1) 40%, #000))
      drop-shadow(0 0 1px color-mix(in srgb, var(--neon-c1) 40%, #000))
      drop-shadow(0 0 3px color-mix(in srgb, var(--neon-c1) 40%, transparent));
  }
  :host([data-neon-light]) .neon-halo-error .neon-halo-icon {
    filter: drop-shadow(0 0 0.6px color-mix(in srgb, var(--neon-error-color, #ff2d6b) 40%, #000))
      drop-shadow(0 0 1px color-mix(in srgb, var(--neon-error-color, #ff2d6b) 40%, #000))
      drop-shadow(0 0 3px color-mix(in srgb, var(--neon-error-color, #ff2d6b) 40%, transparent));
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
 * (El tamaño lo mantiene al día `RingSizeController`, en `ring-size.ts`,
 * con `ResizeObserver` + una medida tras cada renderizado — nada corre en
 * reposo.)
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
  /* El SVG del aro es hijo absoluto de \`ha-card\`, que lo recorta con su
     \`overflow\` en la caja interior: un borde del tema (en claro, el filo
     blanco del cristal) quedaba a la vista por fuera del aro y el aro no
     quedaba a ras de la tarjeta. Con \`overflow: clip\` y
     \`overflow-clip-margin\` igual al ancho del borde el recorte llega al
     borde exterior, y el SVG se sube esa misma distancia para pintarse en la
     caja exterior: el aro tapa el borde. El ancho es el que HA usa en
     \`ha-card\` (\`--ha-card-border-width\`, 1 px por defecto). */
  @supports (overflow-clip-margin: 1px) {
    .neon-ring-host {
      overflow: clip;
      overflow-clip-margin: var(--ha-card-border-width, 1px);
    }
    .neon-ring-host .neon-ring-svg {
      top: calc(-1 * var(--ha-card-border-width, 1px));
      left: calc(-1 * var(--ha-card-border-width, 1px));
    }
  }
  /* Sin \`overflow-clip-margin\` (Safari) el aro no puede salir de la caja
     interior; para que el borde del tema no quede a la vista por fuera, con
     el halo activo se hace transparente y el fondo se recorta a esa caja. Al
     apagar, el borde vuelve cuando el trazo ya se ha retirado (900 ms). Se
     repite el \`transform\` de las tarjetas porque \`transition\` no se puede
     ampliar. */
  @supports not (overflow-clip-margin: 1px) {
    .neon-ring-host {
      transition: transform 150ms ease, border-color 0s linear 900ms;
    }
    .neon-ring-host.neon-halo-active {
      border-color: transparent;
      background-clip: padding-box;
      transition: transform 150ms ease, border-color 0s;
    }
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
    /* En reposo el trazo queda con su extremo justo donde empieza el trazo
       visible (esquina inferior); con escalado de pantalla alto (2x) el
       redondeo deja ahí unos píxeles sueltos, que el resplandor hace
       visibles. Por eso se oculta del todo: opacity pasa a 0 cuando acaba de
       retirarse (retardo de 900 ms = lo que dura el trazo) y a 1 al instante
       al encender. */
    opacity: 0;
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--neon-c2) 65%, transparent));
    transition:
      stroke-dashoffset 900ms ease-in-out,
      opacity 0s linear 900ms;
  }
  .neon-ring-host.neon-halo-active .neon-ring-path {
    stroke-dashoffset: 0;
    opacity: 1;
    transition:
      stroke-dashoffset 900ms ease-in-out,
      opacity 0s;
  }
`;

/** Solape, en px de arco, con que cada mitad del aro rebasa los dos puntos de
    unión. Con las mitades justo a tope, el antialiasing de los dos extremos
    deja una rendija por la que asoma lo que hay debajo. */
const JOIN_OVERLAP = 1.5;

/**
 * Calcula los dos trazados (`d`) de las mitades del aro para un
 * rectángulo redondeado de `width`×`height` con radio `radius`,
 * separado `inset` px del borde real de la tarjeta (la mitad del
 * grosor del trazo, para que el aro quede centrado sobre el borde).
 * Las mitades se encuentran en el punto medio (45°) de las esquinas
 * superior-izquierda e inferior-derecha, y cada una rebasa ese punto
 * `JOIN_OVERLAP` px sobre el arco para que no quede rendija; como las dos
 * llevan el mismo degradado, el solape no se distingue.
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
  // Ángulo de solape (rad), limitado a medio cuarto de círculo; sin radio no hay arco.
  const d = r >= 1 ? Math.min(JOIN_OVERLAP / r, Math.PI / 4) : 0;
  // Punto del arco de la esquina de centro (cx, cy) al ángulo `a` (rad, y hacia abajo).
  const pt = (cx: number, cy: number, a: number): string => `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
  const tl = (a: number): string => pt(x0 + r, y0 + r, a);
  const br = (a: number): string => pt(x1 - r, y1 - r, a);

  // Mitad "superior-derecha": desde un poco antes del punto medio de la
  // esquina sup-izq, termina el arco → borde superior → esquina sup-derecha
  // (completa) → borde derecho → arco inferior-derecho hasta un poco más
  // allá de su punto medio.
  const top = [
    `M ${tl((5 * Math.PI) / 4 - d)}`,
    `A ${r} ${r} 0 0 1 ${x0 + r} ${y0}`,
    `L ${x1 - r} ${y0}`,
    `A ${r} ${r} 0 0 1 ${x1} ${y0 + r}`,
    `L ${x1} ${y1 - r}`,
    `A ${r} ${r} 0 0 1 ${br(Math.PI / 4 + d)}`,
  ].join(' ');

  // Mitad "inferior-izquierda": sentido contrario, desde un poco después del
  // mismo punto medio → borde izquierdo → esquina inf-izq (completa) →
  // borde inferior → arco inferior-derecho hasta un poco antes de su punto
  // medio.
  const bottom = [
    `M ${tl((5 * Math.PI) / 4 + d)}`,
    `A ${r} ${r} 0 0 0 ${x0} ${y0 + r}`,
    `L ${x0} ${y1 - r}`,
    `A ${r} ${r} 0 0 0 ${x0 + r} ${y1}`,
    `L ${x1 - r} ${y1}`,
    `A ${r} ${r} 0 0 0 ${br(Math.PI / 4 - d)}`,
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

/**
 * Retardo (ms) entre encender el halo y mostrar una vista dentro de la
 * tarjeta (confirmación, elección de modo, teclado…).
 *
 * El aro se dibuja con una transición CSS (`stroke-dashoffset`) y WebKit
 * (iOS, la app de HA) no la arranca si en el MISMO fotograma se inserta
 * además una capa nueva: el halo aparecía ya dibujado. Encendiendo primero
 * el halo y mostrando la vista un instante después, la transición empieza
 * limpia y el aro se dibuja mientras la vista aparece.
 */
export const VIEW_REVEAL_MS = 120;
