import type { ClimateState, HvacMode } from '../../ha/climate';

/**
 * Vista combinada de 1 o 2 entidades `climate` configuradas —
 * `entities` en el orden de configuración (`entity`, luego `entity_2`
 * si existe), y `modeOwner` resuelve qué entidad concreta gestiona cada
 * modo del selector (reglas en `types.ts`, junto a `entity_2`).
 */
export interface CombinedClimate {
  entities: ClimateState[];
  modeOwner: Map<HvacMode, ClimateState>;
}

/** Construye el "estado mostrado" (mismo tipo `ClimateState` que usa
    todo el resto del render): si hay una entidad activa se usa esa; si
    las dos están en "off" se usa la última que estuvo activa (o la
    primera configurada si nunca lo estuvo). `hvacModes` es siempre la
    unión ya resuelta en `modeOwner`, y `mode` es "off" solo cuando
    NINGUNA entidad configurada está activa. */
export function buildDisplayState(combined: CombinedClimate, lastActiveEntity: string | null): ClimateState {
  const active = combined.entities.find((e) => e.mode !== 'off') ?? null;
  const fallback = combined.entities.find((e) => e.entity === lastActiveEntity) ?? combined.entities[0];
  const base = active ?? fallback;
  return {
    entity: base.entity,
    mode: active ? active.mode : 'off',
    hvacModes: Array.from(combined.modeOwner.keys()),
    hvacAction: active ? active.hvacAction : null,
    currentTemperature: base.currentTemperature,
    targetTemperature: base.targetTemperature,
    minTemp: base.minTemp,
    maxTemp: base.maxTemp,
    step: base.step,
    available: base.available,
  };
}
