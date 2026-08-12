import { css } from 'lit';

/**
 * Estilos propios de Button Card. Vive en su propio archivo (Acuerdo 7:
 * archivos ≤500 líneas) — `neon-button-card.ts` combina esto con
 * `NEON_HALO_STYLES`/`NEON_RING_SPLIT_STYLES` (de `shared/`) en su
 * `static styles`.
 */
export const NEON_BUTTON_CARD_STYLES = css`
  :host {
    display: block;
    /* ha-card usa height:100%, que solo funciona si :host (el propio
       elemento, tal y como lo mide el grid de HA) tiene una altura
       explícita. Sin esto, en algunos navegadores/WebViews la tarjeta
       puede renderizar más alta de lo que HA le reservó y empujar a
       la siguiente tarjeta del grid hacia arriba, superponiéndose. */
    height: 100%;
  }
  ha-card {
    box-sizing: border-box;
    /* Permite que la fila de sensores consulte el ancho REAL de la
       tarjeta con @container y encoja su propia tipografía en vez de
       truncar el valor — el mismo YAML se ve bien en un dashboard de
       PC ancho y en una tile estrecha de móvil sin números mágicos
       por dispositivo. */
    container-type: inline-size;
    /* Padding vertical ajustado a propósito (ver getCardSize) para que
       el contenido quepa justo en 2 filas de grid sin sensores y 3 con
       sensores — igual que se hizo con el padding de la Entity Card. */
    padding: 4px 20px;
    /* height:auto (antes: height:100% fijo) + max-height:100% como
       techo: la tarjeta se ajusta a su contenido real en vez de
       estirarse siempre a rellenar la celda de grid entera que HA le
       reserva. Con getGridOptions() usando filas fijas (nº entero,
       no 'auto'), calibrar el número EXACTO de filas para cada
       combinación de contenido es forzosamente aproximado — cuando
       el número calibrado se queda un poco por encima de lo que hace
       falta, antes se veía como hueco vacío DENTRO de la tarjeta
       (rellenaba con su propio fondo/borde); ahora simplemente el
       hueco de sobra queda invisible por debajo, fuera de la
       tarjeta. max-height:100% conserva la protección original: la
       tarjeta nunca puede desbordar la celda reservada y empujar a
       la siguiente. */
    height: auto;
    max-height: 100%;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    overflow: hidden;
    /* Mismo fondo que la Entity Card: sin overrides, se apoya en el
       fondo por defecto de ha-card que ya da el tema de HA. El
       color-mix + blur anterior oscurecía la tarjeta en todas sus
       variantes al mezclarse con lo que hay detrás del dashboard. */
    transition: transform 150ms ease;
  }
  ha-card:active {
    transform: scale(0.98);
  }
  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    /* height:auto (antes: height:100%): al ser ha-card ahora
       height:auto también, un height:100% aquí no tenía ya ningún
       hijo que dependiera de esa altura para repartirse espacio
       (nada usa flex-grow/margin-top:auto), así que era una
       propiedad sin efecto real salvo forzar a ha-card a expandirse
       igualmente por el contenido. Se deja explícito en auto por
       claridad. */
    height: auto;
  }
  ha-icon {
    --mdc-icon-size: 40px;
    color: var(--state-icon-color, var(--primary-text-color));
    margin-bottom: 2px;
    transition: color 300ms ease-out, filter 300ms ease-out;
  }
  .icon-wrap {
    position: relative;
    /* Mismo margin-bottom que llevaba el icono suelto antes de
       envolverlo — el wrapper es el que ahora separa del texto. */
    margin-bottom: 2px;
  }
  .icon-wrap ha-icon {
    /* El margin-bottom ya lo lleva .icon-wrap; evita doble espaciado. */
    margin-bottom: 0;
  }
  /* Aviso de entidad unavailable/unknown: mismo lenguaje de color rojo
     que el aro de error de la Entity Card (#ff4444), pero como una X
     superpuesta en la esquina del icono en vez de un aro alrededor del
     pomo — Button no tiene pomo, tiene icono. */
  .unavailable-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    --mdc-icon-size: 16px;
    color: #ff4444;
    background: var(--card-background-color, #1c1c1c);
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(255, 68, 68, 0.7);
    pointer-events: none;
  }
  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    width: 100%;
  }
  .name {
    font-size: 18px;
    line-height: 22px;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .subtitle {
    font-size: 11px;
    line-height: 14px;
    color: var(--secondary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .divider {
    width: 100%;
    height: 1px;
    background: var(--divider-color, rgba(255, 255, 255, 0.12));
    /* Sin top_sensor (variante a 2 filas, ya calibrada justa) NO debe
       llevar margen extra — por eso este margen vive en la clase
       .divider--gap de abajo y no aquí, para no aplicarse siempre. */
  }
  .divider.divider--gap {
    /* Solo la variante top_sensor + agrupados (la única a 3 filas)
       lleva este hueco fijo y pequeño antes del grupo — el resto de
       variantes no lo necesita y les desbordaría su altura ajustada. */
    margin-top: 14px;
  }
  .top-sensor {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    line-height: 14px;
    color: var(--secondary-text-color);
  }
  .sensors {
    /* Cuadrícula de N columnas iguales (una por sensor, calculada al
       renderizar) — cada sensor centrado dentro de su propio hueco,
       no el grupo entero centrado en bloque. Así 2 sensores no quedan
       amontonados en el medio: cada uno tiene su mitad de la fila. */
    display: grid;
    align-items: center;
    width: 100%;
    min-width: 0;
  }
  .sensor {
    display: flex;
    align-items: center;
    justify-self: center;
    gap: 4px;
    min-width: 0;
    font-size: 11px;
    line-height: 14px;
    color: var(--secondary-text-color);
  }
  /* Con 1 solo sensor no hay "huecos" que repartir — se queda a la
     izquierda en vez de centrado en toda la tarjeta. */
  .sensors.sensors-single .sensor {
    justify-self: start;
  }
  .sensor.sensor--divided {
    /* Separador como borde en vez de un elemento aparte — así no
       cuenta como columna extra en la cuadrícula. */
    border-left: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
    padding-left: 12px;
  }
  .sensor ha-icon,
  .top-sensor ha-icon {
    --mdc-icon-size: 15px;
    margin-bottom: 0;
    /* Igual que el icono principal: neutro en reposo, con el color y
       el resplandor de la paleta solo en estado activo (ver regla
       .neon-halo-active más abajo) — mismo comportamiento, no un
       tinte permanente. */
    color: var(--secondary-text-color);
    transition: color 300ms ease-out, filter 300ms ease-out;
    flex: 0 0 auto;
  }
  .neon-halo-active .sensor ha-icon,
  .neon-halo-active .top-sensor ha-icon {
    color: var(--neon-c1);
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--neon-c1) 55%, transparent));
  }
  .sensor .value,
  .top-sensor .value {
    font-size: 10px;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 0 1 auto;
    /* Suelo mínimo solo para evitar un colapso a 0px — con contenido
       auto-dimensionado y el salto de línea de arriba como red de
       seguridad, ya no hace falta un mínimo grande. */
    min-width: 2ch;
  }

  /* Tarjeta MUY estrecha (móvil en listados densos, 2-3 tarjetas por
     fila): reduce icono/tipografía antes de necesitar el salto de
     línea, para que quepan más sensores en una sola fila cuando el
     espacio da un poco de margen. El ancho REAL de la tarjeta
     (container query), no el del viewport. */
  @container (max-width: 220px) {
    .sensor,
    .top-sensor {
      font-size: 10px;
      gap: 3px;
    }
    .sensor ha-icon,
    .top-sensor ha-icon {
      --mdc-icon-size: 13px;
    }
    .sensor .value,
    .top-sensor .value {
      font-size: 9px;
    }
    .sensor.sensor--divided {
      padding-left: 8px;
    }
  }
`;
