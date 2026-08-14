import type { ActionConfig } from '../../ha/types';
import type { InfoOption } from '../../core';

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
  /** Todas las InfoOption de src/core son válidas aquí, incluida
      'none' (a diferencia de Button: aquí no hay un 'custom' que ya
      cubra ese hueco — 'none' es el valor real de "no mostrar esta
      línea"). El editor ofrece las 5 sin filtrar (INFO_OPTIONS.map). */
  primary_info?: InfoOption;
  secondary_info?: InfoOption;
  card_orientation?: 'left' | 'right';
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  [key: string]: unknown;
}
