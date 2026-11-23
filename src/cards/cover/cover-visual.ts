import type { CoverState } from '../../ha/cover';
import { COVER_ICONS, DEFAULT_COVER_ICONS } from './constants';
import type { StatusGroup } from './types';

/**
 * Icono del cover: el de Home Assistant para su `device_class`, abierto
 * mientras la persiana está abierta o en movimiento y cerrado cuando llega a
 * cerrada (o no está disponible).
 */
export function coverIcon(cover: CoverState): string {
  const pair = (cover.deviceClass && COVER_ICONS[cover.deviceClass]) || DEFAULT_COVER_ICONS;
  return cover.state === 'open' || cover.state === 'opening' || cover.state === 'closing' ? pair.open : pair.closed;
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
