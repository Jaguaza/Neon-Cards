/**
 * Claves de traducción propias del editor visual de Entity (todas las
 * cadenas en español de `neon-card-entity-editor.ts` y las dos que sí
 * son visibles en `neon-card-entity.ts` en tiempo de ejecución, no solo
 * en el editor). Toda `translations/<locale>.ts` de este módulo debe
 * implementar exactamente estas claves — si falta una, TypeScript da
 * error de compilación en vez de dejar un texto en español colándose en
 * medio de otro idioma.
 *
 * Lo que NO está aquí: los nombres de preset de paleta, sus 3 stops de
 * color y la sección de acciones — coinciden con Button de verdad
 * (mismo widget, mismo texto fijo), así que viven en
 * `src/shared/translations` y ambos editores los consumen desde ahí.
 */
export interface EntityTranslations {
  section_main: string;
  entity_label: string;
  name_label: string;
  section_appearance: string;
  palette_label: string;
  primary_info_label: string;
  secondary_info_label: string;
  show_status_dot_label: string;
  orientation_label: string;
  orientation_left: string;
  orientation_right: string;
  /** Mensaje de `throw new Error(...)` en `setConfig()` cuando falta
      `entity`/`entities` — se muestra como tarjeta de error en el
      dashboard si la config es inválida, es visible de verdad. */
  config_error_missing_entity: string;
  /** Sufijo tras el nombre de la entidad cuando no existe en
      `hass.states` — ver `_renderItem()`. */
  entity_unavailable_suffix: string;
}
