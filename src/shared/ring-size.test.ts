// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RingSizeController } from './ring-size';

/** ResizeObserver de pega: guarda qué observa y deja disparar a mano. */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  observed = new Set<Element>();
  disconnected = false;
  constructor(private readonly callback: () => void) {
    FakeResizeObserver.instances.push(this);
  }
  observe(el: Element): void {
    this.observed.add(el);
  }
  unobserve(el: Element): void {
    this.observed.delete(el);
  }
  disconnect(): void {
    this.disconnected = true;
    this.observed.clear();
  }
  fire(): void {
    this.callback();
  }
}

function setBox(el: HTMLElement, width: number, height: number, radius = '12px', border = '0px'): void {
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: width });
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: height });
  el.style.borderTopLeftRadius = radius;
  el.style.borderTopWidth = border;
  el.style.borderTopStyle = 'solid';
}

describe('RingSizeController', () => {
  let rafQueue: Array<{ id: number; cb: () => void }>;
  let nextId: number;
  let root: HTMLElement;
  let card: HTMLElement;
  let updates: number;
  let controller: RingSizeController;

  const host = () => ({
    renderRoot: root,
    addController: () => undefined,
    removeController: () => undefined,
    requestUpdate: () => {
      updates++;
    },
    updateComplete: Promise.resolve(true),
  });

  /** Ejecuta los callbacks de rAF pendientes (un frame). */
  const frame = (): void => {
    const batch = rafQueue;
    rafQueue = [];
    batch.forEach((x) => x.cb());
  };

  /** Frames hasta que no queda nada programado (con tope por seguridad). */
  const drain = (): number => {
    let frames = 0;
    while (rafQueue.length && frames < 1000) {
      frame();
      frames++;
    }
    return frames;
  };

  beforeEach(() => {
    FakeResizeObserver.instances = [];
    rafQueue = [];
    nextId = 1;
    updates = 0;
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
      const id = nextId++;
      rafQueue.push({ id, cb });
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      rafQueue = rafQueue.filter((x) => x.id !== id);
    });
    root = document.createElement('div');
    card = document.createElement('ha-card');
    setBox(card, 400, 72);
    root.appendChild(card);
    document.body.appendChild(root);
    controller = new RingSizeController(host() as never);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    root.remove();
  });

  it('mide el ha-card al conectar y avisa a la tarjeta para repintar el aro', () => {
    controller.hostConnected();
    drain();
    expect(controller.size).toEqual({ width: 400, height: 72, radius: 12 });
    expect(updates).toBe(1);
  });

  it('en reposo no deja nada programado: tras la ráfaga corta de conexión se detiene', () => {
    controller.hostConnected();
    const frames = drain();
    expect(frames).toBeGreaterThan(1);
    expect(frames).toBeLessThanOrEqual(40);
    expect(rafQueue).toHaveLength(0);
  });

  it('observa el ha-card con ResizeObserver y mide cuando éste dispara', () => {
    controller.hostConnected();
    drain();
    const [observer] = FakeResizeObserver.instances;
    expect(observer.observed.has(card)).toBe(true);
    setBox(card, 250, 72);
    observer.fire();
    expect(controller.size.width).toBe(250);
    expect(updates).toBe(2);
  });

  it('solo avisa a la tarjeta cuando la medida cambia de verdad', () => {
    controller.hostConnected();
    drain();
    const before = updates;
    FakeResizeObserver.instances[0].fire();
    FakeResizeObserver.instances[0].fire();
    expect(updates).toBe(before);
  });

  it('descarta lecturas degeneradas (tarjeta oculta o sin layout) y conserva la última válida', () => {
    controller.hostConnected();
    drain();
    setBox(card, 0, 0);
    FakeResizeObserver.instances[0].fire();
    expect(controller.size).toEqual({ width: 400, height: 72, radius: 12 });
    setBox(card, 3, 100);
    FakeResizeObserver.instances[0].fire();
    expect(controller.size.width).toBe(400);
  });

  it('recoge un cambio de radio del tema aunque el tamaño no cambie (medida tras renderizar)', () => {
    controller.hostConnected();
    drain();
    setBox(card, 400, 72, '28px');
    controller.hostUpdated();
    drain();
    expect(controller.size.radius).toBe(28);
  });

  it('mide la caja interior: el borde del tema no entra en el ancho ni en el alto del aro', () => {
    // 200×63 por fuera con borde de 1 px = 198×61 por dentro (clientWidth/Height).
    setBox(card, 198, 61, '18px', '1px');
    Object.defineProperty(card, 'offsetWidth', { configurable: true, value: 200 });
    Object.defineProperty(card, 'offsetHeight', { configurable: true, value: 63 });
    controller.hostConnected();
    drain();
    expect(controller.size.width).toBe(198);
    expect(controller.size.height).toBe(61);
  });

  it('el radio del aro es el exterior menos el borde, y nunca baja de 0', () => {
    setBox(card, 198, 61, '18px', '2px');
    controller.hostConnected();
    drain();
    expect(controller.size.radius).toBe(16);
    setBox(card, 198, 61, '1px', '3px');
    controller.hostUpdated();
    drain();
    expect(controller.size.radius).toBe(0);
  });

  it('si Lit sustituye el ha-card, deja de observar el viejo y observa el nuevo', () => {
    controller.hostConnected();
    drain();
    const observer = FakeResizeObserver.instances[0];
    const replacement = document.createElement('ha-card');
    setBox(replacement, 300, 90);
    card.replaceWith(replacement);
    controller.hostUpdated();
    expect(observer.observed.has(card)).toBe(false);
    expect(observer.observed.has(replacement)).toBe(true);
    drain();
    expect(controller.size).toEqual({ width: 300, height: 90, radius: 12 });
  });

  it('varias peticiones en el mismo frame se fusionan en una sola medida', () => {
    controller.hostConnected();
    drain();
    controller.hostUpdated();
    controller.hostUpdated();
    controller.hostUpdated();
    expect(rafQueue).toHaveLength(1);
  });

  it('al desconectar cancela lo pendiente y desconecta el observer', () => {
    controller.hostConnected();
    expect(rafQueue.length).toBeGreaterThan(0);
    controller.hostDisconnected();
    expect(rafQueue).toHaveLength(0);
    expect(FakeResizeObserver.instances[0].disconnected).toBe(true);
  });

  it('al reconectar (mover la tarjeta) crea un observer nuevo y vuelve a medir', () => {
    controller.hostConnected();
    drain();
    controller.hostDisconnected();
    setBox(card, 320, 72);
    controller.hostConnected();
    expect(FakeResizeObserver.instances).toHaveLength(2);
    expect(FakeResizeObserver.instances[1].observed.has(card)).toBe(true);
    drain();
    expect(controller.size.width).toBe(320);
  });

  it('sin ResizeObserver disponible sigue midiendo tras renderizar, sin romperse', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const c = new RingSizeController(host() as never);
    c.hostConnected();
    drain();
    expect(c.size.width).toBe(400);
  });

  it('sin ha-card todavía (primera conexión antes de renderizar) no falla y mide cuando aparece', () => {
    card.remove();
    controller.hostConnected();
    drain();
    expect(controller.size.width).toBe(0);
    root.appendChild(card);
    controller.hostUpdated();
    drain();
    expect(controller.size.width).toBe(400);
  });
});
