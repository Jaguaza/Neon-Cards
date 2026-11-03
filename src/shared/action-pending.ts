import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * El halo sigue al estado de la entidad. Para dar respuesta inmediata al
 * pulsar una acción que la opera —hay dispositivos que tardan un par de
 * segundos en cambiar de estado—, el halo se enciende ya y espera, como
 * máximo este tiempo (ms), a que el estado cambie; en cuanto cambia manda el
 * estado. Si no cambia (acción fallida) se apaga al agotarse.
 */
export const ACTION_PENDING_MS = 6000;

/**
 * Lleva la cuenta de la espera del cambio de estado tras pulsar una acción
 * (ver `ACTION_PENDING_MS`).
 *
 * Guarda la MARCA DE TIEMPO y no un booleano: `active` se decide comparando
 * con el reloj en cada render, así que aunque el temporizador no llegase a
 * dispararse, cualquier actualización de `hass` la da por vencida. El
 * temporizador solo sirve para pedir un último render cuando se agota.
 *
 * La tarjeta llama a `start()` al lanzar la acción y a `clear()` en cuanto el
 * estado cambia. Si se reconecta a mitad de la espera, se retoma desde el
 * reloj: nada se queda a medias. Al desconectar, el temporizador se detiene.
 */
export class ActionPendingController implements ReactiveController {
  private readonly _host: ReactiveControllerHost;
  private _until = 0;
  private _timer?: ReturnType<typeof setTimeout>;

  constructor(host: ReactiveControllerHost) {
    this._host = host;
    host.addController(this);
  }

  /** ¿Sigue la espera del cambio de estado? */
  get active(): boolean {
    return performance.now() < this._until;
  }

  /** Enciende la espera y pide un render. */
  start(ms: number = ACTION_PENDING_MS): void {
    this._until = performance.now() + ms;
    this._schedule(ms);
    this._host.requestUpdate();
  }

  /** Da la espera por terminada (el estado cambió o la orden falló). */
  clear(): void {
    this._until = 0;
  }

  hostConnected(): void {
    const remaining = this._until - performance.now();
    if (remaining > 0) this._schedule(remaining);
  }

  hostDisconnected(): void {
    clearTimeout(this._timer);
  }

  private _schedule(ms: number): void {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._host.requestUpdate(), ms);
  }
}
