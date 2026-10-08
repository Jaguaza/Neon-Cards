import { css } from 'lit';

/**
 * Estilos de la píldora de consigna (−/valor/+), compartida entre las
 * tres vistas — extraído de `neon-thermostat-card.styles.ts` (acuerdo
 * nº7). Se compone junto al resto en `static styles` del componente.
 */
export const THERMOSTAT_TARGET_PILL_STYLES = css`
  /* ---- Selector de objetivo −/+ (pill, mismo componente en grande y
     normal — sin barra deslizante, corregido tras comparar con el
     mockup real: era una interpretación errónea de un adorno decorativo
     del dossier como si fuera un control). Altura reducida (padding
     vertical mínimo + botones más compactos) tras feedback: quedaba
     demasiado alta/gruesa frente al mockup. ---- */
  .target-pill {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 6px;
    /* Formato heredado íntegramente del tema activo, sin nada propio:
       radio de esquina con --ha-card-border-radius (la variable
       estándar de HA que la gente sí configura en sus temas —
       --control-border-radius, usada en la ronda anterior, no es una
       variable genérica real de HA: solo existen variables por
       componente muy concretas como --control-number-buttons-border-
       radius, nunca se llegaba a leer nada del tema y la píldora se
       quedaba siempre en el 999px de repuesto, redondeada de más en
       temas con esquinas menos curvas). Fondo/borde con color-mix sobre
       --primary-text-color (variable prácticamente garantizada en
       cualquier tema, a diferencia de --rgb-primary-text-color —
       usada en la ronda anterior, exige el formato "R, G, B" separado
       por comas; si el tema no la define así cae al 0,0,0 de repuesto,
       negro puro casi invisible sobre fondo oscuro — eso fue lo que
       hizo "desaparecer" las píldoras). El texto de la consigna SÍ
       sigue coloreado por modo (--current-color) — eso es la identidad
       Neón de la tarjeta, no el "formato gráfico" de la píldora en sí. */
    border-radius: var(--ha-card-border-radius, 12px);
    background: color-mix(in srgb, var(--primary-text-color, #fff) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--primary-text-color, #fff) 14%, transparent);
  }

  .target-pill .target-value {
    flex: 1;
    text-align: center;
    font-weight: 600;
    color: var(--current-color, var(--primary-text-color));
  }

  .target-pill--large {
    padding: 0 8px;
  }

  .target-pill--large .target-value {
    font-size: 18px;
  }

  .target-pill--normal .target-value {
    font-size: 14px;
  }

  /* La variante compacta no existía todavía — la píldora caía en los
     valores por defecto del navegador (sin font-size/tamaño de botón
     propios), demasiado grande para el hueco disponible. */
  .target-pill--compact {
    padding: 0 4px;
  }

  .target-pill--compact .target-value {
    font-size: 12px;
  }

  .target-pill-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--current-color, var(--primary-text-color));
    cursor: pointer;
    flex-shrink: 0;
    /* Necesario para la zona de toque ampliada de abajo (::before,
       position:absolute se posiciona respecto a este). */
    position: relative;
  }

  /* Zona de toque invisible más grande que el icono visible — con el
     botón a 18px (vista normal) no hay margen de error para un dedo
     real; un pixel de diferencia hace que el toque caiga fuera del
     elemento y no pase nada (bug reportado: "funciona con ratón en PC
     pero no en el móvil, el área no coincide con el +/-"). No cambia el
     tamaño visual del botón ni el alto de la píldora — position:absolute
     saca esto del flujo. Mismo patrón que la zona de toque ampliada del
     aro (.dial-hit-dot/.ring-hit-dot). */
  .target-pill-btn::before {
    content: '';
    position: absolute;
    inset: -12px;
  }

  .target-pill-btn ha-icon {
    pointer-events: none;
  }

  .target-pill--large .target-pill-btn {
    width: 26px;
    height: 26px;
  }

  .target-pill--large .target-pill-btn ha-icon {
    --mdc-icon-size: 16px;
  }

  .target-pill--normal .target-pill-btn {
    width: 18px;
    height: 18px;
  }

  .target-pill--normal .target-pill-btn ha-icon {
    --mdc-icon-size: 13px;
  }

  .target-pill--compact .target-pill-btn {
    width: 16px;
    height: 16px;
  }

  .target-pill--compact .target-pill-btn ha-icon {
    --mdc-icon-size: 11px;
  }
`;
