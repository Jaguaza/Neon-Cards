import { css } from 'lit';

/**
 * Estilos propios de la Neón Thermostat Card. Reglas realmente
 * reutilizables (halo genérico, carcasa del editor) NO se copian aquí —
 * viven en `src/shared` y esta tarjeta las compone en `static styles`.
 */
export const NEON_THERMOSTAT_CARD_STYLES = css`
  :host {
    display: block;
  }

  ha-card {
    height: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-sizing: border-box;
    /* En el editor de Lovelace, HA a veces fija a la tarjeta una altura
       menor que la de su contenido (ver comentario de flex-shrink más
       abajo). Con flex-shrink:0 el contenido ya no se comprime, pero
       sin esto se saldría visualmente de la propia tarjeta e invadiría
       la tarjeta vecina (bug reportado con captura, solo en modo
       edición — fuera de él todo cabe siempre). overflow:hidden
       recorta ese sobrante dentro de sus propios bordes redondeados en
       vez de dejarlo escapar; no afecta a nada cuando, como es el caso
       normal, ya todo cabe. */
    overflow: hidden;
  }

  /* En el editor de Lovelace, HA fija a la tarjeta una altura concreta
     que puede ser menor que su contenido. Sin esto, los hijos flex se
     comprimen y el contenido acaba montándose y saliéndose de la
     tarjeta (se ve mal solo en modo edición, bien fuera de él). Con
     flex-shrink:0 mantienen su tamaño natural. */
  ha-card > *:not(.neon-ring-svg) {
    flex-shrink: 0;
  }

  /* Recortes de altura solo en la vista normal — no debería quedar más
     alta que la grande (bug reportado con capturas de las dos lado a
     lado). Menos separación vertical entre secciones y menos aire
     arriba/abajo del todo; la grande no se toca. */
  ha-card[data-size='normal'] {
    padding-top: 12px;
    padding-bottom: 12px;
    gap: 10px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* Cabecera de la vista compacta: en columna — arriba la fila de
     iconos (modo + accesos a cada entidad), debajo el nombre (que solo
     se renderiza si se ha configurado uno). */
  .header--compact {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    width: 100%;
  }

  /* Sin esto, al no estirarse los hijos al ancho del header (por el
     flex-start de arriba), el <span class="name"> con
     white-space:nowrap no tiene contra qué ancho recortar su propio
     texto y crece libre, saliéndose por el borde derecho de la
     tarjeta (bug reportado con captura). */
  .header--compact .name {
    align-self: stretch;
    min-width: 0;
  }

  .header-icons {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* En compacta los accesos vuelven a fila y pierden el margen
     automático que en el resto de vistas los empuja a la derecha —
     aquí van pegados al icono de modo. */
  .header--compact .header-actions {
    flex-direction: row;
    margin-left: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-left: auto;
    flex-shrink: 0;
  }

  /* Solo en vertical en la vista normal — la grande se queda en fila,
     como estaba, petición explícita tras corregirlo por error en las
     dos. ha-card ya lleva data-size, no hace falta JS. */
  ha-card[data-size='normal'] .header-actions {
    flex-direction: column;
  }

  /* Solo en la vista grande sigue siendo horizontal (como estaba) — en
     normal/compacta es en columna (petición explícita). */
  ha-card[data-size='large'] .header-actions {
    flex-direction: row;
  }

  .header-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: none;
    border: none;
    border-radius: 50%;
    color: var(--secondary-text-color);
    cursor: pointer;
  }

  .header-action-btn:hover {
    background: var(--divider-color, rgba(255, 255, 255, 0.08));
  }

  .header-action-btn ha-icon {
    --mdc-icon-size: 18px;
  }

  .icon-halo-wrap {
    /* Envoltorio propio del icono del header — necesario para que
       .neon-halo-active viva en un ANCESTRO del icono sin depender de
       la clase del mismo tipo que lleva ha-card (que se rige por
       isClimateRunning, para el aro perimetral): así el icono se
       enciende solo con seleccionar un modo (petición explícita),
       desacoplado del aro. */
    display: inline-flex;
  }

  .header-icon {
    /* Sin círculo/fondo detrás — icono suelto, mismo tamaño que el
       icono principal de la Button Card. */
    --mdc-icon-size: 40px;
    color: var(--state-icon-color, var(--secondary-text-color));
    flex-shrink: 0;
  }

  /* El icono del header NO se rellena de color al iluminarse (a
     diferencia del resto de la colección) — se pidió expresamente que
     el centro quede blanco y solo brille un contorno alrededor, como
     un rótulo de neón visto de perfil. Mayor especificidad que la
     regla compartida .neon-halo-active .neon-halo-icon (3 clases
     contra 2), así que gana sin necesidad de !important. */
  .icon-halo-wrap.neon-halo-active .header-icon.neon-halo-icon {
    color: var(--primary-text-color);
    filter: drop-shadow(0 0 2px var(--neon-c1)) drop-shadow(0 0 6px var(--neon-c1))
      drop-shadow(0 0 12px color-mix(in srgb, var(--neon-c1) 70%, transparent));
  }

  .header-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .name {
    font-size: 14px;
    font-weight: 600;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hvac-state {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  /* ---- Temperatura grande (vista "large") + dial a la derecha ---- */
  .dial-row {
    /* Antes en los extremos (space-between: todo el hueco se
       concentraba en un único vacío enorme en medio) — ahora el grupo
       se centra con un hueco fijo y razonable entre los dos, y el
       espacio sobrante se reparte a los lados (izquierda/centro/
       derecha, en vez de todo en el centro). */
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 32px;
  }

  .current-temp-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    /* Centrado dentro de la fila (que mide lo que el dial recortado
       ocupa, ~100px) en vez de anclado arriba: sin el "Objetivo X°" ya
       quitado, el número es mucho más corto que el dial y quedaba con
       un hueco grande debajo antes de llegar a la píldora. */
    align-self: center;
    gap: 2px;
    text-align: left;
  }

  .current-temp-big {
    font-size: 64px;
    font-weight: 600;
    line-height: 1;
    color: var(--current-color, var(--primary-text-color));
    transition: color 300ms ease-out;
  }

  .current-temp-big .unit {
    font-size: 26px;
    vertical-align: super;
  }

  .target-label {
    font-size: 13px;
    color: var(--current-color, var(--secondary-text-color));
  }

`;
