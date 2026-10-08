import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { fetchHistory } from '../../ha/history';
import type { HomeAssistant } from '../../ha/types';
import { GRAPH_BUCKETS, HISTORY_REFRESH_MS } from './constants';
import { resampleSeries, toNumericState } from './monitor-trace';
import type { SeriesPoint } from './monitor-trace';

export interface HistoryRequest {
  hass?: HomeAssistant;
  entity?: string;
  hours: number;
  enabled: boolean;
}

/**
 * Mantiene al día la serie del gráfico: una consulta de histórico al
 * empezar (o al cambiar entidad/horas) y una relectura cada
 * `HISTORY_REFRESH_MS`. Al desconectar la tarjeta el temporizador se
 * detiene, y una respuesta tardía de una entidad anterior se descarta.
 */
export class HistoryController implements ReactiveController {
  /** Serie ya repartida en tramos; vacía mientras no hay datos. */
  values: number[] = [];

  private readonly _host: ReactiveControllerHost;
  private _request: HistoryRequest = { hours: 0, enabled: false };
  private _key = '';
  private _connected = false;
  private _timer?: ReturnType<typeof setInterval>;

  constructor(host: ReactiveControllerHost) {
    this._host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this._connected = true;
    this._start();
  }

  hostDisconnected(): void {
    this._connected = false;
    this._stop();
  }

  /** Se llama en cada actualización de la tarjeta; solo actúa si cambia
      la entidad, las horas o el interruptor del gráfico. */
  sync(request: HistoryRequest): void {
    this._request = request;
    const key = request.enabled && request.entity ? `${request.entity}|${request.hours}` : '';
    if (key === this._key) return;
    this._stop();
    this._key = key;
    this.values = [];
    this._start();
  }

  private _start(): void {
    if (!this._connected || !this._key || !this._request.hass || this._timer) return;
    void this._load();
    this._timer = setInterval(() => void this._load(), HISTORY_REFRESH_MS);
  }

  private _stop(): void {
    clearInterval(this._timer);
    this._timer = undefined;
  }

  private async _load(): Promise<void> {
    const { hass, entity, hours } = this._request;
    const key = this._key;
    if (!hass || !entity) return;
    try {
      const raw = await fetchHistory(hass, entity, hours);
      if (key !== this._key) return;
      const domain = entity.split('.')[0];
      const points: SeriesPoint[] = [];
      for (const p of raw) {
        const value = toNumericState(p.state, domain);
        if (value !== null) points.push({ time: p.time, value });
      }
      const end = Date.now();
      this.values = resampleSeries(points, end - hours * 3_600_000, end, GRAPH_BUCKETS);
      this._host.requestUpdate();
    } catch (err) {
      if (__DEV__) console.warn(`[neon-sensor-card] no se pudo leer el histórico de ${entity}:`, err);
    }
  }
}
