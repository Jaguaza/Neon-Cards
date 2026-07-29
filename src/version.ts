/**
 * Fuente única de verdad de la versión de Neón Cards.
 *
 * No se edita a mano: `scripts/release.js` la mantiene sincronizada con la
 * versión de `package.json` en cada release. Cada tarjeta importa esta
 * constante en vez de declarar su propio número de versión — así todo el
 * proyecto sube de versión a la vez (release:patch|minor|major|beta).
 */
export const NEON_CARDS_VERSION = '0.1.0';
