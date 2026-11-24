import type { CoverState } from '../../ha/cover';
import { BINARY_COVER_TYPES, COVER_TYPES } from './constants';
import type { CoverType, StatusGroup } from './types';

const TYPE_BY_DEVICE_CLASS: Record<string, CoverType> = {
  shutter: 'shutter',
  blind: 'blind',
  curtain: 'curtain',
  awning: 'awning',
};

/**
 * Tipo de cover (el dibujo) que lleva la tarjeta: el que se pide en la
 * configuración (`cover_type`) y, si no hay o no es uno de los cuatro, el que
 * corresponde al `device_class` de la entidad: persiana enrollable
 * (`shutter`), veneciana (`blind`), cortina (`curtain`) o toldo (`awning`).
 * Un cover sin clase, o con una que esta tarjeta no contempla (garaje, puerta,
 * ventana…), es una persiana enrollable, el tipo por defecto.
 */
export function resolveCoverType(cover: CoverState, configured?: unknown): CoverType {
  if (COVER_TYPES.includes(configured as CoverType)) return configured as CoverType;
  return (cover.deviceClass && TYPE_BY_DEVICE_CLASS[cover.deviceClass]) || 'shutter';
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
