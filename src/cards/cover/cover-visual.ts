import type { CoverState } from '../../ha/cover';
import type { StatusGroup } from './types';

/** Los cuatro dibujos de la tarjeta: persiana enrollable, veneciana, cortina y toldo. */
export type CoverGlyph = 'shutter' | 'blind' | 'curtain' | 'awning';

const GLYPH_BY_DEVICE_CLASS: Record<string, CoverGlyph> = {
  shutter: 'shutter',
  blind: 'blind',
  curtain: 'curtain',
  awning: 'awning',
};

/**
 * Qué dibujo animado lleva el cover según su `device_class`: persiana
 * enrollable (`shutter`), veneciana (`blind`), cortina (`curtain`) o toldo
 * (`awning`). Un cover sin clase, o con una que esta tarjeta no contempla
 * (garaje, puerta, ventana…), se dibuja como persiana enrollable, que es el
 * dibujo por defecto.
 */
export function coverGlyph(cover: CoverState): CoverGlyph {
  return (cover.deviceClass && GLYPH_BY_DEVICE_CLASS[cover.deviceClass]) || 'shutter';
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
