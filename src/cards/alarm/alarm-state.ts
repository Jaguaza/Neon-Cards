import type { ActionConfig, HomeAssistant } from '../../ha/types';
import { ARM_FEATURE_BITS, ARM_MODE_ORDER, HA_ALARM_STATES } from './constants';
import type { AlarmArmMode, AlarmCommand, AlarmVisualState, NeonAlarmCardConfig } from './types';

/**
 * Estado visual de la alarma a partir de la config y de `hass`.
 *
 * - `undefined`: todavía no hay `hass` (primer render o vista previa del editor).
 * - `'error'`: sin `entity:`, entidad inexistente, `unknown` o un estado que
 *   el dominio `alarm_control_panel` no define.
 */
export function resolveAlarmState(config: NeonAlarmCardConfig | undefined, hass: HomeAssistant | undefined): AlarmVisualState | undefined {
  if (!hass) return undefined;
  if (!config?.entity) return 'error';
  const state = hass.states[config.entity]?.state;
  return (HA_ALARM_STATES as readonly string[]).includes(state ?? '') ? (state as AlarmVisualState) : 'error';
}

/** Rojo de alerta (`.neon-halo-error`): disparada, entidad caída o sin entidad. */
export function isAlarmAlert(state: AlarmVisualState | undefined): boolean {
  return state === 'triggered' || state === 'unavailable' || state === 'error';
}

/** Modos armados (la alarma vigilando). */
export function isArmedState(state: AlarmVisualState | undefined): state is AlarmArmMode {
  return !!state && (ARM_MODE_ORDER as readonly string[]).includes(state);
}

/** Estados de transición: el icono y el punto pulsan mientras duran. */
export function isAlarmMoving(state: AlarmVisualState | undefined): boolean {
  return state === 'pending' || state === 'arming' || state === 'disarming' || state === 'triggered';
}

/**
 * Halo neón encendido mientras la alarma no está en reposo: armada, en
 * transición o disparada. Desarmada, sin datos o caída no hay halo (la
 * caída y la disparada llevan el rojo aparte).
 */
export function isAlarmHaloOn(state: AlarmVisualState | undefined): boolean {
  return isArmedState(state) || state === 'pending' || state === 'arming' || state === 'disarming' || state === 'triggered';
}

/** Modos de armado que ofrece la entidad según `supported_features`, en el orden de la tarjeta. */
export function supportedModes(attributes: Record<string, unknown> | undefined): AlarmArmMode[] {
  const features = Number(attributes?.supported_features ?? 0);
  if (!Number.isFinite(features)) return [];
  return ARM_MODE_ORDER.filter((mode) => (features & ARM_FEATURE_BITS[mode]) !== 0);
}

/** Formato de código que exige la entidad: `number`, `text` o `undefined` si no pide código. */
export function codeFormat(attributes: Record<string, unknown> | undefined): 'number' | 'text' | undefined {
  const format = attributes?.code_format;
  return format === 'number' || format === 'text' ? format : undefined;
}

/**
 * ¿Esta orden necesita código? Desarmar siempre lo pide si la entidad tiene
 * `code_format`; armar solo si además `code_arm_required` no es `false`.
 */
export function commandNeedsCode(command: AlarmCommand, attributes: Record<string, unknown> | undefined): boolean {
  if (!codeFormat(attributes)) return false;
  return command === 'disarm' || attributes?.code_arm_required !== false;
}

/**
 * Órdenes entre las que elegir al pulsar: desarmada → los modos que soporta
 * la entidad; cualquier otro estado operativo → desarmar. Sin estado válido
 * o caída no hay nada que pedir.
 */
export function commandChoices(state: AlarmVisualState | undefined, attributes: Record<string, unknown> | undefined): AlarmCommand[] {
  if (!state || state === 'error' || state === 'unavailable') return [];
  if (state === 'disarmed') return supportedModes(attributes);
  return ['disarm'];
}

/** ¿La acción `toggle` (la de por defecto al pulsar) es la que gestiona la tarjeta? */
export function isToggleAction(action: ActionConfig): boolean {
  return action.action === 'toggle';
}
