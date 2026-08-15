/**
 * Claves de traducción de contenido genuinamente compartido entre
 * tarjetas — no cualquier coincidencia textual, solo cuando es el
 * mismo widget/concepto reutilizado con el mismo texto fijo:
 * - Los presets de paleta neón y su opción "personalizado".
 * - Los 3 stops de color del selector de paleta en modo personalizado
 *   (parte del mismo bloque que los presets).
 * - La sección de acciones (tap/hold/double_tap) — mismo
 *   `hui-action-editor`, mismas 3 acciones, en cualquier tarjeta con
 *   acciones configurables (ya comparten tipo en `ha/types.ts`).
 *
 * Lo que NO entra aquí: coincidencias incidentales de texto entre
 * tarjetas (p. ej. que ambas llamen "Configuración Principal" a su
 * primera sección) — eso se queda en el diccionario propio de cada
 * tarjeta, porque no es el mismo concepto reutilizado, solo la misma
 * elección de palabras por casualidad.
 */
export interface SharedTranslations {
  palette_emerald: string;
  palette_cyberpunk: string;
  palette_electric: string;
  palette_sunset: string;
  palette_toxic: string;
  palette_custom: string;
  color_start: string;
  color_middle: string;
  color_end: string;
  section_actions: string;
  action_tap: string;
  action_hold: string;
  action_double_tap: string;
}
