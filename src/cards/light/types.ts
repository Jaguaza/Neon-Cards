import type { ActionConfig } from '../../ha/types';
import type { InfoOption } from '../../core';

/** Controles que el pie despliega como barra: brillo, temperatura de color y color. */
export type FooterControl = 'brightness' | 'color_temp' | 'color';

/** Iconos del pie: los tres controles y la lista de efectos (que abre una vista flotante). */
export type FooterItem = FooterControl | 'effects';

/** Recuento de un grupo de luces: cuántas de sus luces están encendidas y cuántas tiene. */
export interface GroupCount {
  on: number;
  total: number;
}

export interface NeonLightCardConfig {
  type?: string;
  /** Entidad del dominio `light` (también vale un grupo de luces). */
  entity?: string;
  name?: string;
  /** Icono propio; si no se indica, el de la entidad y, si no, `DEFAULT_ICON`. */
  icon?: string;
  /**
   * `custom` (por defecto, texto libre en `subtitle`), `state` (estado con el
   * brillo y, en un grupo, cuántas luces hay encendidas) o cualquier otra
   * `InfoOption` de `src/core` salvo `none`.
   */
  subtitle_type?: 'custom' | Exclude<InfoOption, 'none'>;
  /** Texto libre cuando `subtitle_type` es `custom` (o no se indica). */
  subtitle?: string;
  neon_palette?: string;
  neon_color1?: string;
  neon_color2?: string;
  neon_color3?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  /** Índice de escritura del editor (`newConfig[key] = value`), igual que en Button. */
  [key: string]: unknown;
}
