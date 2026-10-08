import { SENSOR_DOMAINS } from '../../ha/sensors';
import type { SensorDomain } from '../../ha/sensors';

/**
 * `true` solo si `entityId` es `sensor.*` o `binary_sensor.*`. La lista de
 * dominios vive en `src/ha/sensors.ts` para que tarjeta y editor no
 * puedan divergir (acuerdo nº4).
 */
export function isSensorEntity(entityId: string | undefined): boolean {
  if (!entityId) return false;
  const domain = entityId.split('.')[0];
  return entityId.includes('.') && SENSOR_DOMAINS.includes(domain as SensorDomain);
}

/** Dominios permitidos tal y como los espera `ha-entity-picker`. */
export const ALLOWED_DOMAINS: string[] = [...SENSOR_DOMAINS];
