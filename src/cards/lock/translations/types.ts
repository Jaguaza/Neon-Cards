/**
 * Claves de traducción de la Lock Card: texto visible en tiempo de
 * ejecución (un nombre de estado por cada `LockVisualState`) y todas las
 * cadenas del editor visual. Toda `translations/<locale>.ts` de este
 * módulo debe implementar exactamente estas claves — si falta una,
 * TypeScript da error de compilación.
 */
export interface LockTranslations {
  state_locked: string;
  state_unlocked: string;
  state_locking: string;
  state_unlocking: string;
  state_jammed: string;
  state_open: string;
  state_opening: string;
  state_error: string;
  section_main: string;
  entity_label: string;
  name_label: string;
  icon_label: string;
  icon_padlock: string;
  icon_door: string;
  icon_garage_roller: string;
  icon_garage_sliding: string;
  subtitle_label: string;
  subtitle_type_custom: string;
  subtitle_placeholder: string;
  section_halo: string;
  palette_label: string;
}
