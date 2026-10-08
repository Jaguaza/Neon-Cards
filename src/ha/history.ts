import type { HomeAssistant } from './types';

/** Un cambio de estado de una entidad: instante (ms) y valor crudo. */
export interface HistoryPoint {
  time: number;
  state: string;
}

/**
 * Entrada del histórico en el formato comprimido de HA
 * (`minimal_response`: `s`/`lu`/`lc`, `lu` en segundos) o en el largo
 * (`state`/`last_updated`, ISO o segundos). Se aceptan ambos para no
 * depender de la versión de HA (acuerdo nº24).
 */
interface RawHistoryEntry {
  s?: string;
  state?: string;
  lu?: number;
  lc?: number;
  last_updated?: number | string;
  last_changed?: number | string;
}

type RawHistoryResponse = Record<string, RawHistoryEntry[]>;

function toMs(value: number | string | undefined): number | null {
  if (typeof value === 'number') return value * 1000;
  if (typeof value === 'string') {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? null : ms;
  }
  return null;
}

export function parseHistory(raw: RawHistoryResponse | undefined, entityId: string): HistoryPoint[] {
  const entries = raw?.[entityId];
  if (!Array.isArray(entries)) return [];
  const points: HistoryPoint[] = [];
  for (const entry of entries) {
    const state = entry.s ?? entry.state;
    const time = toMs(entry.lu ?? entry.lc ?? entry.last_updated ?? entry.last_changed);
    if (typeof state === 'string' && time !== null) points.push({ time, state });
  }
  return points.sort((a, b) => a.time - b.time);
}

/**
 * Histórico de una entidad de las últimas `hours` horas. Devuelve `[]`
 * si este `hass` no ofrece `callWS` (tests, HA muy antiguo).
 */
export async function fetchHistory(
  hass: HomeAssistant,
  entityId: string,
  hours: number,
  now: number = Date.now()
): Promise<HistoryPoint[]> {
  if (!hass.callWS) return [];
  const raw = await hass.callWS<RawHistoryResponse>({
    type: 'history/history_during_period',
    start_time: new Date(now - hours * 3_600_000).toISOString(),
    end_time: new Date(now).toISOString(),
    entity_ids: [entityId],
    minimal_response: true,
    no_attributes: true,
    significant_changes_only: false,
  });
  return parseHistory(raw, entityId);
}
