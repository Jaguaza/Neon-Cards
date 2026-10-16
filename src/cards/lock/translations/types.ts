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
  last_access: string;
  door_open: string;
  door_closed: string;
  more_info: string;
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
  confirm_title: string;
  confirm_accept: string;
  confirm_cancel: string;
  confirm_choose: string;
  command_lock: string;
  command_unlock: string;
  command_open: string;
  confirm_open_label: string;
  section_footer: string;
  footer_hint: string;
  footer_slot: string;
  footer_none: string;
  footer_door: string;
  footer_battery: string;
  footer_last_user: string;
  door_entity_label: string;
  battery_entity_label: string;
  last_user_entity_label: string;
}
