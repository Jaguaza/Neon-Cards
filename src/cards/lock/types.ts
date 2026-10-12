import type { ActionConfig } from '../../ha/types';
import type { InfoOption } from '../../core';

/**
 * Estados visuales de la tarjeta. Los siete primeros son los estados
 * oficiales del dominio `lock` de Home Assistant (`locked`, `unlocked`,
 * `locking`, `unlocking`, `jammed`, `open`, `opening`); `error` es un
 * estado propio de la tarjeta para "no hay entidad válida" (sin
 * `entity:`, entidad inexistente, `unavailable`/`unknown` o un estado
 * que el dominio `lock` no define).
 */
export type LockVisualState =
  | 'locked'
  | 'unlocked'
  | 'locking'
  | 'unlocking'
  | 'jammed'
  | 'open'
  | 'opening'
  | 'error';

/**
 * Qué mostrar bajo el nombre: 'state' (por defecto, estado traducido de
 * la cerradura), 'custom' (texto libre en `subtitle`) o cualquier
 * InfoOption de src/core salvo 'name' (el nombre ya se muestra encima).
 */
export type LockSubtitleType = 'custom' | Exclude<InfoOption, 'name'>;

export interface NeonLockCardConfig {
  type?: string;
  /** Entidad del dominio `lock`. Obligatoria para que la tarjeta sea útil. */
  entity?: string;
  name?: string;
  subtitle_type?: LockSubtitleType;
  /** Texto libre cuando subtitle_type es 'custom'. */
  subtitle?: string;
  neon_palette?: string;
  neon_color1?: string;
  neon_color2?: string;
  neon_color3?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  /**
   * Escape hatch deliberado, NO relleno de compatibilidad — mismo motivo
   * que en `src/cards/button/types.ts`: `_configChanged(key: string,
   * value: unknown)` del editor escribe `newConfig[key] = value` con
   * clave dinámica y, sin este índice, ese método no compila (TS7053).
   * Los campos declarados arriba siguen totalmente comprobados.
   */
  [key: string]: unknown;
}
