import type { HomeAssistant } from '../../ha/types';

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

/**
 * Elementos propios de Home Assistant que usa el editor visual. HA no
 * publica tipos oficiales para ellos, así que se declara aquí solo la
 * superficie que realmente se usa (nada de "any" suelto por el archivo).
 */
export interface HaEntityPickerElement extends HTMLElement {
  hass?: HomeAssistant;
  value?: string;
}

export interface HaTextFieldElement extends HTMLElement {
  value?: string;
}

export interface HuiActionEditorElement extends HTMLElement {
  hass?: HomeAssistant;
  config?: ActionConfig;
  actions?: string[];
  configValue?: string;
}

export type ValueChangedEvent = CustomEvent<{ value: string }>;
