import type { ActionConfig } from '../../ha/types';
import type { NeonPaletteConfig } from '../../shared';

/** Nivel de severidad de la lectura; decide color y texto de estado. */
export type SensorLevel = 'normal' | 'warning' | 'critical' | 'unavailable';

/** `single`: un color (paleta). `state`: color automático por estado.
    `custom_state`: color elegido por el usuario para cada estado. */
export type ColorMode = 'single' | 'state' | 'custom_state';

export type StateColors = Partial<Record<SensorLevel, string>>;

export interface NeonSensorCardConfig extends NeonPaletteConfig {
  type?: string;
  /** Solo `sensor.*` o `binary_sensor.*`; cualquier otro dominio se rechaza. */
  entity?: string;
  name?: string;
  icon?: string;
  decimals?: number;
  /** Gráfico de histórico. Por defecto `true`; `false` = modo simple. */
  show_graph?: boolean;
  /** Horas de histórico que cubre el gráfico. */
  graph_hours?: number;
  color_mode?: ColorMode;
  state_colors?: StateColors;
  /** Umbrales numéricos (solo `sensor`). Crítico gana sobre aviso. */
  warning_above?: number;
  warning_below?: number;
  critical_above?: number;
  critical_below?: number;
  /** Solo `binary_sensor`: estado que se considera crítico. */
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
