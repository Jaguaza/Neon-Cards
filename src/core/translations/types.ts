/**
 * Claves de traducción que usa `src/core` directamente (hoy solo
 * `INFO_LABELS` de `info.ts`). Toda `translations/<locale>.ts` de este
 * módulo debe implementar exactamente estas claves — si falta una,
 * TypeScript da error de compilación en vez de dejarlo pasar en
 * silencio (por eso merece la pena el tipo aunque hoy solo haya un
 * idioma poblado).
 */
export interface CoreTranslations {
  info_name: string;
  info_state: string;
  info_last_changed: string;
  info_last_updated: string;
  info_none: string;
}
