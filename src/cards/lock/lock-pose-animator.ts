export interface PoseClock {
  now(): number;
  request(callback: () => void): number;
  cancel(id: number): void;
}

const browserClock: PoseClock = {
  now: () => performance.now(),
  request: (callback) => requestAnimationFrame(callback),
  cancel: (id) => cancelAnimationFrame(id),
};

const prefersReducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Lleva el icono entre cerrado (0) y abierto (1) a velocidad constante
 * (`durationMs` para el recorrido completo, distinta según el icono) y
 * avisa de cada valor.
 *
 * Diseñado para no poder quedarse atascado:
 *  - `value()` se calcula SIEMPRE a partir del reloj, no del número de
 *    fotogramas dibujados: si el navegador pausa o retrasa
 *    `requestAnimationFrame` (pestaña oculta, carga alta, tarjeta
 *    desconectada), el valor correcto se recupera en la siguiente consulta.
 *  - Cambiar de objetivo a mitad del recorrido continúa desde el valor
 *    actual (sin saltos), así que abrir-cerrar-abrir en seguida es seguro.
 *  - Sin bucle perpetuo: el bucle de fotogramas se detiene al llegar.
 */
export class LockPoseAnimator {
  private _from = 0;
  private _to = 0;
  private _start = 0;
  private _frame?: number;

  /** Duración del recorrido completo; cámbiala solo con el icono en reposo (junto a `snap`). */
  durationMs: number;

  constructor(
    private readonly _apply: (s: number) => void,
    private readonly _clock: PoseClock = browserClock,
    private readonly _reducedMotion: () => boolean = prefersReducedMotion,
    durationMs = 660
  ) {
    this.durationMs = durationMs;
  }

  /** Progreso actual (0 cerrado, 1 abierto), calculado a partir del reloj. */
  value(): number {
    if (this._from === this._to) return this._to;
    const duration = Math.abs(this._to - this._from) * this.durationMs;
    const progress = (this._clock.now() - this._start) / duration;
    if (progress >= 1) return this._to;
    return this._from + (this._to - this._from) * Math.max(progress, 0);
  }

  /** Coloca el candado en la pose indicada sin animar. */
  snap(open: boolean): void {
    this._stop();
    this._from = this._to = open ? 1 : 0;
  }

  /** Lleva el candado a la pose indicada animando desde donde esté. */
  set(open: boolean): void {
    const target = open ? 1 : 0;
    if (target !== this._to) {
      if (this._reducedMotion()) {
        this.snap(open);
        return;
      }
      this._from = this.value();
      this._to = target;
      this._start = this._clock.now();
    }
    this._ensureRunning();
  }

  /** Cancela el bucle de fotogramas (la tarjeta se desconecta). El valor sigue siendo correcto. */
  dispose(): void {
    this._stop();
  }

  private _stop(): void {
    if (this._frame !== undefined) this._clock.cancel(this._frame);
    this._frame = undefined;
  }

  private _ensureRunning(): void {
    if (this._frame !== undefined || this.value() === this._to) return;
    this._frame = this._clock.request(() => this._tick());
  }

  private _tick(): void {
    this._frame = undefined;
    const s = this.value();
    this._apply(s);
    if (s === this._to) this._from = this._to;
    else this._ensureRunning();
  }
}
