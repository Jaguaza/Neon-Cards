import type { ClimateState, HvacMode } from '../../ha/climate';

/**
 * Combinar 1 o 2 entidades `climate` configuradas en un único estado a
 * mostrar — lógica pura (sin `hass`, sin lit), extraída de
 * `neon-thermostat-card.ts` (acuerdo nº7/nº8). El componente solo
 * resuelve las entidades vía `getClimateState` y delega aquí el
 * cálculo de quién manda cada modo y qué se muestra.
 */

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

/** Construye `CombinedClimate` a partir de las entidades ya resueltas:
    el selector de modo es la UNIÓN de los `hvacModes` de todas ellas;
    un modo exclusivo de una entidad lo gestiona esa; uno compartido lo
    gestiona por defecto la primera, con override opcional vía
    `mode_owner` (solo aplica si TODAS las entidades soportan ese
    modo). */
export function combineClimates(
  entities: ClimateState[],
  modeOwnerConfig: Partial<Record<HvacMode, 1 | 2>> | undefined
): CombinedClimate {
  const modeOwner = new Map<HvacMode, ClimateState>();
  for (const e of entities) {
    for (const mode of e.hvacModes) {
      if (!modeOwner.has(mode)) modeOwner.set(mode, e);
    }
  }
  if (entities.length > 1 && modeOwnerConfig) {
    for (const [modeKey, ownerIndex] of Object.entries(modeOwnerConfig)) {
      const mode = modeKey as HvacMode;
      const owner = entities[(ownerIndex as number) - 1];
      if (owner && entities.every((e) => e.hvacModes.includes(mode))) {
        modeOwner.set(mode, owner);
      }
    }
  }
  return { entities, modeOwner };
}

/** Construye el "estado mostrado" (mismo tipo `ClimateState` que usa
    todo el resto del render): si hay una entidad activa se usa esa; si
    las dos están en "off" se usa la última que estuvo activa (o la
    primera configurada si nunca lo estuvo). `hvacModes` es siempre la
    unión ya resuelta en `modeOwner`, y `mode` es "off" solo cuando
    NINGUNA entidad configurada está activa. Preset y ventilador son
    siempre los de la entidad mostrada (`entity`): cada equipo tiene los
    suyos y no se mezclan. */
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
    presetMode: base.presetMode,
    presetModes: base.presetModes,
    fanMode: base.fanMode,
    fanModes: base.fanModes,
  };
}
