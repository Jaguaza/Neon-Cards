/**
 * Claves de traducción del editor visual de Button (todas las cadenas
 * en español de `neon-button-card-editor.ts`). Toda
 * `translations/<locale>.ts` de este módulo debe implementar
 * exactamente estas claves — si falta una, TypeScript da error de
 * compilación en vez de dejar un texto en español colándose en medio
 * de otro idioma.
 */
export interface ButtonTranslations {
  section_main: string;
  entity_label: string;
  name_label: string;
  subtitle_label: string;
  subtitle_type_custom: string;
  subtitle_placeholder: string;
  subtitle_computed_hint: string;
  icon_label: string;
  section_halo: string;
  palette_label: string;
  section_top_sensor: string;
  top_sensor_label: string;
  sensor_icon_label: string;
  sensor_decimals_label: string;
  section_grouped_sensors: string;
  remove_sensor_title: string;
  add_sensor_button: string;
  max_sensors_hint: string;
}
