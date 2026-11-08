import { css } from 'lit';

/**
 * Estilos de la tarjeta (tamaño grande): carcasa, cabecera de texto y
 * divisor. El icono, el pie y las vistas flotantes tienen su propia hoja.
 */
export const NEON_LIGHT_CARD_STYLES = css`
  :host {
    display: block;
    /* ha-card usa height:100%, que solo funciona si :host tiene una altura
       explícita; sin esto puede renderizar más alta de lo que Home
       Assistant le reservó y pisar a la tarjeta de debajo. */
    height: 100%;
  }
  ha-card {
    box-sizing: border-box;
    position: relative;
    container-type: inline-size;
    padding: 12px 20px;
    height: auto;
    max-height: 100%;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    overflow: hidden;
    transition: transform 150ms ease;
  }
  /* El pie y las vistas recogen sus propios gestos: arrastrar una barra no
     debe encoger la tarjeta, que es lo que haría :active en el ancestro. */
  ha-card:active:not(:has(.footer:active, .view:active)) {
    transform: scale(0.98);
  }
  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  /* Con una vista abierta el contenido conserva su hueco (la tarjeta no
     cambia de alto), solo se oculta. */
  .content--hidden {
    visibility: hidden;
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
    margin-top: 6px;
    background: var(--divider-color, rgba(255, 255, 255, 0.12));
  }
`;
