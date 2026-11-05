// @vitest-environment jsdom
import { html, render } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { hasFormfield, labeledControl } from './labeled-control';

const control = (label: unknown) => html`<ha-checkbox>${label}</ha-checkbox>`;

/** Hace creer al código que `ha-formfield` está (o no) definido, sin definirlo de verdad. */
function mockFormfield(defined: boolean): void {
  const original = customElements.get.bind(customElements);
  vi.spyOn(customElements, 'get').mockImplementation((name: string) => (name === 'ha-formfield' && defined ? (class extends HTMLElement {} as CustomElementConstructor) : original(name)));
}

function mount(label: string): HTMLElement {
  const host = document.createElement('div');
  render(labeledControl(label, control), host);
  return host;
}

describe('labeledControl', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sin ha-formfield (HA 2026.11) la etiqueta va dentro del control', () => {
    mockFormfield(false);
    expect(hasFormfield()).toBe(false);
    const host = mount('Solo activos');
    expect(host.querySelector('ha-formfield')).toBeNull();
    expect(host.querySelector('ha-checkbox')!.textContent).toBe('Solo activos');
  });

  it('con ha-formfield (HA anterior) el control se envuelve y la etiqueta no se repite dentro', () => {
    mockFormfield(true);
    expect(hasFormfield()).toBe(true);
    const host = mount('Solo activos');
    expect(host.querySelector('ha-formfield')!.getAttribute('label')).toBe('Solo activos');
    expect(host.querySelector('ha-formfield > ha-checkbox')!.textContent).toBe('');
  });

  it('la etiqueta nunca aparece dos veces', () => {
    for (const defined of [true, false]) {
      vi.restoreAllMocks();
      mockFormfield(defined);
      const host = mount('Puerta');
      const visible = (host.querySelector('ha-formfield')?.getAttribute('label') ?? '') + (host.querySelector('ha-checkbox')!.textContent ?? '');
      expect(visible).toBe('Puerta');
    }
  });
});
