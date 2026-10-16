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

/**
 * Icono de la tarjeta, cada uno con su propia animación de abrir/cerrar:
 * `padlock` (candado, por defecto), `door` (puerta que se abre),
 * `garage_roller` (garaje con puerta enrollable) y `garage_sliding`
 * (garaje con puerta corredera).
 */
export type LockIconType = 'padlock' | 'door' | 'garage_roller' | 'garage_sliding';

/** Iconos informativos que se pueden poner en el pie de la tarjeta. */
export type LockFooterItem = 'door' | 'battery' | 'last_user';

export interface NeonLockCardConfig {
  type?: string;
  /** Entidad del dominio `lock`. Obligatoria para que la tarjeta sea útil. */
  entity?: string;
  name?: string;
  /** Icono animado; por defecto `padlock`. */
  lock_icon?: LockIconType;
  subtitle_type?: LockSubtitleType;
  /** Texto libre cuando subtitle_type es 'custom'. */
  subtitle?: string;
  neon_palette?: string;
  neon_color1?: string;
  neon_color2?: string;
  neon_color3?: string;
  /**
   * Hasta tres iconos informativos en el pie de la tarjeta, en este orden:
   * `door` (sensor de puerta, requiere `door_entity`), `battery` (batería de
   * la cerradura) y `last_user` (quién abrió la última vez y cuándo).
   * Un tipo repetido o desconocido se ignora.
   */
  footer_items?: LockFooterItem[];
  /** Sensor de puerta (`binary_sensor`): `on` es abierta, `off` es cerrada. */
  door_entity?: string;
  /** Sensor de batería (`sensor`, en %). Si falta se usa el atributo `battery_level` (o `battery`) de la cerradura. */
  battery_entity?: string;
  /**
   * Entidad con el nombre de quien accedió por última vez (`sensor`,
   * `input_text`…). Si falta se usa el atributo `changed_by` de la cerradura.
   */
  last_user_entity?: string;
  /**
   * Pide confirmación («¿Abrir?») en una vista neón dentro de la tarjeta
   * antes de ejecutar una acción que ABRE la cerradura. Activo por
   * defecto; `false` lo desactiva. Cerrar nunca pide confirmación.
   */
  confirm_open?: boolean;
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
