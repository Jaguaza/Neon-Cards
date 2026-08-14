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
  /**
   * Escape hatch deliberado, NO relleno de compatibilidad con
   * Lovelace/HA — HA no inyecta nada en `config` más allá de lo que el
   * usuario escribe en YAML (y `type`, ya declarado arriba). Existe
   * porque `_configChanged(key: string, value: unknown)` en
   * neon-card-entity-editor.ts escribe `newConfig[key] = value` con
   * clave dinámica para casi todos los campos del formulario — sin
   * este índice, TypeScript rechaza esa asignación (TS7053, "no index
   * signature") y ese único método deja de compilar. Efecto colateral
   * aceptado: cualquier propiedad no declarada arriba (p. ej. un typo
   * como `neon_pallete`) tipa sin error. Los campos que SÍ están
   * declarados arriba siguen totalmente comprobados — este índice solo
   * cubre lo que queda fuera de esa lista.
   */
  [key: string]: unknown;
}
