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

/** Dibujos propios de la tarjeta: persiana enrollable y veneciana. */
export type CoverGlyph = 'shutter' | 'blind';

/**
 * Qué dibujo animado lleva el cover: la veneciana (`blind`) o la persiana
 * enrollable (`shutter`, y también un cover sin `device_class`, que en esta
 * tarjeta es una persiana). Cortinas, toldos, puertas… (`null`) usan el icono
 * `mdi` de Home Assistant, sin animar.
 */
export function coverGlyph(cover: CoverState): CoverGlyph | null {
  if (cover.deviceClass === null || cover.deviceClass === 'shutter') return 'shutter';
  return cover.deviceClass === 'blind' ? 'blind' : null;
}

/** Apertura de 0 a 1: el porcentaje que se muestra o, sin él, abierta del todo o cerrada según el estado. */
export function openFraction(cover: CoverState, position: number | null): number {
  if (position !== null) return position / 100;
  return cover.state === 'open' || cover.state === 'opening' || cover.state === 'closing' ? 1 : 0;
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
