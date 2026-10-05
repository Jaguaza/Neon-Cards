import { css } from 'lit';

/**
 * Estilos del selector de modo (las tres vistas) y del footer de
 * sensores — extraído de `neon-thermostat-card.styles.ts` (acuerdo
 * nº7). Se compone junto al resto en `static styles` del componente.
 */
export const THERMOSTAT_MODE_FOOTER_STYLES = css`
  /* ---- Selector único de modo (las tres formas) ---- */
  .mode-selector-wrap {
    position: relative;
  }

  .mode-selector-display {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 26px;
    padding: 0 14px;
    /* Mismo criterio que .target-pill: heredado del tema, sin nada
       propio (ver comentario ahí — --ha-card-border-radius, no
       --control-border-radius; color-mix sobre --primary-text-color,
       no --rgb-primary-text-color). */
    border-radius: var(--ha-card-border-radius, 12px);
    background: color-mix(in srgb, var(--primary-text-color, #fff) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--primary-text-color, #fff) 14%, transparent);
    color: var(--primary-text-color);
    font-size: 13px;
  }

  /* Igualar la altura al de la píldora de temperatura (18px de los
     botones −/+ en normal, ver .target-pill--normal .target-pill-btn) —
     antes se quedaba en los 26px de la vista grande en todas las
     vistas, más alta de lo necesario y sumando altura de más a la
     tarjeta normal (bug reportado: normal no debería ser más alta que
     grande). La grande no se toca (26px sigue a juego con sus botones
     de 26px). */
  ha-card[data-size='normal'] .mode-selector-display {
    height: 20px;
  }

  /* En compacta, a juego con la píldora de temperatura (botones de
     16px) — antes se quedaba en los 26px de la vista grande y quedaba
     mucho más alta que su pareja. También se encogen icono, texto y
     paddings para que la proporción acompañe. */
  ha-card[data-size='compact'] .mode-selector-display {
    height: 16px;
    padding: 0 8px;
    gap: 6px;
    font-size: 11px;
  }

  ha-card[data-size='compact'] .mode-selector-display ha-icon,
  ha-card[data-size='compact'] .mode-selector-display .chevron {
    --mdc-icon-size: 12px;
  }

  .mode-selector-display ha-icon {
    --mdc-icon-size: 16px;
    color: var(--current-color, var(--state-icon-color));
  }

  .mode-selector-display .chevron {
    margin-left: auto;
    --mdc-icon-size: 16px;
    color: var(--secondary-text-color);
  }

  .mode-selector-native {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    border: none;
  }

  /* ---- Fila de selectores (vista grande con preset y/o ventilador).
     Con una sola píldora no existe esta fila: el selector de modo va
     directo en la tarjeta, igual que en las demás vistas. ---- */
  .mode-selector-row {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .mode-selector-row .mode-selector-wrap {
    flex: 1 1 0;
    min-width: 0;
  }

  .mode-selector-row .mode-selector-display {
    min-width: 0;
    padding: 0 10px;
    gap: 6px;
    overflow: hidden;
  }

  .mode-selector-row .mode-selector-display span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Con tres píldoras no cabe el chevron: el texto manda. */
  .mode-selector-row--3 .chevron {
    display: none;
  }

  /* ---- Footer de sensores: misma cuadrícula de columnas iguales +
     divisor vertical que Button Card, tope MAX_FOOTER_SENSORS. ---- */
  .footer {
    display: grid;
    align-items: center;
    width: 100%;
    min-width: 0;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  /* Menos aire encima del footer en la vista normal — otro sitio donde
     recortar altura (bug reportado: normal no debería quedar más alta
     que grande). La grande no se toca. */
  ha-card[data-size='normal'] .footer {
    padding-top: 4px;
  }

  /* Item estirado a toda la celda de la cuadrícula (no solo al ancho de
     su contenido) y centrado por dentro con flex: así el divisor
     (border-left) cae siempre en el borde REAL de la columna, sin
     depender de cuánto ocupe el icono+texto de cada sensor — bug
     reportado dos veces ("los sensores no están centrados"): la versión
     anterior centraba la caja del item dentro de la celda, pero el
     borde/pseudo-elemento del divisor se movía con esa caja en vez de
     quedarse fijo en el límite de columna. */
  .footer-item {
    display: flex;
    align-items: center;
    justify-content: center;
    justify-self: stretch;
    gap: 4px;
    min-width: 0;
    padding: 0 8px;
  }

  .footer-item--divided {
    border-left: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
  }

  /* Con 1 solo sensor no hay "huecos" que repartir — a la izquierda en
     vez de centrado en toda la tarjeta (mismo criterio que Button). */
  .footer.footer-single .footer-item {
    justify-content: flex-start;
    padding-left: 0;
  }

  .footer-item ha-icon {
    --mdc-icon-size: 14px;
  }
`;
