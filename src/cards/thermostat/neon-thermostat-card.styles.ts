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

  /* ---- Dial arrastrable (vista grande): un único arco continuo con
     halo transparente→color→transparente (ver DIAL_START_ANGLE/
     DIAL_END_ANGLE), pegado a la píldora de abajo, sirve también de
     control de consigna. ---- */
  .dial-wrap {
    /* El arco (barrido de 180°, diámetro horizontal) dibuja solo en la
       mitad superior de la caja cuadrada del viewBox — se recorta la
       altura del contenedor a esa franja real para que no "flote" con
       hueco antes de la píldora (ver comentario de DIAL_START_ANGLE/
       DIAL_END_ANGLE). El <svg> cuadrado se posiciona absoluto por
       encima, desbordando sin reservar espacio. Alto ligeramente mayor
       que el estrictamente necesario para el trazo visible: dentro cabe
       también la zona de toque ampliada del punto (.dial-hit-dot, más
       grande a petición — "difícil de seleccionar"), sin que se corte
       ni se solape con la píldora de abajo. */
    position: relative;
    width: 150px;
    height: 88px;
    flex-shrink: 0;
  }

  .dial-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 150px;
    height: 150px;
    /* El cuadrado del <svg> se desborda por debajo del recorte visual
       de .dial-wrap (arriba) para no distorsionar el círculo — sin
       esto, esa franja invisible seguía capturando el toque cuando el
       usuario pulsaba el "+" de la píldora justo debajo (bug
       reportado: el "+" a veces saltaba a 35°). El arco/punto
       reactivan la captura de puntero explícitamente más abajo. */
    touch-action: none;
    pointer-events: none;
    overflow: visible;
  }

  /* Siempre a brillo pleno — NO se atenúa según isClimateRunning. (Se
     probó una variante atenuada/encendida ligada a eso y se descartó
     explícitamente: "debe quedar siempre incrementado, como estaba
     antes".) */
  .dial-arc {
    fill: none;
    stroke-width: 3.5;
    stroke-linecap: round;
    /* Puramente visual — la captura de puntero vive en .dial-hit /
       .dial-hit-dot (zona más ancha, ver más abajo), no aquí. */
    pointer-events: none;
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--current-color, transparent) 75%, transparent));
  }

  .dial-dot {
    fill: var(--current-color, var(--state-icon-color));
    stroke: var(--card-background-color, #1c1c1c);
    stroke-width: 1.5;
    pointer-events: none;
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--current-color, transparent) 90%, transparent));
  }

  /* Zonas de toque invisibles, bastante más anchas que el trazo/punto
     visibles (que se quedan finos a propósito, petición explícita) —
     el control era muy difícil de acertar con el dedo tal cual se veía.
     Comparten los mismos manejadores de puntero del <svg> (burbujeo). */
  .dial-hit {
    fill: none;
    stroke: transparent;
    stroke-width: 34;
    /* Extremo recto (no redondeado): con extremo redondeado, la zona de
       toque se alargaría más allá del final geométrico del arco (justo
       hacia abajo en los dos extremos, donde el arco es tangente
       vertical) y volvería a invadir la píldora de abajo — el mismo bug
       de toques fantasma que ya se corrigió una vez. */
    stroke-linecap: butt;
    pointer-events: stroke;
    cursor: pointer;
  }

  .dial-hit-dot {
    fill: transparent;
    pointer-events: all;
    cursor: pointer;
  }

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

  /* ---- Indicador circular (vistas normal / compacta): mismo arco de
     180° que el dial de la vista grande. Arrastrable en "normal" (no en
     "compacta", sin espacio para acertar con el dedo). ---- */
  .ring-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ring-size, 176px);
    height: var(--ring-size, 176px);
    margin: 0 auto;
    /* Redundante con .ring-svg (que ya lo lleva) pero puesto también
       aquí por si acaso: algún navegador aplica el touch-action de un
       ancestro antes de que el gesto llegue al <svg> hijo. */
    touch-action: none;
  }

  /* El arco (semicírculo) y el texto de temperatura solo ocupan la
     mitad superior de este cuadrado — la mitad inferior queda vacía
     por diseño. En vez de tirar de margin-bottom negativo para
     recuperar ese hueco (lo que hacía que, al fijar el editor de
     Lovelace una altura menor, el contenido se montara unos elementos
     sobre otros y se saliera de la tarjeta), se recorta la ALTURA real
     del contenedor a lo que de verdad se dibuja y se saca el <svg>
     cuadrado del flujo con position:absolute — así desborda sin
     reservar espacio y sin solaparse con nada. */
  ha-card[data-size='normal'] .ring-wrap {
    height: 108px;
  }

  ha-card[data-size='normal'] .ring-svg {
    height: var(--ring-size, 176px);
  }

  /* Con el contenedor recortado, el texto ya no puede centrarse con
     flex (quedaría en el centro de los 108px, no en el del arco): se
     ancla a la altura real del centro del semicírculo. */
  ha-card[data-size='normal'] .ring-center {
    position: absolute;
    top: 88px;
    left: 0;
    right: 0;
    transform: translateY(-50%);
  }

  .ring-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    /* Solo importa de verdad en "normal" (arrastrable) — en "compacta"
       no hay handlers de puntero puestos, así que esto no molesta. */
    touch-action: none;
    /* Igual que en el dial de la vista grande: el cuadrado del <svg>
       no captura el toque él solo — solo .ring-hit/.ring-hit-dot (zona
       ampliada, invisible) lo reactivan explícitamente más abajo. */
    pointer-events: none;
  }

  /* Siempre a brillo pleno — igual que el dial de la vista grande, ver
     el comentario junto a .dial-arc. */
  .ring-arc {
    fill: none;
    stroke-width: 3.5;
    stroke-linecap: round;
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--current-color, transparent) 75%, transparent));
  }

  .ring-dot {
    fill: var(--current-color, var(--state-icon-color));
    stroke: var(--card-background-color, #1c1c1c);
    stroke-width: 1.5;
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--current-color, transparent) 90%, transparent));
  }

  /* Zona de toque invisible en "normal" (arrastrable) — mismo motivo y
     mismo criterio que .dial-hit/.dial-hit-dot: el trazo/punto visibles
     se quedan finos a propósito, esto es lo que realmente se puede
     agarrar con el dedo. */
  .ring-hit {
    fill: none;
    stroke: transparent;
    stroke-width: 30;
    stroke-linecap: butt;
    pointer-events: stroke;
    cursor: pointer;
  }

  .ring-hit-dot {
    fill: transparent;
    pointer-events: all;
    cursor: pointer;
  }

  /* Puramente decorativo — nunca debe interceptar el toque. Sin
     pointer-events:none aquí, al ser hijo flex de .ring-wrap con
     z-index, el navegador lo pinta POR ENCIMA del <svg> absoluto (una
     rareza de flexbox: un z-index en un hijo flex crea su propio
     contexto de apilamiento aunque position sea "static", cosa que NO
     pasaría fuera de un contenedor flex) — posible causa de que el
     arrastre no respondiera en la vista normal (el dial de la vista
     grande no tiene este problema porque ahí la temperatura actual va
     fuera del propio dial, no superpuesta). */
  .ring-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    pointer-events: none;
  }

  .ring-center .current-temp {
    font-size: 26px;
    font-weight: 400;
    color: var(--current-color, var(--primary-text-color));
    line-height: 1;
  }

  .ring-center .current-temp .unit {
    font-size: 14px;
    vertical-align: super;
  }

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
