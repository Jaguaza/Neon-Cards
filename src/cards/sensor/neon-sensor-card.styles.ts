import { css } from 'lit';

/**
 * Estilos propios de Sensor Card (acuerdo nº7: separados del componente).
 * El tamaño lo da la clave `size` (clase `size-compact|normal|large` en
 * `ha-card`): `compact` es el más pequeño y sin gráfico; `normal` y
 * `large` llevan gráfico. Cada tamaño ocupa un hueco FIJO de la rejilla
 * de HA (ver `SIZE_GRID`), así que el alto del contenido no puede depender
 * del ancho: la cabecera no salta de línea (el nombre se parte en dos
 * líneas como mucho y el subtítulo se abrevia), el valor va arriba y el
 * gráfico rellena el alto que sobra. `overflow: hidden` es la red de
 * seguridad: nada se pinta fuera de la tarjeta. `container-type` permite
 * que el valor escale con el ancho real (`cqi`).
 */
export const NEON_SENSOR_CARD_STYLES = css`
  :host {
    display: block;
    height: 100%;
  }
  ha-card {
    container-type: inline-size;
    box-sizing: border-box;
    height: 100%;
    padding: 12px 14px 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
    transition: border-color 300ms ease-out, box-shadow 300ms ease-out;
  }
  /* Perímetro: lo marcan SOLO los umbrales (--neon-edge, el color de su
     nivel). Sin umbrales activados no se añade nada y queda el borde
     normal del tema, sea cual sea el efecto de color del gráfico. */
  ha-card.has-edge {
    border: 1.5px solid var(--neon-edge);
    box-shadow:
      0 0 6px color-mix(in srgb, var(--neon-edge) 55%, transparent),
      0 0 18px color-mix(in srgb, var(--neon-edge) 22%, transparent),
      inset 0 0 14px color-mix(in srgb, var(--neon-edge) 10%, transparent);
  }

  .header {
    display: flex;
    align-items: center;
    flex: none;
    gap: 10px;
  }
  /* Icono sin círculo: ocupa el tamaño que antes tenía el círculo que lo
     rodeaba. El color y el resplandor los pone la clase neon-halo-icon. */
  .icon {
    flex: none;
    --mdc-icon-size: 40px;
  }
  .texts {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .name {
    /* Como mucho dos líneas (la altura de la cabecera no crece). */
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    overflow-wrap: anywhere;
    line-height: 1.2;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .kind {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.25;
    font-size: 0.85em;
    color: var(--secondary-text-color);
  }
  .menu {
    flex: none;
    border: 0;
    padding: 4px;
    background: none;
    cursor: pointer;
    line-height: 0;
    color: var(--secondary-text-color);
    --mdc-icon-size: 20px;
  }

  /* Valor a la izquierda y gráfico a su derecha, en la MISMA fila: el
     gráfico se encoge (nunca salta de línea) y ocupa todo el alto que queda.
     Así el alto lo da el hueco de la rejilla, no el ancho de la tarjeta. */
  .body {
    display: flex;
    align-items: stretch;
    flex: 1 1 auto;
    min-height: 0;
    gap: 10px;
  }
  .reading {
    flex: 0 1 auto;
    min-width: 0;
    align-self: center;
    display: flex;
    align-items: baseline;
    gap: 2px 6px;
  }
  .value {
    font-size: clamp(1.6em, 11cqi, 2.2em);
    font-weight: 600;
    line-height: 1.1;
    overflow-wrap: anywhere;
    color: var(--primary-text-color);
  }
  .unit {
    font-size: 1.1em;
    color: var(--secondary-text-color);
  }

  .status {
    flex: none;
    line-height: 1.25;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95em;
    overflow-wrap: anywhere;
    color: var(--neon-edge, var(--neon-c1));
  }
  .dot {
    flex: none;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--neon-edge, var(--neon-c1));
    box-shadow: 0 0 6px var(--neon-edge, var(--neon-c1));
  }
  .neon-effect-normal .dot {
    box-shadow: none;
  }

  /* ---- Gráfico: trazo de monitor de constantes vitales ---- */
  .graph {
    position: relative;
    flex: 1 1 0;
    min-width: 40px;
    min-height: 0;
  }
  .graph svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .trace {
    fill: none;
    stroke-width: 3px;
    stroke-linejoin: round;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }
  /* Huella tenue de toda la serie: el trazo "apagado" que el barrido
     vuelve a encender. */
  .trace-base {
    opacity: 0.4;
  }
  /* Efecto "normal": trazo fijo y completo, sin barrido. */
  .graph--static .trace-base {
    opacity: 1;
  }
  /* Resplandor del trazo: copia gruesa y desenfocada con el MISMO
     degradado de tres colores (se desenfoca con el filtro SVG del propio
     gráfico), así el halo lleva los tres colores y no solo el primero. */
  .glow-path {
    fill: none;
    stroke-width: 8px;
    stroke-linejoin: round;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
    opacity: 0.75;
  }
  /* Capa viva: se extiende más allá del gráfico para que el resplandor no
     se recorte con la máscara. La máscara deja ver solo una ventana que
     barre de izquierda a derecha: cabeza nítida, estela larga que se
     apaga detrás y nada por delante, como un monitor. Resplandor y trazo
     viajan juntos con la ventana. */
  .sweep {
    position: absolute;
    inset: -8px;
    -webkit-mask-image: linear-gradient(
      90deg,
      transparent 14%,
      rgba(0, 0, 0, 0.22) 34%,
      #000 49%,
      transparent 50%
    );
    mask-image: linear-gradient(90deg, transparent 14%, rgba(0, 0, 0, 0.22) 34%, #000 49%, transparent 50%);
    -webkit-mask-size: 300% 100%;
    mask-size: 300% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    animation: monitor-sweep 6.5s linear infinite;
  }
  .sweep svg {
    inset: 8px;
    width: calc(100% - 16px);
    height: calc(100% - 16px);
  }
  /* De 75% (cabeza en el borde izquierdo) a -28% (la estela entera ya
     fuera por la derecha): al reiniciar el bucle no hay salto. */
  @keyframes monitor-sweep {
    from {
      -webkit-mask-position: 75% 0;
      mask-position: 75% 0;
    }
    to {
      -webkit-mask-position: -28% 0;
      mask-position: -28% 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .sweep {
      animation: none;
      -webkit-mask-image: none;
      mask-image: none;
    }
  }

  /* ---- Tamaños ---- */
  /* Mediano: cabe en 2 filas de la rejilla (120 px), así que lleva menos
     relleno y menos hueco entre bloques. */
  .size-normal {
    padding: 10px 12px 8px;
    gap: 4px;
  }

  /* Pequeño: el más compacto posible y sin gráfico (no se pinta). Se
     quitan el menú ⋮ y el subtítulo para ganar sitio; tocar la tarjeta
     abre igualmente «más información». Nada se corta: se ajusta. */
  .size-compact {
    padding: 10px 10px 8px;
    gap: 4px;
  }
  .size-compact .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .size-compact .icon {
    --mdc-icon-size: 30px;
  }
  .size-compact .texts {
    flex: none;
    width: 100%;
  }
  .size-compact .name {
    font-size: 0.85em;
    line-height: 1.15;
  }
  .size-compact .kind,
  .size-compact .menu {
    display: none;
  }
  /* Sin gráfico: el valor queda abajo, pegado al pie de la tarjeta. */
  .size-compact .body {
    justify-content: flex-end;
  }
  .size-compact .value {
    font-size: clamp(1.25em, 22cqi, 1.9em);
  }
  .size-compact .status {
    font-size: 0.8em;
    gap: 6px;
  }

  /* Grande: ancho máximo (12 columnas), más aire y gráfico más alto. */
  .size-large {
    padding: 14px 20px 12px;
    gap: 8px;
  }
  .size-large .icon {
    --mdc-icon-size: 52px;
  }
  .size-large .value {
    font-size: clamp(2.2em, 12cqi, 3em);
  }
  .size-large .graph {
    min-width: 80px;
  }
  .size-large .trace {
    stroke-width: 3.5px;
  }

  /* Tarjeta estrecha (p. ej. «mediana» en un dashboard de pocas columnas):
     icono y menú más pequeños para que el nombre quepa en una línea en vez
     de partirse y comerle el alto al gráfico. */
  @container (max-width: 180px) {
    .size-normal .header {
      gap: 8px;
    }
    .size-normal .icon {
      --mdc-icon-size: 32px;
    }
    .size-normal .menu {
      padding: 2px;
      margin-right: -4px;
      --mdc-icon-size: 18px;
    }
  }
`;
