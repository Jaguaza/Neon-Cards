/**
 * Claves de traducción de Sensor Card (tarjeta y editor visual). Toda
 * `translations/<locale>.ts` debe implementar exactamente estas claves.
 * Paletas y acciones (tap/hold/double_tap) salen de `SHARED_TRANSLATIONS`.
 */
export interface SensorTranslations {
  invalid_entity: string;
  no_value: string;
  kind_sensor: string;
  kind_binary_sensor: string;
  binary_on: string;
  binary_off: string;
  status_normal: string;
  status_high: string;
  status_low: string;
  status_ok: string;
  status_alert: string;
  status_unavailable: string;
  more_info_label: string;
  section_main: string;
  entity_label: string;
  name_label: string;
  icon_label: string;
  decimals_label: string;
  section_appearance: string;
  graph_hours_label: string;
  effect_label: string;
  effect_normal: string;
  effect_halo: string;
  effect_single: string;
  single_color_label: string;
  section_thresholds: string;
  thresholds_enable_label: string;
  threshold_low_label: string;
  threshold_high_label: string;
  level_low: string;
  level_ok: string;
  level_high: string;
  alert_state_label: string;
  alert_state_none: string;
  alert_state_on: string;
  alert_state_off: string;
}
