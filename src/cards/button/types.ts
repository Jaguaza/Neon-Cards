import type { ActionConfig } from '../../ha/types';
import type { InfoOption } from '../../core';

export interface SensorItemConfig {
  entity: string;
  /** Icono propio; si no se indica, se calcula automáticamente. */
  icon?: string;
  /** Decimales a mostrar; si no se indica, usa DEFAULT_SENSOR_DECIMALS. */
  decimals?: number;
}

export interface NeonButtonCardConfig {
  type?: string;
  entity?: string;
  icon?: string;
  name?: string;
  /**
   * 'custom' (por defecto, texto libre en `subtitle`) o cualquier
   * InfoOption de src/core salvo 'none' ('name'|'state'|
   * 'last-changed'|'last-updated') — requiere `entity` para poder
   * calcularse. 'none' se excluye a propósito: en Button ese hueco ya
   * lo cubre 'custom', y el editor nunca lo ofrece (ver
   * neon-button-card-editor.ts, INFO_OPTIONS.filter(opt => opt !==
   * 'none')).
   */
  subtitle_type?: 'custom' | Exclude<InfoOption, 'none'>;
  /** Texto libre cuando subtitle_type es 'custom' (o no se indica). */
  subtitle?: string;
  /** Sensor suelto, opcional, encima del divisor (sin agrupar). */
  top_sensor?: SensorItemConfig;
  /** Fila agrupada bajo el divisor, separada por "|", máximo 3. */
  sensors?: SensorItemConfig[];
  neon_palette?: string;
  neon_color1?: string;
  neon_color2?: string;
  neon_color3?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  /**
   * Escape hatch deliberado, NO relleno de compatibilidad con
   * Lovelace/HA — HA no inyecta nada en `config` más allá de lo que el
   * usuario escribe en YAML (y `type`, ya declarado arriba). Existe
   * porque `_configChanged(key: string, value: unknown)` en
   * neon-button-card-editor.ts escribe `newConfig[key] = value` con
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
