import type { HvacMode } from '../../ha/climate';

export type ThermostatSize = 'large' | 'normal' | 'compact';

export interface FooterSensorConfig {
  entity: string;
  /** Icono override — mismo campo que el footer de sensores de Button. */
  icon?: string;
}

/**
 * Sistema de color por modo HVAC:
 * - `string`: color único para todos los modos.
 * - `{ mode: 'state' }`: colores semánticos automáticos por modo
 *   (equivalente en la práctica a no indicar `color` en absoluto — el
 *   fallback de `_colorFor` ya es el semántico por defecto).
 * - `{ mode: 'custom', heat, cool, ... }`: el usuario define el color de
 *   cada modo desde el editor; los modos no tocados caen al semántico
 *   por defecto de ese modo.
 */
export type ThermostatColorConfig = string | { mode: 'state' } | ({ mode: 'custom' } & Partial<Record<HvacMode, string>>);

export interface NeonThermostatCardConfig {
  type?: string;
  entity?: string;
  /**
   * Segunda entidad `climate` opcional — dos equipos separados (p. ej.
   * calefacción + aire acondicionado) en vez de uno solo que soporte
   * todos los modos. Con `entity_2` sin configurar, la tarjeta se
   * comporta exactamente igual que con una sola entidad.
   */
  entity_2?: string;
  /**
   * Solo para modos que soportan AMBAS entidades a la vez — `1` =
   * primera entidad (`entity`), `2` = segunda (`entity_2`). Sin entrada
   * para un modo, gana la primera entidad por defecto.
   */
  mode_owner?: Partial<Record<HvacMode, 1 | 2>>;
  name?: string;
  /* Sin campo "icon": el icono no es configurable — se deriva siempre
     del modo HVAC actual (HVAC_MODE_ICONS). */
  size?: ThermostatSize;
  color?: ThermostatColorConfig;
  /**
   * Paleta neón del ARO PERIMETRAL de la tarjeta (el borde, no el
   * dial/semicírculo — ese sigue su propio color por modo HVAC de
   * `color` arriba). Mismos campos que Entity/Button
   * (`NeonPaletteConfig` en `src/shared/neon-palette.ts`).
   */
  neon_palette?: string;
  neon_color1?: string;
  neon_color2?: string;
  neon_color3?: string;
  /** `target_temp_step` configurable a mano; si no se indica, se usa el
      de la entidad (con fallback 0.5°C — ver src/ha/climate.ts). */
  step?: number;
  /** Solo `sensor`/`binary_sensor`. Sin footer en la vista compacta. */
  footer?: FooterSensorConfig[];
  /**
   * Escape hatch deliberado, mismo motivo y mismo alcance que en
   * `cards/button/types.ts`: sin este índice, `_configChanged(key:
   * string, value: unknown)` del editor (asignación dinámica
   * `newConfig[key] = value`) no compila (TS7053). Los campos ya
   * declarados arriba siguen totalmente comprobados.
   */
  [key: string]: unknown;
}
