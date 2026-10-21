import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * El ejemplo de automatización (exclusión mutua para cambios hechos fuera
 * de la tarjeta) vive en DOS sitios de la documentación: el README
 * principal y el README de la tarjeta. Esta prueba impide que las copias
 * se desincronicen sin que nadie se dé cuenta.
 */
const read = (path: string): string => readFileSync(path, 'utf-8');

/** Bloques ```yaml que contienen la automatización, en orden de aparición: primero el español y luego el inglés. */
function automationBlocks(markdown: string): string[] {
  const blocks = [...markdown.matchAll(/```yaml\n([\s\S]*?)```/g)].map((m) => m[1]);
  return blocks.filter((b) => b.includes('climate.set_hvac_mode'));
}

const MAIN = automationBlocks(read('README.md'));
const CARD = automationBlocks(read('src/cards/thermostat/README.md'));

describe('ejemplo de automatización del termostato en la documentación', () => {
  it('hay una copia en español y otra en inglés en cada README', () => {
    expect(MAIN).toHaveLength(2);
    expect(CARD).toHaveLength(2);
  });

  it('la copia en español del README principal es idéntica a la del README de la tarjeta', () => {
    expect(MAIN[0]).toBe(CARD[0]);
  });

  it('la copia en inglés del README principal es idéntica a la del README de la tarjeta', () => {
    expect(MAIN[1]).toBe(CARD[1]);
  });

  it('solo se dispara con un cambio de estado de las dos entidades y apaga la otra con climate.set_hvac_mode', () => {
    for (const block of [...MAIN, ...CARD]) {
      expect(block).toContain('trigger: state');
      expect(block).toContain('hvac_mode: "off"');
      expect(block.match(/entity_id:\n\s+- climate\./g)).not.toBeNull();
    }
  });

  it('el ventilador (fan_only) no activa la exclusión', () => {
    for (const block of [...MAIN, ...CARD]) expect(block).toContain('- fan_only');
  });
});
