import { describe, expect, it } from 'vitest';
import { LockPoseAnimator } from './lock-pose-animator';
import type { PoseClock } from './lock-pose-animator';
import { POSE_TOTAL_MS } from './lock-geometry';

function fakeClock() {
  let t = 0;
  let id = 0;
  const frames = new Map<number, () => void>();
  const clock: PoseClock = {
    now: () => t,
    request: (cb) => {
      frames.set(++id, cb);
      return id;
    },
    cancel: (i) => void frames.delete(i),
  };
  return {
    clock,
    /** Avanza el reloj y dispara los fotogramas pendientes (como el navegador). */
    advance(ms: number) {
      t += ms;
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((cb) => cb());
    },
    /** Avanza el reloj SIN disparar fotogramas (navegador que pausa requestAnimationFrame). */
    skip(ms: number) {
      t += ms;
    },
    get pending() {
      return frames.size;
    },
  };
}

function setup(reduced = false) {
  const c = fakeClock();
  const applied: number[] = [];
  const animator = new LockPoseAnimator((s) => applied.push(s), c.clock, () => reduced);
  return { c, animator, applied };
}

describe('LockPoseAnimator', () => {
  it('empieza cerrado y sin bucle de fotogramas', () => {
    const { c, animator } = setup();
    expect(animator.value()).toBe(0);
    expect(c.pending).toBe(0);
  });

  it('abrir recorre 0 → 1 en POSE_TOTAL_MS y después deja de pedir fotogramas', () => {
    const { c, animator, applied } = setup();
    animator.set(true);
    c.advance(POSE_TOTAL_MS / 2);
    expect(animator.value()).toBeCloseTo(0.5);
    c.advance(POSE_TOTAL_MS / 2);
    expect(animator.value()).toBe(1);
    expect(applied.at(-1)).toBe(1);
    expect(c.pending).toBe(0);
  });

  it('los valores aplicados crecen sin saltos ni retrocesos al abrir', () => {
    const { c, animator, applied } = setup();
    animator.set(true);
    for (let i = 0; i < 50; i++) c.advance(16);
    for (let i = 1; i < applied.length; i++) expect(applied[i]).toBeGreaterThanOrEqual(applied[i - 1]);
    expect(applied.at(-1)).toBe(1);
  });

  it('invertir a mitad del recorrido continúa desde el valor actual, sin saltos', () => {
    const { c, animator } = setup();
    animator.set(true);
    c.advance(POSE_TOTAL_MS / 2);
    const mid = animator.value();
    animator.set(false);
    expect(animator.value()).toBeCloseTo(mid);
    c.advance((POSE_TOTAL_MS / 2) - 1);
    expect(animator.value()).toBeGreaterThan(0);
    c.advance(1);
    expect(animator.value()).toBe(0);
  });

  it('abrir-cerrar-abrir en ráfaga termina abierto y sin fotogramas pendientes', () => {
    const { c, animator } = setup();
    for (const open of [true, false, true, false, true]) {
      animator.set(open);
      c.advance(90);
    }
    c.advance(POSE_TOTAL_MS * 2);
    expect(animator.value()).toBe(1);
    expect(c.pending).toBe(0);
  });

  it('pedir el mismo objetivo dos veces no duplica el bucle', () => {
    const { c, animator } = setup();
    animator.set(true);
    animator.set(true);
    expect(c.pending).toBe(1);
  });

  it('si el navegador no entrega fotogramas, value() sigue siendo el correcto por el reloj', () => {
    const { c, animator } = setup();
    animator.set(true);
    c.skip(5000); // pestaña oculta / carga alta: ni un fotograma
    expect(animator.value()).toBe(1);
  });

  it('dispose cancela el bucle pero el valor se recupera al volver a consultar', () => {
    const { c, animator } = setup();
    animator.set(true);
    animator.dispose();
    expect(c.pending).toBe(0);
    c.skip(POSE_TOTAL_MS);
    expect(animator.value()).toBe(1);
    animator.set(true); // reconexión: ya está en destino, no arranca nada
    expect(c.pending).toBe(0);
  });

  it('reconectar a mitad de recorrido retoma el movimiento', () => {
    const { c, animator } = setup();
    animator.set(true);
    c.advance(100);
    animator.dispose();
    c.skip(100);
    animator.set(true);
    expect(c.pending).toBe(1);
    c.advance(POSE_TOTAL_MS);
    expect(animator.value()).toBe(1);
  });

  it('snap coloca la pose sin animar', () => {
    const { c, animator, applied } = setup();
    animator.snap(true);
    expect(animator.value()).toBe(1);
    expect(c.pending).toBe(0);
    expect(applied).toEqual([]);
  });

  it('con prefers-reduced-motion cambia de pose sin animar', () => {
    const { c, animator } = setup(true);
    animator.set(true);
    expect(animator.value()).toBe(1);
    expect(c.pending).toBe(0);
    animator.set(false);
    expect(animator.value()).toBe(0);
    expect(c.pending).toBe(0);
  });
});
