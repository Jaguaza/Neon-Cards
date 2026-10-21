import { css } from 'lit';

/**
 * Estilos por tamaño de la Lock card (mediana, compacta y sus variantes
 * estrechas). Van DESPUÉS de `NEON_LOCK_CARD_STYLES` en `static styles`:
 * el orden importa porque comparten especificidad con las reglas base.
 */
export const NEON_LOCK_SIZE_STYLES = css`
  /* ───────── Tamaño mediano (.size-medium) ─────────
     Sin subtítulo: el estado va bajo el nombre y los tres puntos quedan en
     la esquina. Todo cuelga de .size-medium: la tarjeta grande no cambia. */
  .size-medium {
    container-type: inline-size;
  }
  .size-medium .header {
    position: relative;
  }
  /* Los tres puntos van en posición absoluta: el estado, una línea más abajo,
     usa todo el ancho. El nombre deja libre esa esquina. */
  .size-medium .name {
    padding-right: 28px;
  }
  .size-medium .menu {
    position: absolute;
    top: -6px;
    right: -8px;
  }
  .size-medium .status,
  .size-compact .status {
    min-width: 0;
  }
  .size-medium .status-text,
  .size-compact .status-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .size-medium .status-dot,
  .size-compact .status-dot {
    flex: none;
  }
  /* El pie va siempre en una sola fila (sin saltos ni rayas sueltas). */
  .size-medium .footer {
    flex-wrap: nowrap;
    row-gap: 0;
  }
  .size-medium .item {
    gap: 6px;
    padding: 0 8px;
  }
  .size-medium .item ha-icon {
    --mdc-icon-size: 20px;
  }
  .size-medium .item-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* Tarjeta estrecha (p. ej. 6 columnas en un móvil): menos relleno e iconos
     más pequeños. */
  @container (max-width: 200px) {
    .size-medium .item {
      gap: 4px;
      padding: 0 4px;
    }
    .size-medium .item ha-icon {
      --mdc-icon-size: 18px;
    }
  }
  /* El último acceso lleva el nombre y la fecha en elementos propios (nombre,
     separador, fecha). Ancho: una línea con su rótulo. Estrecho: dos líneas
     (nombre y fecha), sin rótulo, para que no se corte con «…». */
  .size-medium .item-value .who,
  .size-medium .item-value .when {
    white-space: nowrap;
  }
  @container (max-width: 300px) {
    .size-medium .item-label {
      display: none;
    }
    .size-medium .item-value .who,
    .size-medium .item-value .when {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 12px;
      line-height: 15px;
    }
    .size-medium .item-value .sep {
      display: none;
    }
  }
  /* Tarjeta muy estrecha (~180 px): con el último acceso, sin iconos para que
     quepan los textos. */
  @container (max-width: 156px) {
    .size-medium .footer:has(> [data-type='last_user']) .item ha-icon {
      display: none;
    }
  }

  /* ───────── Vista «¿Abrir?» / «¿Qué quieres hacer?» ─────────
     Mientras está abierta, la vista ocupa el mismo sitio que el contenido
     (en la misma celda de una rejilla) en vez de flotar encima: la tarjeta
     mide lo mayor de las dos y, si los botones no caben, crece en lugar de
     cortarlos con el max-height / overflow del ha-card. */
  .confirming {
    display: grid;
    /* La columna mide el ancho de la tarjeta, no el del contenido (si no, el
       contenido sin hueco la ensancharía y los botones se saldrían). */
    grid-template-columns: minmax(0, 1fr);
    max-height: none;
    container-type: inline-size;
  }
  .confirming .content,
  .confirming .confirm {
    grid-area: 1 / 1;
    min-width: 0;
  }
  .confirming .confirm {
    position: relative;
    inset: auto;
    padding: 4px;
  }
  /* Tarjeta estrecha (p. ej. 6 columnas en un móvil): título de una línea y
     botones compactos en una sola fila. */
  @container (max-width: 260px) {
    .confirming .confirm {
      padding: 4px 0;
      gap: 4px 8px;
    }
    .confirming .confirm-title {
      font-size: 16px;
      line-height: 20px;
    }
    .confirming .confirm-text {
      flex-basis: 100%;
    }
    /* Si ni así caben en una fila (~180 px), bajan a la siguiente: la
       tarjeta crece, no se corta. */
    .confirming .confirm-actions {
      flex: 1 1 100%;
      gap: 4px;
    }
    .confirming .confirm--multi .confirm-btn {
      padding: 0 6px;
      font-size: 12px;
    }
    .confirming .confirm--multi .confirm-btn.cancel {
      width: 26px;
      padding: 0;
    }
  }

  /* ───────── Tamaño compacto (.size-compact) ─────────
     Solo icono, nombre y estado, en columna (icono arriba; debajo, el nombre
     y el estado), con los tres puntos en la esquina superior derecha. Sin
     pie. Al pulsar, la confirmación no lleva texto: botones redondos con
     iconos de candado. */
  .size-compact {
    container-type: inline-size;
    padding: 12px;
  }
  .size-compact .header {
    position: relative;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .size-compact .header > .text {
    align-self: stretch;
  }
  /* Los tres puntos, en posición absoluta como en la mediana: no ocupan sitio
     en la columna y el nombre y el estado usan todo el ancho. */
  .size-compact .menu {
    position: absolute;
    top: -6px;
    right: -8px;
  }
  .size-compact .name {
    font-size: 15px;
    line-height: 18px;
  }
  /* Las órdenes primero y, en último lugar, la ✕: en tarjetas estrechas
     caben dos botones por fila y la ✕ baja sola a una segunda fila centrada
     (así la tarjeta no crece). */
  .size-compact.confirming .confirm {
    justify-content: center;
    padding: 0;
  }
  .size-compact .confirm-actions {
    flex: 0 1 auto;
    justify-content: center;
    gap: 6px;
  }
  .size-compact .confirm-btn {
    min-width: 0;
    width: 34px;
    height: 34px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
  .size-compact .confirm-btn.cancel {
    order: 1;
  }
  .size-compact .confirm-btn ha-icon {
    --mdc-icon-size: 20px;
  }

  /* ───────── Tarjetas muy estrechas ─────────
     Un hueco de la rejilla puede medir poco (p. ej. en un portátil con la
     pantalla escalada al 150 % una sección son ~290 px y 6 columnas ~140 px).
     Las consultas son sobre el ancho de la propia tarjeta. */

  /* Mediana estrecha: la cabecera se apila como en la compacta (icono arriba;
     debajo, el nombre y el estado a todo el ancho), porque al lado del icono
     al nombre solo le quedan unos píxeles. */
  @container (max-width: 150px) {
    .size-medium .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }
    .size-medium .header > .text {
      align-self: stretch;
    }
    .size-medium .name {
      padding-right: 0;
    }
  }
  /* Mediana muy estrecha: los datos del pie, uno debajo de otro con una línea
     entre ellos (en una sola fila ya no caben ni sin iconos). */
  @container (max-width: 120px) {
    .size-medium .footer {
      flex-direction: column;
      align-items: stretch;
      row-gap: 6px;
    }
    .size-medium .item {
      flex: none;
      padding: 0;
      justify-content: center;
    }
    .size-medium .item-text {
      text-align: center;
    }
    .size-medium .item + .item {
      border-left: 0;
      border-top: 1px solid color-mix(in srgb, var(--primary-text-color) 20%, transparent);
      padding-top: 6px;
    }
  }
  /* Compacta minúscula (~3 columnas en ese mismo portátil, ~65 px): menos
     relleno, icono y tipografía más pequeños, nombre en dos líneas como
     mucho y los tres puntos en la esquina sin pisar el icono. */
  @container (max-width: 52px) {
    .size-compact .content {
      margin: -4px;
    }
    .size-compact .header {
      gap: 4px;
    }
    .size-compact .header .lock-icon {
      width: 30px;
      height: 30px;
    }
    .size-compact .name {
      font-size: 12px;
      line-height: 14px;
      white-space: normal;
      overflow-wrap: anywhere;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
    .size-compact .status {
      font-size: 10px;
      gap: 3px;
    }
    .size-compact .status-dot {
      width: 6px;
      height: 6px;
    }
    .size-compact .menu {
      width: 24px;
      height: 24px;
      top: -6px;
      right: -6px;
    }
    .size-compact .menu ha-icon {
      --mdc-icon-size: 18px;
    }
  }

  /* Compacta de ~4 columnas en ese portátil (~90 px): botones de la
     confirmación algo más pequeños para que quepan dos por fila (así la
     tarjeta no crece tanto al pulsar). */
  @container (max-width: 70px) {
    .size-compact .confirm-actions {
      gap: 4px;
    }
    .size-compact .confirm-btn {
      width: 30px;
      height: 30px;
    }
  }
`;
