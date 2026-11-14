// @vitest-environment jsdom
import { html, render } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import type { HomeAssistant } from '../ha/types';
import { renderSubtitleField } from './subtitle-field';
import type { SubtitleFieldParams } from './subtitle-field';

const texts = { label: 'Subtítulo', custom: 'Personalizado', placeholder: 'Texto libre', computedHint: 'Se calcula a partir de la entidad.' };
const hassOf = (language: string) => ({ locale: { language }, states: {} }) as unknown as HomeAssistant;
const container = document.createElement('div');
document.body.appendChild(container);

function mount(overrides: Partial<SubtitleFieldParams> = {}) {
  const changes: Array<[string, string | undefined]> = [];
  render(renderSubtitleField({ hass: hassOf('es'), config: {}, texts, onChange: (key, value) => changes.push([key, value]), ...overrides }), container);
  return { changes, select: container.querySelector('#subtitle-type') as HTMLSelectElement, input: container.querySelector('#subtitle') as HTMLInputElement | null };
}
const choose = (select: HTMLSelectElement, value: string) => {
  select.value = value;
  select.dispatchEvent(new Event('change'));
};

afterEach(() => render(html``, container));

describe('renderSubtitleField', () => {
  it('por defecto ofrece personalizado y los datos de la entidad (sin «ninguno»), con personalizado elegido', () => {
    const { select, input } = mount();
    expect(Array.from(select.options).map((o) => [o.value, o.textContent])).toEqual([
      ['custom', 'Personalizado'],
      ['name', 'Nombre'],
      ['state', 'Estado'],
      ['last-changed', 'Último cambio'],
      ['last-updated', 'Última actualización'],
    ]);
    expect(select.value).toBe('custom');
    expect(input).not.toBeNull();
  });

  it('los nombres de los datos salen en el idioma de Home Assistant', () => {
    const { select } = mount({ hass: hassOf('en') });
    expect(Array.from(select.options).map((o) => o.textContent)).toEqual(['Personalizado', 'Name', 'State', 'Last changed', 'Last updated']);
  });

  it('el texto libre muestra el valor de la configuración y avisa al escribir', () => {
    const { input, changes } = mount({ config: { subtitle: 'Salón' } });
    expect(input!.value).toBe('Salón');
    input!.value = 'Cocina';
    input!.dispatchEvent(new InputEvent('input'));
    expect(changes).toEqual([['subtitle', 'Cocina']]);
  });

  it('con un dato de la entidad no hay campo de texto y sale la ayuda, si se da', () => {
    const { select, input } = mount({ config: { subtitle_type: 'state' } });
    expect(select.value).toBe('state');
    expect(input).toBeNull();
    expect(container.querySelector('span.native-select-label')!.textContent).toBe('Se calcula a partir de la entidad.');
  });

  it('sin ayuda no sale nada bajo el selector', () => {
    mount({ config: { subtitle_type: 'state' }, texts: { ...texts, computedHint: undefined } });
    expect(container.querySelector('span.native-select-label')).toBeNull();
  });

  it('elegir otro tipo avisa con el tipo; elegir el de por defecto avisa con undefined (no se guarda)', () => {
    const { select, changes } = mount({ config: { subtitle_type: 'state' } });
    choose(select, 'name');
    choose(select, 'custom');
    expect(changes).toEqual([
      ['subtitle_type', 'name'],
      ['subtitle_type', undefined],
    ]);
  });

  it('elegir el tipo que ya estaba, o dejarlo vacío, no avisa', () => {
    const { select, changes } = mount({ config: { subtitle_type: 'state' } });
    choose(select, 'state');
    choose(select, '');
    expect(changes).toEqual([]);
  });

  it('con tipos y valor por defecto propios (Lock y Alarm: «ninguno» por defecto)', () => {
    const { select, changes } = mount({ types: ['none', 'state', 'custom'], defaultType: 'none' });
    expect(Array.from(select.options).map((o) => [o.value, o.textContent])).toEqual([
      ['none', 'Ninguno'],
      ['state', 'Estado'],
      ['custom', 'Personalizado'],
    ]);
    expect(select.value).toBe('none');
    choose(select, 'state');
    choose(select, 'none');
    expect(changes).toEqual([['subtitle_type', 'state']]);
  });

  it('con «ninguno» por defecto, personalizado sí se guarda y saca el campo de texto', () => {
    const { select, changes } = mount({ types: ['none', 'state', 'custom'], defaultType: 'none', config: { subtitle_type: 'state' } });
    choose(select, 'custom');
    expect(changes).toEqual([['subtitle_type', 'custom']]);
  });
});
