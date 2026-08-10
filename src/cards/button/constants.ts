import { NEON_CARDS_VERSION } from '../../version';

export const CARD_AUTHOR = 'Jaguaza';
export const CARD_VERSION = NEON_CARDS_VERSION;

/** Icono por defecto cuando no hay `icon:` ni `entity:` en la config. */
export const DEFAULT_ICON = 'mdi:gesture-tap-button';

/** Máximo de sensores en la fila agrupada bajo el divisor — legibilidad. */
export const MAX_GROUPED_SENSORS = 3;

/**
 * Duración (ms) de la animación de trazado del aro (stroke-dashoffset
 * 50→0), debe coincidir con el `transition: stroke-dashoffset 900ms...`
 * de `NEON_RING_SPLIT_STYLES` en `src/shared/glow.ts`. Se reutiliza en
 * Button Card para retrasar acciones como `navigate` cuando no hay
 * `entity` configurada (sin entidad, `_isActive` es siempre `false`, así
 * que el aro no se ve si la acción cambia de pestaña/web al instante).
 */
export const RING_ANIMATION_MS = 900;
