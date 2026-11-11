import type { ActionConfig } from '../../ha/types';
import type { InfoOption } from '../../core';

/**
 * Tamaños de la tarjeta: `large` («Grande - Mediana», con pie de opciones, la
 * predeterminada, para que las tarjetas ya creadas no cambien) y `compact`
 * («Compacta - Mediana»: solo icono, nombre y subtítulo, sin pie).
 */
export type LightSize = 'large' | 'compact';

/** Controles que el pie despliega como barra: brillo, temperatura de color y color. */
export type FooterControl = 'brightness' | 'color_temp' | 'color';

/**
 * Iconos del pie: los tres controles, los colores favoritos (que ocupan el
 * pie con sus muestras) y la lista de efectos (que abre una vista flotante).
 */
export type FooterItem = FooterControl | 'favorites' | 'effects';

/** Recuento de un grupo de luces: cuántas de sus luces están encendidas y cuántas tiene. */
export interface GroupCount {
  on: number;
  total: number;
}

export interface NeonLightCardConfig {
  type?: string;
  /** Entidad del dominio `light` (también vale un grupo de luces). */
  entity?: string;
  /** Tamaño de la tarjeta; sin él, `large`. */
  size?: LightSize;
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
  /** Hasta 5 colores favoritos en hexadecimal (`#rrggbb`); salen con el icono de favoritos del pie. */
  favorite_colors?: string[];
  /**
   * Opciones que muestra el pie (las que la luz soporte). Sin esta clave, todas;
   * con ella, solo las indicadas, en el orden fijo del pie.
   */
  footer_options?: FooterItem[];
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  /** Índice de escritura del editor (`newConfig[key] = value`), igual que en Button. */
  [key: string]: unknown;
}
