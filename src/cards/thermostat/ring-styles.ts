import { css } from 'lit';

/**
 * Estilos del indicador circular (vistas normal / compacta) —
 * extraído de `neon-thermostat-card.styles.ts` (acuerdo nº7). Se
 * compone junto al resto en `static styles` del componente.
 */
export const THERMOSTAT_RING_STYLES = css`
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

`;
