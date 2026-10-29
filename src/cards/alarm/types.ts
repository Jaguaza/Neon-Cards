import type { ActionConfig } from '../../ha/types';
import type { InfoOption } from '../../core';

/**
 * Estados visuales de la tarjeta. Los once primeros son los estados del
 * dominio `alarm_control_panel` de Home Assistant; `unavailable` es la
 * entidad caída y `error` es un estado propio de la tarjeta para «no hay
 * entidad válida» (sin `entity:`, entidad inexistente, `unknown` o un
 * estado que el dominio no define).
 */
export type AlarmVisualState =
  | 'disarmed'
  | 'armed_home'
  | 'armed_away'
  | 'armed_night'
  | 'armed_vacation'
  | 'armed_custom_bypass'
  | 'pending'
  | 'arming'
  | 'disarming'
  | 'triggered'
  | 'unavailable'
  | 'error';

/** Modos de armado que la tarjeta sabe pedir (un servicio `alarm_arm_*` por cada uno). */
export type AlarmArmMode = 'armed_home' | 'armed_away' | 'armed_night' | 'armed_vacation' | 'armed_custom_bypass';

/** Órdenes del dominio `alarm_control_panel` que la tarjeta lanza: desarmar o armar en un modo. */
export type AlarmCommand = 'disarm' | AlarmArmMode;

/**
 * Tamaño: `large` (por defecto), `medium` (sin subtítulo, con el estado bajo
 * el nombre) y `compact` (solo icono, nombre y estado, sin pie).
 */
export type AlarmSize = 'compact' | 'medium' | 'large';

/** Qué mostrar bajo el nombre (tamaño grande): como en la Lock Card. */
export type AlarmSubtitleType = 'none' | 'state' | 'custom' | Exclude<InfoOption, 'name'>;

export interface NeonAlarmCardConfig {
  type?: string;
  /** Entidad del dominio `alarm_control_panel`. */
  entity?: string;
  name?: string;
  size?: AlarmSize;
  subtitle_type?: AlarmSubtitleType;
  /** Texto libre cuando `subtitle_type` es `custom`. */
  subtitle?: string;
  neon_palette?: string;
  neon_color1?: string;
  neon_color2?: string;
  neon_color3?: string;
  /**
   * Hasta tres tipos de sensor para el pie, en este orden. Cada uno es una
   * `device_class` de `binary_sensor` (`motion`, `door`, `window`,
   * `vibration`…) o `lock` para las cerraduras; la tarjeta cuenta todos los
   * sensores de ese tipo que hay abiertos (menos los de `footer_excluded`) y,
   * al pulsar el dato, los lista. Hasta cuatro en la grande, dos en la mediana.
   */
  footer_sensors?: string[];
  /**
   * Con `true` el pie y la lista solo muestran lo que está activo: los tipos
   * de sensor sin ningún sensor activo desaparecen del pie y la lista
   * enseña solo los sensores activos. Desactivado por defecto.
   */
  footer_only_active?: boolean;
  /**
   * Entidades (`binary_sensor.*` o `lock.*`) que la tarjeta no cuenta ni
   * lista, aunque sean del tipo elegido. El editor las marca con checks.
   */
  footer_excluded?: string[];
  /**
   * Color del punto de estado de cada situación (hex, `rgb()`/`hsl()`, nombre
   * o `var(--x)`): desarmada, cada modo armado, transición (pendiente,
   * armando y desarmando a la vez), disparada y no disponible. Sin valor o
   * con uno inválido vale el color por defecto.
   */
  status_color_disarmed?: string;
  status_color_armed_home?: string;
  status_color_armed_away?: string;
  status_color_armed_night?: string;
  status_color_armed_vacation?: string;
  status_color_armed_custom_bypass?: string;
  status_color_transition?: string;
  status_color_triggered?: string;
  status_color_unavailable?: string;
  /** Color de los sensores activos en el pie y en la lista (ámbar por defecto). */
  sensor_active_color?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  /**
   * Escape hatch deliberado, mismo motivo que en las demás tarjetas: el
   * editor escribe `newConfig[key] = value` con clave dinámica.
   */
  [key: string]: unknown;
}
