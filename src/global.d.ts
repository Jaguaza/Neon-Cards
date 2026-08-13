/**
 * `__DEV__` es una constante global sustituida en tiempo de build por
 * @rollup/plugin-replace (ver rollup.config.mjs) — nunca existe en
 * tiempo de ejecución como variable real. En producción se sustituye
 * por el literal `false`, y terser elimina como código muerto
 * cualquier `if (__DEV__) { ... }`, así que ese código no llega al
 * bundle publicado (acuerdo nº22: modo desarrollo sin coste en
 * producción).
 */
declare const __DEV__: boolean;
