import type { ReactiveController, ReactiveControllerHost } from 'lit';

/** Medidas de `ha-card` que necesita el aro partido (ver `glow.ts`): las de
    la caja donde se pinta el SVG del aro, con el radio ya ajustado a ella.
    Es la caja exterior (con el borde del tema) si el navegador admite
    `overflow-clip-margin` y la interior si no. */
export interface RingSize {
  width: number;
  height: number;
  radius: number;
}

const DEFAULT_RADIUS = 12;
/** Descarta lecturas degeneradas (0×0 o casi): un frame intermedio antes de
    que el elemento tenga layout, o una tarjeta oculta con `display: none`. */
const MIN_SIDE = 4;

/** `true` si el navegador admite `overflow-clip-margin` (Chrome, Firefox...);
    Safari no. Decide en qué caja de `ha-card` se pinta el aro (ver `glow.ts`). */
function supportsClipMargin(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('overflow-clip-margin', '1px');
}

/** Fotogramas tras conectar en los que se mide además del observer
    (~0,5 s a 60 Hz). Cubre la ventana en la que el editor de HA crea o
    mueve la tarjeta y el layout aún se está asentando. Después, nada
    corre en reposo. */
const SETTLE_FRAMES = 30;

type Host = ReactiveControllerHost & { readonly renderRoot: HTMLElement | DocumentFragment };

/**
 * Mantiene al día el tamaño real de `ha-card` para el aro partido, que
 * necesita coordenadas en unidades reales (el atributo `d` de un `<path>`
 * no admite `%`).
 *
 * Sustituye al bucle `requestAnimationFrame` continuo que usaban Button y
 * Thermostat (60 callbacks por segundo y tarjeta, siempre, incluso en
 * reposo). Mide solo cuando puede haber cambiado algo:
 *
 * 1. `ResizeObserver` sobre el `ha-card` ACTUAL. Si Lit sustituye el nodo
 *    (p. ej. al pasar de «entidad no disponible» a la vista normal), se
 *    vuelve a observar el nuevo en `hostUpdated`: un observer atado a un
 *    nodo ya descartado no vuelve a avisar.
 * 2. Una medida tras cada renderizado (fusionada en un único frame), que
 *    recoge cambios que el observer no ve, como el radio de borde del tema.
 * 3. Una ráfaga corta de medidas al conectar (`SETTLE_FRAMES`) para la
 *    carrera de layout del editor.
 *
 * Al desconectar, todo se detiene. Con la tarjeta en reposo no queda
 * ningún callback programado.
 */
export class RingSizeController implements ReactiveController {
  /** Última medida válida. La tarjeta la lee en `render()`. */
  size: RingSize = { width: 0, height: 0, radius: DEFAULT_RADIUS };

  private readonly _host: Host;
  private readonly _selector: string;
  private _observer?: ResizeObserver;
  private _observed: Element | null = null;
  private _raf?: number;
  private _settleLeft = 0;

  constructor(host: Host, selector = 'ha-card') {
    this._host = host;
    this._selector = selector;
    host.addController(this);
  }

  hostConnected(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this._observer = new ResizeObserver(() => this._measure());
    }
    this._observe();
    this._settleLeft = SETTLE_FRAMES;
    this._request();
  }

  hostUpdated(): void {
    this._observe();
    this._request();
  }

  hostDisconnected(): void {
    this._observer?.disconnect();
    this._observer = undefined;
    this._observed = null;
    if (this._raf !== undefined) cancelAnimationFrame(this._raf);
    this._raf = undefined;
    this._settleLeft = 0;
  }

  private _target(): HTMLElement | null {
    return this._host.renderRoot?.querySelector(this._selector) as HTMLElement | null;
  }

  /** Observa el `ha-card` que haya ahora mismo (puede ser otro nodo que
      antes, o aún no existir en la primera conexión). */
  private _observe(): void {
    const target = this._target();
    if (target === this._observed) return;
    if (this._observed) this._observer?.unobserve(this._observed);
    this._observed = target;
    if (target) this._observer?.observe(target);
  }

  /** Programa UNA medida en el próximo frame, por muchas veces que se pida. */
  private _request(): void {
    if (this._raf !== undefined) return;
    this._raf = requestAnimationFrame(() => {
      this._raf = undefined;
      this._measure();
      if (this._settleLeft > 0) {
        this._settleLeft--;
        this._request();
      }
    });
  }

  private _measure(): void {
    const target = this._target();
    if (!target) return;
    // Con `overflow-clip-margin` (ver `glow.ts`) el aro se pinta en la caja
    // exterior de `ha-card`; sin él, el `overflow` lo recorta en la interior
    // (sin el borde del tema) y hay que medir esa y restar el borde al radio.
    // Medir siempre la exterior lo desplazaba y lo cortaba por abajo y a la
    // derecha, dejando el borde del cristal a la vista.
    const outer = supportsClipMargin();
    const style = getComputedStyle(target);
    const { width, height } = layoutBox(target, style, outer);
    if (width < MIN_SIDE || height < MIN_SIDE) return;
    const border = outer ? 0 : parseFloat(style.borderTopWidth) || 0;
    const radius = Math.max(0, (parseFloat(style.borderTopLeftRadius) || DEFAULT_RADIUS) - border);
    const { size } = this;
    if (width === size.width && height === size.height && radius === size.radius) return;
    this.size = { width, height, radius };
    this._host.requestUpdate();
  }
}

/**
 * Ancho y alto de la caja donde se pinta el aro. Se leen del estilo calculado
 * (con decimales y sin transformaciones) cuando `ha-card` es `border-box`, que
 * es lo habitual: `offsetWidth/Height` redondean al entero y la rejilla de HA
 * reparte anchos con decimales, así que el aro se quedaba hasta medio píxel
 * corto por la derecha y por abajo y asomaba el borde del tema. Si el estilo
 * no da una medida utilizable, se usa la de `offset*` (caja exterior) o
 * `client*` (caja interior).
 */
function layoutBox(target: HTMLElement, style: CSSStyleDeclaration, outer: boolean): { width: number; height: number } {
  const w = parseFloat(style.width);
  const h = parseFloat(style.height);
  if (style.boxSizing !== 'border-box' || !(w > 0) || !(h > 0)) {
    return outer
      ? { width: target.offsetWidth, height: target.offsetHeight }
      : { width: target.clientWidth, height: target.clientHeight };
  }
  const edge = (side: string): number => (outer ? 0 : parseFloat(style.getPropertyValue(`border-${side}-width`)) || 0);
  return { width: w - edge('left') - edge('right'), height: h - edge('top') - edge('bottom') };
}
