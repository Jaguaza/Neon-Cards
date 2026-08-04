import type { ActionConfig } from '../../ha/types';

export interface SensorItemConfig {
  entity: string;
  /** Icono propio; si no se indica, se calcula automáticamente. */
  icon?: string;
  /** Decimales a mostrar; si no se indica, usa DEFAULT_SENSOR_DECIMALS. */
  decimals?: number;
}

export interface NeonButtonCardConfig {
  type?: string;
  entity?: string;
  icon?: string;
  name?: string;
  /**
   * 'custom' (por defecto, texto libre en `subtitle`) o cualquier
   * InfoOption de src/core ('name'|'state'|'last-changed'|
   * 'last-updated'|'none') — requiere `entity` para poder calcularse.
   */
  subtitle_type?: string;
  /** Texto libre cuando subtitle_type es 'custom' (o no se indica). */
  subtitle?: string;
  /** Sensor suelto, opcional, encima del divisor (sin agrupar). */
  top_sensor?: SensorItemConfig;
  /** Fila agrupada bajo el divisor, separada por "|", máximo 3. */
  sensors?: SensorItemConfig[];
  neon_palette?: string;
  neon_color1?: string;
  neon_color2?: string;
  neon_color3?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  [key: string]: unknown;
}

export type ValueChangedEvent = CustomEvent<{ value: string }>;
