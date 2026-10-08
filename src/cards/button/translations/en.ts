import type { ButtonTranslations } from './types';

export const en: ButtonTranslations = {
  section_main: 'Main configuration',
  entity_label: 'Entity (optional)',
  name_label: 'Name',
  subtitle_label: 'Subtitle',
  subtitle_type_custom: 'Custom',
  subtitle_placeholder: 'Free text',
  subtitle_computed_hint: 'Computed from the entity — requires "Entity" to be set.',
  icon_label: 'Icon (mdi:...)',
  section_halo: 'Halo appearance',
  palette_label: 'Halo palette (active state)',
  section_top_sensor: 'Standalone sensor (optional, above the divider)',
  top_sensor_label: 'Featured sensor',
  sensor_icon_label: 'Icon (empty = automatic)',
  sensor_decimals_label: 'Decimal places',
  section_grouped_sensors: 'Grouped sensors (max. {max}, with divider)',
  remove_sensor_title: 'Remove sensor',
  add_sensor_button: '+ Add sensor',
  max_sensors_hint: 'Maximum of {max} sensors to keep it readable.',
};
