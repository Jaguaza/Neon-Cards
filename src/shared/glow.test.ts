import { describe, it, expect } from 'vitest';
import { NEON_HALO_STYLES, NEON_RING_SPLIT_STYLES, neonRingSplitPaths } from './glow';

/** Extrae el punto "M x y" inicial de un `d` de SVG. */
function startPoint(d: string): [number, number] {
  const match = d.match(/^M\s+([\d.-]+)\s+([\d.-]+)/);
  if (!match) throw new Error(`Sin punto de inicio en: ${d}`);
  return [parseFloat(match[1]), parseFloat(match[2])];
}

/** Último punto \"x y\" de un `d` de SVG. */
function endPoint(d: string): [number, number] {
  const n = d.trim().split(/\s+/).slice(-2).map(Number);
  return [n[0], n[1]];
}

const dist = (a: [number, number], b: [number, number]): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

describe('neonRingSplitPaths', () => {
  const W = 280;
  const H = 120;
  const R = 12;
  const INSET = 1.2;
  const { top, bottom } = neonRingSplitPaths(W, H, R, INSET);

  it('en la unión superior-izquierda las mitades arrancan en puntos distintos del mismo arco de esquina', () => {
    const centro: [number, number] = [INSET + R, INSET + R];
    const a = startPoint(top);
    const b = startPoint(bottom);
    expect(dist(a, centro)).toBeCloseTo(R, 5);
    expect(dist(b, centro)).toBeCloseTo(R, 5);
    // Cada una rebasa 1,5 px el punto medio: entre sí quedan a ~3 px de cuerda.
    expect(dist(a, b)).toBeGreaterThan(2.5);
    expect(dist(a, b)).toBeLessThan(3.5);
  });

  it('el punto medio (45°) de la esquina queda entre los dos inicios, `inset` px dentro del borde', () => {
    const k = R * (1 - Math.SQRT1_2);
    const [ax, ay] = startPoint(top);
    const [bx, by] = startPoint(bottom);
    // El punto medio de la cuerda queda ~0,07 px por dentro del arco (flecha de la cuerda).
    expect(Math.abs((ax + bx) / 2 - (INSET + k))).toBeLessThan(0.1);
    expect(Math.abs((ay + by) / 2 - (INSET + k))).toBeLessThan(0.1);
  });

  it('en la unión inferior-derecha también se solapan, sobre el mismo arco', () => {
    const centro: [number, number] = [W - INSET - R, H - INSET - R];
    const a = endPoint(top);
    const b = endPoint(bottom);
    expect(dist(a, centro)).toBeCloseTo(R, 5);
    expect(dist(b, centro)).toBeCloseTo(R, 5);
    expect(dist(a, b)).toBeGreaterThan(2.5);
    expect(dist(a, b)).toBeLessThan(3.5);
  });

  it('cada mitad rebasa el punto medio hacia el lado contrario al de su recorrido', () => {
    // top sale hacia la derecha (arriba) y acaba hacia abajo: empieza más a la izquierda/abajo
    // y termina más abajo/derecha que el punto medio (45°) de cada esquina.
    const k = R * (1 - Math.SQRT1_2);
    expect(startPoint(top)[0]).toBeLessThan(INSET + k);
    expect(startPoint(bottom)[0]).toBeGreaterThan(INSET + k);
    expect(endPoint(top)[1]).toBeGreaterThan(H - INSET - k);
    expect(endPoint(bottom)[1]).toBeLessThan(H - INSET - k);
  });

  it('sin radio no hay arco que rebasar: ambas mitades arrancan en el mismo punto', () => {
    const { top: t, bottom: b } = neonRingSplitPaths(W, H, 0, INSET);
    expect(startPoint(t)).toEqual(startPoint(b));
    expect(endPoint(t)).toEqual(endPoint(b));
  });

  it('recorta el radio si no cabe en un rectángulo pequeño', () => {
    // width/height muy pequeños: radius pedido (12) no puede ser mayor
    // que width/2 - inset ni height/2 - inset.
    const { top } = neonRingSplitPaths(20, 16, 12, 1);
    const [x, y] = startPoint(top);
    // Con el radio recortado, el punto de inicio debe seguir dentro del
    // rectángulo (nunca fuera de sus límites).
    expect(x).toBeGreaterThanOrEqual(1);
    expect(x).toBeLessThanOrEqual(20 - 1);
    expect(y).toBeGreaterThanOrEqual(1);
    expect(y).toBeLessThanOrEqual(16 - 1);
  });

  it('no produce un radio negativo con dimensiones degeneradas', () => {
    expect(() => neonRingSplitPaths(0, 0, 12, 1)).not.toThrow();
  });
});

