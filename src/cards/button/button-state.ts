import type { HomeAssistant } from '../../ha/types';
import { DEFAULT_ICON, ERROR_ICON } from './constants';
import type { NeonButtonCardConfig } from './types';

/** Dominios cuyo estado "on" se interpreta como botón activo. */
const ACTIVE_DOMAINS_ON_STATE = new Set([
  'light',
  'switch',
  'fan',
  'input_boolean',
  'automation',
  'media_player',
  'binary_sensor',
  'cover',
]);

/**
 * Columnas del grid de HA según cuántos sensores agrupados hay. Calibrado
 * con medidas reales: `top_sensor` no suma ancho, y con 1 solo agrupado
 * tampoco hace falta más que la base.
 */
export function gridColumnsFor(groupedCount: number): number {
  if (groupedCount === 3) return 6;
  if (groupedCount === 2) return 5;
  return 3;
}

/** Filas para `getCardSize()`: 3 solo con sensor suelto Y agrupados a la vez. */
export function cardSizeRows(config: NeonButtonCardConfig | undefined): number {
  const needsAutoHeight = !!config?.top_sensor && (config.sensors?.length ?? 0) >= 1;
  return needsAutoHeight ? 3 : 2;
}

/**
 * `entity:` está configurada pero rota: no existe en `hass.states` o su
 * estado es `unavailable`/`unknown`. Sin `entity:` NO es un error (botón de
 * acción puro).
 */
export function isEntityBroken(config: NeonButtonCardConfig | undefined, hass: HomeAssistant | undefined): boolean {
  if (!config?.entity || !hass) return false;
  const stateObj = hass.states[config.entity];
  return !stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown';
}

/** Activo = entidad de un dominio "encendible" cuyo estado es `on`. */
export function isButtonActive(config: NeonButtonCardConfig | undefined, hass: HomeAssistant | undefined): boolean {
  if (!config?.entity) return false;
  const stateObj = hass?.states[config.entity];
  if (!stateObj) return false;
  const domain = config.entity.split('.')[0];
  if (!ACTIVE_DOMAINS_ON_STATE.has(domain)) return false;
  return stateObj.state === 'on';
}

/**
 * Icono a mostrar: una entidad rota sustituye SIEMPRE al icono (incluso uno
 * explícito); si no, `icon:` de la config, luego el de la entidad, luego el
 * por defecto.
 */
export function resolveButtonIcon(config: NeonButtonCardConfig | undefined, hass: HomeAssistant | undefined): string {
  if (isEntityBroken(config, hass)) return ERROR_ICON;
  const entityIcon = config?.entity ? (hass?.states[config.entity]?.attributes.icon as string | undefined) : undefined;
  return config?.icon || entityIcon || DEFAULT_ICON;
}
