import type { LockSize, NeonLockCardConfig } from './types';

/**
 * Tamaño de la tarjeta. `large` es el diseño de siempre (nombre con
 * subtítulo, estado y tres puntos a la derecha) y es el predeterminado, para
 * que las tarjetas ya creadas no cambien. `medium` es la tarjeta mediana: sin
 * subtítulo, con el estado bajo el nombre.
 */
export const DEFAULT_LOCK_SIZE: LockSize = 'large';

export const LOCK_SIZES: readonly LockSize[] = ['medium', 'large'];

/** Un valor desconocido en la config cuenta como el predeterminado. */
export function resolveLockSize(config: Pick<NeonLockCardConfig, 'size'> | undefined): LockSize {
  const size = config?.size;
  return size && (LOCK_SIZES as readonly string[]).includes(size) ? size : DEFAULT_LOCK_SIZE;
}