describe('NEON_RING_SPLIT_STYLES: trazo oculto en reposo', () => {
  const css = NEON_RING_SPLIT_STYLES.cssText.replace(/\s+/g, ' ');
  const rule = (selector: string): string => {
    const match = css.match(new RegExp(`${selector.replace(/[.]/g, '\\.')} \\{([^}]*)\\}`));
    if (!match) throw new Error(`Sin regla para ${selector}`);
    return match[1];
  };

  it('en reposo el trazo no se pinta (opacity 0), para no dejar píxeles sueltos a escalas altas', () => {
    expect(rule('.neon-ring-path')).toContain('opacity: 0');
  });

  it('al retirarse espera lo que dura el trazo (900 ms) antes de ocultarse', () => {
    expect(rule('.neon-ring-path')).toContain('opacity 0s linear 900ms');
  });

  it('al encender se pinta al instante, a la vez que empieza a dibujarse', () => {
    const active = rule('.neon-ring-host.neon-halo-active .neon-ring-path');
    expect(active).toContain('opacity: 1');
    expect(active).toContain('stroke-dashoffset: 0');
    expect(active).toMatch(/opacity 0s(;|$)/);
  });
});

describe('NEON_HALO_STYLES: icono encendido en tema claro', () => {
  const css = NEON_HALO_STYLES.cssText.replace(/\s+/g, ' ');
  const rule = (selector: string): string => {
    const start = css.indexOf(`${selector} {`);
    if (start < 0) throw new Error(`Sin regla para ${selector}`);
    return css.slice(start, css.indexOf('}', start));
  };

  it('el icono activo usa un contorno oscuro del mismo tono, sin el halo amplio', () => {
    const r = rule(':host([data-neon-light]) .neon-halo-active .neon-halo-icon');
    expect(r).toContain('var(--neon-c1) 40%, #000');
    expect(r).not.toContain('10px');
  });

  it('el icono en error también lleva el contorno, con su rojo', () => {
    expect(rule(':host([data-neon-light]) .neon-halo-error .neon-halo-icon')).toContain('var(--neon-error-color, #ff2d6b) 40%, #000');
  });

  it('el aspecto en oscuro no cambia: la regla base conserva el halo amplio', () => {
    expect(rule('.neon-halo-active .neon-halo-icon')).toContain('10px');
  });
});

describe('NEON_RING_SPLIT_STYLES: aro a ras de la tarjeta con borde del tema', () => {
  const css = NEON_RING_SPLIT_STYLES.cssText.replace(/\s+/g, ' ');
  const block = (header: string): string => {
    const start = css.indexOf(header);
    if (start < 0) throw new Error(`Sin bloque ${header}`);
    let depth = 0;
    for (let i = css.indexOf('{', start); i < css.length; i++) {
      if (css[i] === '{') depth++;
      if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1);
    }
    throw new Error(`Bloque sin cerrar ${header}`);
  };

  it('con overflow-clip-margin el recorte llega al borde del tema y el SVG sube esa distancia', () => {
    const b = block('@supports (overflow-clip-margin: 1px)');
    expect(b).toContain('overflow: clip');
    expect(b).toContain('overflow-clip-margin: var(--ha-card-border-width, 1px)');
    expect(b).toContain('.neon-ring-host .neon-ring-svg');
    expect(b).toContain('top: calc(-1 * var(--ha-card-border-width, 1px))');
    expect(b).toContain('left: calc(-1 * var(--ha-card-border-width, 1px))');
  });

  it('sin overflow-clip-margin el borde se oculta con el halo activo y el fondo se recorta a la caja interior', () => {
    const b = block('@supports not (overflow-clip-margin: 1px)');
    expect(b).toContain('border-color: transparent');
    expect(b).toContain('background-clip: padding-box');
  });

  it('la alternativa devuelve el borde al apagar solo cuando el trazo ya se ha retirado (900 ms)', () => {
    const b = block('@supports not (overflow-clip-margin: 1px)');
    expect(b).toContain('border-color 0s linear 900ms');
    expect(b).toContain('border-color 0s;');
  });

  it('la alternativa conserva la transición de transform de las tarjetas', () => {
    expect(block('@supports not (overflow-clip-margin: 1px)')).toContain('transform 150ms ease');
  });

  it('con soporte no se toca el borde ni la transición de las tarjetas', () => {
    const b = block('@supports (overflow-clip-margin: 1px)');
    expect(b).not.toContain('border-color');
    expect(b).not.toContain('transition');
  });
});
