import { describe, it, expect } from 'vitest';
import { NEON_HALO_STYLES, NEON_RING_SPLIT_STYLES, neonRingSplitPaths } from './glow';

/** Extrae el punto "M x y" inicial de un `d` de SVG. */
function startPoint(d: string): [number, number] {
  const match = d.match(/^M\s+([\d.-]+)\s+([\d.-]+)/);
  if (!match) throw new Error(`Sin punto de inicio en: ${d}`);
  return [parseFloat(match[1]), parseFloat(match[2])];
}

describe('neonRingSplitPaths', () => {
  it('ambas mitades arrancan exactamente en el mismo punto', () => {
    const { top, bottom } = neonRingSplitPaths(280, 120, 12, 1.2);
    expect(startPoint(top)).toEqual(startPoint(bottom));
  });

  it('el punto de inicio está separado `inset` px del borde en la esquina superior-izquierda', () => {
    const inset = 1.2;
    const radius = 12;
    const { top } = neonRingSplitPaths(280, 120, radius, inset);
    const [x, y] = startPoint(top);
    // Punto al 45° del arco de esquina: inset + radius * (1 - cos(45°)).
    const k = radius * (1 - Math.SQRT1_2);
    expect(x).toBeCloseTo(inset + k, 5);
    expect(y).toBeCloseTo(inset + k, 5);
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
