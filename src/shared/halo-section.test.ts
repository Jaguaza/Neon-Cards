// @vitest-environment jsdom
import { render } from 'lit';
import { describe, expect, it, vi } from 'vitest';
import { renderCustomColors, renderHaloSection } from './halo-section';
import { PALETTE_IDS } from './neon-palette';

const TEXTS = { section: 'Apariencia del halo', palette: 'Paleta del halo' };

function mountSection(config: Record<string, string>, onChange = vi.fn()) {
  const host = document.createElement('div');
  render(renderHaloSection(undefined, config, TEXTS, onChange), host);
  return { host, onChange, select: host.querySelector<HTMLSelectElement>('select#palette')! };
}

describe('renderHaloSection', () => {
  it('pone el título, la etiqueta y una opción por paleta más la personalizada', () => {
    const { host, select } = mountSection({});
    expect(host.querySelector('.section-header')!.textContent).toBe(TEXTS.section);
    expect(host.querySelector('label.native-select-label')!.textContent).toBe(TEXTS.palette);
    expect(Array.from(select.options).map((o) => o.value)).toEqual([...PALETTE_IDS, 'custom']);
  });

  it('marca la paleta de la configuración y, sin ella, la esmeralda', () => {
    expect(mountSection({ neon_palette: 'sunset' }).select.value).toBe('sunset');
    expect(mountSection({}).select.value).toBe('emerald');
  });

  it('los selectores de color solo salen con la paleta personalizada', () => {
    expect(mountSection({ neon_palette: 'sunset' }).host.querySelector('.custom-colors-grid')).toBeNull();
    expect(mountSection({ neon_palette: 'custom' }).host.querySelectorAll('.color-picker-wrapper')).toHaveLength(3);
  });

  it('elegir otra paleta avisa con su clave; elegir la misma no avisa', () => {
    const { select, onChange } = mountSection({ neon_palette: 'sunset' });
    select.value = 'sunset';
    select.dispatchEvent(new Event('change'));
    expect(onChange).not.toHaveBeenCalled();
    select.value = 'toxic';
    select.dispatchEvent(new Event('change'));
    expect(onChange).toHaveBeenCalledWith('neon_palette', 'toxic');
  });
});

describe('renderCustomColors', () => {
  it('enseña los colores de la configuración o los de la paleta esmeralda y avisa de cada cambio', () => {
    const host = document.createElement('div');
    const onChange = vi.fn();
    render(renderCustomColors(undefined, { neon_color2: '#123456' }, onChange), host);
    const inputs = Array.from(host.querySelectorAll<HTMLInputElement>('input[type="color"]'));
    expect(inputs.map((i) => i.value)).toEqual(['#39e07a', '#123456', '#1ecdf2']);
    inputs[2].value = '#ff0000';
    inputs[2].dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith('neon_color3', '#ff0000');
  });
});
