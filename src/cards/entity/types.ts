import type { ActionConfig } from '../../ha/types';

export type { ActionConfig } from '../../ha/types';

export interface EntityItemConfig {
  entity: string;
  name?: string;
}

export interface NeonCardEntityConfig {
  entity?: string;
  entities?: EntityItemConfig[];
  name?: string;
  columns?: number;
  neon_palette?: string;
  neon_color1?: string;
  neon_color2?: string;
  neon_color3?: string;
  show_status_dot?: boolean;
  primary_info?: string;
  secondary_info?: string;
  card_orientation?: 'left' | 'right';
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  [key: string]: unknown;
}
