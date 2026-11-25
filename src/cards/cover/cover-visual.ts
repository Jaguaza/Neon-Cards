import type { CoverState } from '../../ha/cover';
import { isCssColor } from '../../shared';
import { BINARY_COVER_TYPES, COVER_SIZES, COVER_TYPES, DEFAULT_COVER_SIZE, ICON_COLOR_KEY, STATUS_COLOR_KEYS } from './constants';
import type { CoverSize, CoverType, NeonCoverCardConfig, StatusGroup } from './types';

/**
 * Tipo de cover (el dibujo) que lleva la tarjeta: el de `cover_type` si es
 * uno de los seis y, si no hay o no es válido, una persiana enrollable
 * (`shutter`), el tipo por defecto. El tipo ya no se deduce del
 * `device_class` de la entidad: se elige siempre a mano.
 */
export function resolveCoverType(configured?: unknown): CoverType {
  return COVER_TYPES.includes(configured as CoverType) ? (configured as CoverType) : 'shutter';
}

/** Tamaño de la tarjeta: el de `size` si es `large` o `medium` y, si no, grande. */
export function resolveCoverSize(configured?: unknown): CoverSize {
  return COVER_SIZES.includes(configured as CoverSize) ? (configured as CoverSize) : DEFAULT_COVER_SIZE;
}

/** Los tipos binarios (pantalla de proyector y TV) solo se abren o se cierran: sin porcentaje, dial ni deslizadores. */
export function isBinaryCoverType(type: CoverType): boolean {
  return BINARY_COVER_TYPES.includes(type);
}

/**
 * Apertura de 0 a 1: el porcentaje que se muestra o, sin él, el estado de
 * destino: abierta del todo si está abierta o abriéndose y cerrada si está
 * cerrada, cerrándose o no disponible.
 */
export function openFraction(cover: CoverState, position: number | null): number {
  if (position !== null) return position / 100;
  return cover.state === 'open' || cover.state === 'opening' ? 1 : 0;
}

export function statusGroup(cover: CoverState): StatusGroup {
  switch (cover.state) {
    case 'open':
      return 'open';
    case 'opening':
    case 'closing':
      return 'moving';
    case 'closed':
      return 'closed';
    default:
      return 'alert';
  }
}

/** El halo de la tarjeta está encendido mientras la persiana no está cerrada (ni la entidad caída). */
export function isHaloOn(cover: CoverState): boolean {
  return cover.state === 'open' || cover.state === 'opening' || cover.state === 'closing';
}

/** Color elegido en la config para el punto de este grupo de estado; `undefined` si no hay o no es válido (vale el de por defecto). */
export function statusDotColor(config: NeonCoverCardConfig | undefined, group: StatusGroup): string | undefined {
  const value = config?.[STATUS_COLOR_KEYS[group]];
  return isCssColor(value) ? value.trim() : undefined;
}

/** Color elegido para el icono grande; `undefined` si no hay o no es válido (el icono sigue al halo). */
export function iconColor(config: NeonCoverCardConfig | undefined): string | undefined {
  const value = config?.[ICON_COLOR_KEY];
  return isCssColor(value) ? value.trim() : undefined;
}
