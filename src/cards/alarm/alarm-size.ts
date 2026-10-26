import type { AlarmSize, NeonAlarmCardConfig } from './types';

/** Tamaño por defecto: la tarjeta grande. */
export const DEFAULT_ALARM_SIZE: AlarmSize = 'large';

export const ALARM_SIZES: readonly AlarmSize[] = ['compact', 'medium', 'large'];

/** Un valor desconocido en la config cuenta como el predeterminado. */
export function resolveAlarmSize(config: Pick<NeonAlarmCardConfig, 'size'> | undefined): AlarmSize {
  const size = config?.size;
  return size && (ALARM_SIZES as readonly string[]).includes(size) ? size : DEFAULT_ALARM_SIZE;
}
