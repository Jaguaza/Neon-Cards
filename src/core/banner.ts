/**
 * Banner de versión que cada tarjeta escribe al cargarse (`NEON BUTTON
 * CARD · By <autor> · v1.0.0`).
 *
 * Es un log, así que sigue el acuerdo nº22: solo existe en modo desarrollo
 * (`npm run build:cards:dev`). En producción `__DEV__` vale `false`, terser
 * elimina el cuerpo entero y el bundle publicado no escribe nada en la
 * consola del usuario. Un único punto común evita que cada tarjeta repita
 * el mismo `console.info` (y que unas lo protejan y otras no).
 */
const BANNER_STYLES = [
  'color: white; background: #16241f; font-weight: bold; border-radius: 3px 0 0 3px;',
  'color: white; background: #39e07a; font-weight: bold;',
  'color: #39e07a; background: #2a2a31; font-weight: bold; border-radius: 0 3px 3px 0;',
] as const;

/** @param cardName Nombre visible en mayúsculas, p. ej. `'NEON BUTTON CARD'`. */
export function logCardBanner(cardName: string, author: string, version: string): void {
  if (!__DEV__) return;
  console.info(`%c ${cardName} %c By ${author} %c v${version} `, ...BANNER_STYLES);
}
