import type { ActionConfig } from '../../ha/types';
import type { NeonPaletteConfig } from '../../shared';

/**
 * Nivel de la lectura. `normal` = umbrales desactivados (sin valoración);
 * `low` / `ok` / `high` solo existen con los umbrales activados.
 */
export type SensorLevel = 'normal' | 'low' | 'ok' | 'high' | 'unavailable';

/** Niveles que tienen color propio configurable en los umbrales. */
export type ThresholdLevel = 'low' | 'ok' | 'high';

/**
 * Efecto de color de la tarjeta (el gráfico está siempre visible):
 * - `normal`: sin efecto de desplazamiento, color del tema de HA.
 * - `halo`: halo de tres colores (paleta como en el resto de tarjetas),
 *   gráfico en tres colores con efecto de desplazamiento.
 * - `single`: un único color elegido, con efecto de desplazamiento.
 */
export type NeonEffect = 'normal' | 'halo' | 'single';

/**
 * Tamaño de la tarjeta (mismas claves que la Thermostat Card):
 * - `compact`: el más pequeño, SIN gráfico.
 * - `normal`: tamaño mediano, con gráfico.
 * - `large`: ancho máximo (12 columnas), con gráfico.
 */
export type SensorSize = 'compact' | 'normal' | 'large';

export type ThresholdColors = Partial<Record<ThresholdLevel, string>>;

/** Nombre propio de cada nivel (la etiqueta que se muestra bajo el valor). */
export type ThresholdNames = Partial<Record<ThresholdLevel, string>>;

export interface NeonSensorCardConfig extends NeonPaletteConfig {
  type?: string;
  /** Solo `sensor.*` o `binary_sensor.*`; cualquier otro dominio se rechaza. */
  entity?: string;
  name?: string;
  /** Texto bajo el nombre. Si falta o está en blanco: «Sensor» / «Sensor binario». */
  subtitle?: string;
  /** `false` oculta el subtítulo por completo (por defecto se muestra). */
  show_subtitle?: boolean;
  icon?: string;
  /** Decimales del valor. En el tamaño pequeño se ignora: siempre 1 (xx.x). */
  decimals?: number;
  /** Tamaño de la tarjeta. Por defecto `normal`. */
  size?: SensorSize;
  /** Horas de histórico que cubre el gráfico. */
  graph_hours?: number;
  /** Efecto de color. Por defecto `halo`. */
  neon_effect?: NeonEffect;
  /** Color del efecto `single`. */
  neon_color?: string;
  /** Activa la valoración Bajo / Correcto / Alto. Por defecto desactivado. */
  thresholds_enabled?: boolean;
  /** Numérico: por debajo de este valor la lectura es `low`. */
  threshold_low?: number;
  /** Numérico: por encima de este valor la lectura es `high`. */
  threshold_high?: number;
  /** Un color por nivel; los no indicados usan su valor por defecto. */
  threshold_colors?: ThresholdColors;
  /** Un nombre por nivel para la etiqueta de estado; los no indicados (o
      vacíos) usan el texto por defecto del idioma. */
  threshold_names?: ThresholdNames;
  /** Solo `binary_sensor`: estado que se considera `high` (alerta). */
  alert_state?: 'on' | 'off';
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  /**
   * Escape hatch deliberado (mismo motivo que en `cards/button/types.ts`):
   * `_configChanged(key, value)` del editor escribe con clave dinámica y
   * sin este índice TypeScript rechaza la asignación (TS7053).
   */
  [key: string]: unknown;
}
