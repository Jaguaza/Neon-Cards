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
  status_critical: string;
  status_unavailable: string;
  more_info_label: string;
  section_main: string;
  entity_label: string;
  name_label: string;
  icon_label: string;
  decimals_label: string;
  section_appearance: string;
  show_graph_label: string;
  graph_hours_label: string;
  color_mode_label: string;
  color_mode_single: string;
  color_mode_state: string;
  color_mode_custom_state: string;
  color_normal: string;
  color_warning: string;
  color_critical: string;
  color_unavailable: string;
  section_thresholds: string;
  warning_above_label: string;
  warning_below_label: string;
  critical_above_label: string;
  critical_below_label: string;
  alert_state_label: string;
  alert_state_none: string;
  alert_state_on: string;
  alert_state_off: string;
}
