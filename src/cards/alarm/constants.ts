import { NEON_CARDS_VERSION } from '../../version';
import type { GradientColors } from '../../shared';
import type { AlarmArmMode, AlarmSize, AlarmVisualState } from './types';

export const CARD_AUTHOR = 'Jaguaza';
export const CARD_VERSION = NEON_CARDS_VERSION;

/** Estados del dominio `alarm_control_panel` que la tarjeta pinta tal cual. */
export const HA_ALARM_STATES: readonly AlarmVisualState[] = [
  'disarmed',
  'armed_home',
  'armed_away',
  'armed_night',
  'armed_vacation',
  'armed_custom_bypass',
  'pending',
  'arming',
  'disarming',
  'triggered',
  'unavailable',
];

/**
 * Bits de `supported_features` de `alarm_control_panel` que indican qué
 * modos de armado ofrece la entidad. Solo esos aparecen en la selección.
 */
export const ARM_FEATURE_BITS: Record<AlarmArmMode, number> = {
  armed_home: 1,
  armed_away: 2,
  armed_night: 4,
  armed_custom_bypass: 16,
  armed_vacation: 32,
};

/** Orden en que se ofrecen los modos. */
export const ARM_MODE_ORDER: readonly AlarmArmMode[] = ['armed_home', 'armed_away', 'armed_night', 'armed_vacation', 'armed_custom_bypass'];

/** Servicio `alarm_control_panel.<servicio>` de cada orden. */
export const COMMAND_SERVICES = {
  disarm: 'alarm_disarm',
  armed_home: 'alarm_arm_home',
  armed_away: 'alarm_arm_away',
  armed_night: 'alarm_arm_night',
  armed_vacation: 'alarm_arm_vacation',
  armed_custom_bypass: 'alarm_arm_custom_bypass',
} as const;

/** Iconos `mdi` de cada orden (los botones de la selección de modo y la confirmación compacta). */
export const COMMAND_ICONS = {
  disarm: 'mdi:shield-off',
  armed_home: 'mdi:shield-home',
  armed_away: 'mdi:shield-lock',
  armed_night: 'mdi:shield-moon',
  armed_vacation: 'mdi:shield-airplane',
  armed_custom_bypass: 'mdi:shield-half-full',
} as const;

/** Con la alarma disparada el aro y el halo se vuelven rojos, sea cual sea la paleta elegida. */
export const TRIGGERED_HALO: GradientColors = { c1: '#ff3b3b', c2: '#ff5c5c', c3: '#ff2d6b' };

/** Icono `mdi` del estado `error` (sin entidad válida). */
export const ERROR_ICON = 'mdi:close';

/**
 * Espera (ms) del halo encendido tras lanzar una orden, hasta que la
 * entidad cambia de estado. Si no cambia (orden fallida) se apaga.
 */
export const ACTION_PENDING_MS = 6000;

/** Tiempo (ms) sin actividad tras el que una vista (modo, teclado, confirmación, lista) se cierra sola. */
export const VIEW_TIMEOUT_MS = 30000;

/**
 * Retardo (ms) entre encender el halo y mostrar la vista, para que la
 * transición del aro arranque limpia en WebKit (mismo motivo que en la Lock Card).
 */
export const VIEW_REVEAL_MS = 120;

/** Columnas del grid de HA con las que empieza cada tamaño y mínimo al que se puede reducir. */
export const ALARM_GRID: Record<AlarmSize, { columns: number; min_columns: number }> = {
  compact: { columns: 3, min_columns: 3 },
  medium: { columns: 6, min_columns: 4 },
  large: { columns: 12, min_columns: 4 },
};

/** Máximo de tipos de sensor en el pie según el tamaño (la compacta no tiene pie). */
export const FOOTER_MAX: Record<AlarmSize, number> = { compact: 0, medium: 2, large: 4 };

/** Tipo especial del pie: las cerraduras (dominio `lock`) en vez de una `device_class`. */
export const LOCK_SENSOR_TYPE = 'lock';

/**
 * `device_class` de `binary_sensor` de seguridad que ofrece el editor, en el
 * orden en que las muestra. La tarjeta acepta cualquier `device_class` que
 * llegue por YAML: esta lista solo es la sugerencia del selector.
 */
export const SECURITY_SENSOR_TYPES: readonly string[] = [
  'motion',
  'occupancy',
  'presence',
  'door',
  'garage_door',
  'window',
  'opening',
  'vibration',
  'tamper',
  'smoke',
  'gas',
  'carbon_monoxide',
  'moisture',
  'heat',
  'sound',
  'safety',
  'problem',
  LOCK_SENSOR_TYPE,
];

/** Iconos [activo, en reposo] de cada tipo de sensor; un tipo desconocido usa `DEFAULT_SENSOR_ICONS`. */
export const SENSOR_ICONS: Record<string, readonly [string, string]> = {
  motion: ['mdi:motion-sensor', 'mdi:motion-sensor-off'],
  occupancy: ['mdi:home-account', 'mdi:home-outline'],
  presence: ['mdi:account-check', 'mdi:account-off-outline'],
  door: ['mdi:door-open', 'mdi:door-closed'],
  garage_door: ['mdi:garage-open', 'mdi:garage'],
  window: ['mdi:window-open', 'mdi:window-closed'],
  opening: ['mdi:square-outline', 'mdi:checkbox-blank'],
  vibration: ['mdi:vibrate', 'mdi:vibrate-off'],
  tamper: ['mdi:shield-alert', 'mdi:shield-check'],
  smoke: ['mdi:smoke', 'mdi:smoke-detector-variant'],
  gas: ['mdi:gas-cylinder', 'mdi:gas-cylinder'],
  carbon_monoxide: ['mdi:molecule-co', 'mdi:molecule-co'],
  moisture: ['mdi:water-alert', 'mdi:water-off'],
  heat: ['mdi:fire-alert', 'mdi:fire-off'],
  sound: ['mdi:volume-high', 'mdi:volume-off'],
  safety: ['mdi:alert', 'mdi:shield-check'],
  problem: ['mdi:alert-circle', 'mdi:check-circle-outline'],
  [LOCK_SENSOR_TYPE]: ['mdi:lock-open-variant', 'mdi:lock'],
};
export const DEFAULT_SENSOR_ICONS: readonly [string, string] = ['mdi:alert-circle', 'mdi:check-circle-outline'];
