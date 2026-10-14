import type { LockIconType } from '../types';
import type { LockIconDef } from './types';
import { PADLOCK_ICON } from './padlock';
import { DOOR_ICON } from './door';
import { GARAGE_ROLLER_ICON } from './garage-roller';
import { GARAGE_SLIDING_ICON } from './garage-sliding';

export type { LockIconDef } from './types';

/** Iconos disponibles, en el orden en que los ofrece el editor. */
export const LOCK_ICON_TYPES: readonly LockIconType[] = ['padlock', 'door', 'garage_roller', 'garage_sliding'];

export const LOCK_ICONS: Record<LockIconType, LockIconDef> = {
  padlock: PADLOCK_ICON,
  door: DOOR_ICON,
  garage_roller: GARAGE_ROLLER_ICON,
  garage_sliding: GARAGE_SLIDING_ICON,
};

export const DEFAULT_LOCK_ICON: LockIconType = 'padlock';

/** Tipo de icono de la config; un valor desconocido o ausente es el candado. */
export function resolveLockIconType(value: unknown): LockIconType {
  return (LOCK_ICON_TYPES as readonly unknown[]).includes(value) ? (value as LockIconType) : DEFAULT_LOCK_ICON;
}
