export type ActionType = 'more-info' | 'toggle' | 'navigate' | 'url' | 'call-service' | 'assist' | 'none';

export interface ActionConfig {
  action: ActionType | string;
  [key: string]: unknown;
}

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
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  [key: string]: unknown;
}

export interface GradientColors {
  c1: string;
  c2: string;
  c3: string;
}

export type ValueChangedEvent = CustomEvent<{ value: string }>;
