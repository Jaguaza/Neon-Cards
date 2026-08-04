import type { ActionConfig } from '../../ha/types';

export interface SensorItemConfig {
  entity: string;
}

export interface NeonButtonCardConfig {
  type?: string;
  entity?: string;
  icon?: string;
  name?: string;
  subtitle?: string;
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
