// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Editor = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

const STATES = {
  'binary_sensor.mov_salon': { entity_id: 'binary_sensor.mov_salon', state: 'on', attributes: { device_class: 'motion', friendly_name: 'Movimiento salón' } },
  'binary_sensor.mov_cocina': { entity_id: 'binary_sensor.mov_cocina', state: 'off', attributes: { device_class: 'motion', friendly_name: 'Movimiento cocina' } },
  'binary_sensor.mov_roto': { entity_id: 'binary_sensor.mov_roto', state: 'unavailable', attributes: { device_class: 'motion', friendly_name: 'Movimiento roto' } },
  'binary_sensor.puerta': { entity_id: 'binary_sensor.puerta', state: 'off', attributes: { device_class: 'door', friendly_name: 'Puerta' } },
  'sensor.temperatura': { entity_id: 'sensor.temperatura', state: '21', attributes: { friendly_name: 'Temperatura' } },
};

async function mount(config: Record<string, unknown>, language = 'es'): Promise<{ el: Editor; last: () => Record<string, unknown> }> {
  await import('./index');
  const el = document.createElement('neon-alarm-card-editor') as Editor;
  let latest: Record<string, unknown> = config;
  el.addEventListener('config-changed', (ev) => {
    latest = (ev as CustomEvent).detail.config;
  });
  el.hass = { locale: { language }, states: STATES };
  el.setConfig(config);
  document.body.appendChild(el);
  await el.updateComplete;
  return { el, last: () => latest };
}

const q = (el: Editor, sel: string) => el.shadowRoot!.querySelector(sel);
const change = (select: HTMLSelectElement, value: string) => {
  select.value = value;
  select.dispatchEvent(new Event('change'));
};

describe('NeonAlarmCardEditor', () => {
  it('el selector de entidad solo ofrece el dominio alarm_control_panel', async () => {
    const { el } = await mount({ entity: 'alarm_control_panel.casa' });
    expect((q(el, 'ha-entity-picker') as unknown as { includeDomains: string[] }).includeDomains).toEqual(['alarm_control_panel']);
  });

  it('el tamaño grande es el valor por defecto y no se guarda; los otros sí', async () => {
    const { el, last } = await mount({ entity: 'alarm_control_panel.casa' });
    const select = q(el, '#size') as HTMLSelectElement;
    expect(select.value).toBe('large');
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['compact', 'medium', 'large']);
    change(select, 'compact');
    expect(last().size).toBe('compact');
    await el.updateComplete;
    change(q(el, '#size') as HTMLSelectElement, 'large');
    expect('size' in last()).toBe(false);
  });

  it('el subtítulo solo se ofrece en la grande y el texto libre solo con «personalizado»', async () => {
    const { el, last } = await mount({ entity: 'alarm_control_panel.casa' });
    const select = q(el, '#subtitle-type') as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['none', 'state', 'custom', 'last-changed', 'last-updated']);
    expect(q(el, '#subtitle')).toBeNull();
    change(select, 'custom');
    expect(last().subtitle_type).toBe('custom');
    await el.updateComplete;
    expect(q(el, '#subtitle')).not.toBeNull();
    const medium = await mount({ size: 'medium' });
    expect(q(medium.el, '#subtitle-type')).toBeNull();
  });

  it('la confirmación está desactivada por defecto; al activarla se guarda y al desactivarla se quita', async () => {
    const { el, last } = await mount({ entity: 'alarm_control_panel.casa' });
    const toggle = q(el, 'ha-switch') as unknown as { checked: boolean; dispatchEvent(e: Event): boolean };
    expect(toggle.checked).toBe(false);
    toggle.checked = true;
    toggle.dispatchEvent(new Event('change'));
    expect(last().confirmation).toBe(true);
    toggle.checked = false;
    toggle.dispatchEvent(new Event('change'));
    expect('confirmation' in last()).toBe(false);
  });

  it('los tipos de sensor: cuatro huecos en la grande, dos en la mediana y ninguno en la compacta', async () => {
    const count = async (size: string) => (await mount({ size })).el.shadowRoot!.querySelectorAll('.sensor-slot').length;
    expect([await count('large'), await count('medium'), await count('compact')]).toEqual([4, 2, 0]);
  });

  it('cada hueco ofrece los tipos de seguridad y las cerraduras, y escribe footer_sensors en orden', async () => {
    const { el, last } = await mount({ entity: 'alarm_control_panel.casa' });
    const first = q(el, '#sensor-0') as HTMLSelectElement;
    const values = Array.from(first.options).map((o) => o.value);
    expect(values[0]).toBe('');
    expect(values).toContain('motion');
    expect(values).toContain('vibration');
    expect(values).toContain('lock');
    change(first, 'motion');
    expect(last().footer_sensors).toEqual(['motion']);
    await el.updateComplete;
    change(q(el, '#sensor-1') as HTMLSelectElement, 'door');
    expect(last().footer_sensors).toEqual(['motion', 'door']);
  });

  it('dejar un hueco en «Ninguno» compacta la lista y sin ninguno quita la clave', async () => {
    const { el, last } = await mount({ footer_sensors: ['motion', 'door'] });
    change(q(el, '#sensor-0') as HTMLSelectElement, '');
    expect(last().footer_sensors).toEqual(['door']);
    await el.updateComplete;
    change(q(el, '#sensor-0') as HTMLSelectElement, '');
    expect('footer_sensors' in last()).toBe(false);
  });

  it('un tipo puesto por YAML que no está en la lista se conserva como opción', async () => {
    const { el } = await mount({ footer_sensors: ['inventado'] });
    const first = q(el, '#sensor-0') as HTMLSelectElement;
    expect(first.value).toBe('inventado');
  });

  it('paleta personalizada: muestra los tres colores y los escribe', async () => {
    const { el, last } = await mount({ neon_palette: 'custom' });
    expect(el.shadowRoot!.querySelectorAll('.custom-colors-grid input[type="color"]').length).toBe(3);
    const input = el.shadowRoot!.querySelector('.custom-colors-grid input[type="color"]') as HTMLInputElement;
    input.value = '#112233';
    input.dispatchEvent(new Event('input'));
    expect(last().neon_color1).toBe('#112233');
  });

  it('las tres acciones se editan con el selector de acciones', async () => {
    const { el } = await mount({ entity: 'alarm_control_panel.casa' });
    const editors = Array.from(el.shadowRoot!.querySelectorAll('hui-action-editor')) as unknown as Array<{ configValue: string; config: { action: string } }>;
    expect(editors.map((e) => [e.configValue, e.config.action])).toEqual([
      ['tap_action', 'toggle'],
      ['hold_action', 'more-info'],
      ['double_tap_action', 'none'],
    ]);
  });

  it('el check «solo sensores activos» está desactivado por defecto; al marcarlo se guarda y al desmarcarlo se quita', async () => {
    const { el, last } = await mount({ footer_sensors: ['motion'] });
    const check = q(el, 'ha-checkbox:not([data-entity])') as unknown as { checked: boolean; dispatchEvent(e: Event): boolean };
    expect(check.checked).toBe(false);
    check.checked = true;
    check.dispatchEvent(new Event('change'));
    expect(last().footer_only_active).toBe(true);
    check.checked = false;
    check.dispatchEvent(new Event('change'));
    expect('footer_only_active' in last()).toBe(false);
  });

  it('la compacta, que no tiene pie, no ofrece «solo sensores activos» ni la lista de sensores', async () => {
    const { el } = await mount({ size: 'compact', footer_sensors: ['motion'] });
    expect(q(el, 'ha-checkbox')).toBeNull();
    expect(q(el, '.sensor-checks')).toBeNull();
  });

  it('al elegir un tipo sale la lista de los sensores de ese tipo que hay en HA, con todos los del tipo y solo ellos', async () => {
    const { el } = await mount({ footer_sensors: ['motion'] });
    const checks = Array.from(el.shadowRoot!.querySelectorAll('ha-checkbox[data-entity]')) as unknown as Array<{ dataset: { entity: string } }>;
    expect(checks.map((c) => c.dataset.entity)).toEqual(['binary_sensor.mov_cocina', 'binary_sensor.mov_roto', 'binary_sensor.mov_salon']);
    expect(el.shadowRoot!.querySelector('.sensor-checks summary')!.textContent).toBe('Ocultar sensores concretos · 0 de 3 ocultos');
  });

  it('un hueco sin tipo no muestra lista; un tipo sin sensores en HA avisa', async () => {
    const empty = await mount({ footer_sensors: [] });
    expect(q(empty.el, '.sensor-checks')).toBeNull();
    const none = await mount({ footer_sensors: ['vibration'] });
    expect(q(none.el, '.sensor-checks')!.textContent).toContain('No hay sensores de este tipo en Home Assistant.');
  });

  it('marcar un sensor lo añade a footer_excluded y desmarcarlo lo quita; sin ninguno se quita la clave', async () => {
    const { el, last } = await mount({ footer_sensors: ['motion'] });
    const check = (id: string) => q(el, `ha-checkbox[data-entity="${id}"]`) as unknown as { checked: boolean; dispatchEvent(e: Event): boolean };
    const toggle = (id: string, value: boolean) => {
      check(id).checked = value;
      check(id).dispatchEvent(new Event('change'));
    };
    toggle('binary_sensor.mov_salon', true);
    expect(last().footer_excluded).toEqual(['binary_sensor.mov_salon']);
    toggle('binary_sensor.mov_cocina', true);
    expect(last().footer_excluded).toEqual(['binary_sensor.mov_salon', 'binary_sensor.mov_cocina']);
    toggle('binary_sensor.mov_salon', false);
    expect(last().footer_excluded).toEqual(['binary_sensor.mov_cocina']);
    toggle('binary_sensor.mov_cocina', false);
    expect('footer_excluded' in last()).toBe(false);
  });

  it('los sensores ya excluidos por YAML salen marcados', async () => {
    const { el } = await mount({ footer_sensors: ['motion'], footer_excluded: ['binary_sensor.mov_roto'] });
    const checked = Array.from(el.shadowRoot!.querySelectorAll('ha-checkbox[data-entity]')) as unknown as Array<{ checked: boolean; dataset: { entity: string } }>;
    expect(checked.filter((c) => c.checked).map((c) => c.dataset.entity)).toEqual(['binary_sensor.mov_roto']);
  });

  it('los textos explican qué hace cada opción: la lista de sensores avisa de que marcar OCULTA', async () => {
    const { el } = await mount({ footer_sensors: ['motion'] });
    const text = el.shadowRoot!.textContent!;
    expect(text).toContain('Marca un sensor para OCULTARLO');
    expect(text).toContain('Los que dejes sin marcar se siguen viendo');
    expect(text).toContain('Elige qué tipos de sensor enseña el pie');
    const labels = Array.from(el.shadowRoot!.querySelectorAll('ha-formfield')).map((f) => f.getAttribute('label'));
    expect(labels).toContain('Mostrar solo los sensores activos');
    expect(labels).toContain('Pedir confirmación antes de armar o desarmar');
    expect(text).toContain('esconde los que están en reposo');
    expect(text).toContain('Tipo de sensor 1');
    expect(text).toContain('Si lo dejas vacío, la tarjeta usa el nombre de la propia alarma');
  });

  it('los mismos textos explicativos existen en inglés', async () => {
    const { el } = await mount({ footer_sensors: ['motion'] }, 'en');
    const text = el.shadowRoot!.textContent!;
    expect(text).toContain('Hide specific sensors');
    expect(text).toContain('Tick a sensor to HIDE it');
    expect(text).toContain('Tick all');
    expect(text).toContain('Untick all');
    expect(text).toContain('0 of 3 hidden');
  });

  it('un sensor marcado se etiqueta como oculto y el título cuenta cuántos hay ocultos', async () => {
    const { el } = await mount({ footer_sensors: ['motion'], footer_excluded: ['binary_sensor.mov_salon'] });
    const labels = Array.from(el.shadowRoot!.querySelectorAll('.sensor-checks-list ha-formfield')).map((f) => f.getAttribute('label'));
    expect(labels).toEqual(['Movimiento cocina', 'Movimiento roto', 'Movimiento salón (oculto)']);
    expect(el.shadowRoot!.querySelector('.sensor-checks summary')!.textContent).toBe('Ocultar sensores concretos · 1 de 3 ocultos');
  });

  const bulk = (el: Editor, name: 'mark' | 'clear') => q(el, `.bulk-btn[data-bulk="${name}"]`) as HTMLButtonElement;

  it('«Marcar todos» oculta de golpe todos los sensores del tipo sin tocar los de otros tipos', async () => {
    const { el, last } = await mount({ footer_sensors: ['motion', 'door'], footer_excluded: ['binary_sensor.puerta'] });
    const motion = (el.shadowRoot!.querySelectorAll('.bulk-btn[data-bulk="mark"]')[0]) as HTMLButtonElement;
    motion.click();
    expect(last().footer_excluded).toEqual(['binary_sensor.puerta', 'binary_sensor.mov_cocina', 'binary_sensor.mov_roto', 'binary_sensor.mov_salon']);
  });

  it('«Desmarcar todos» vuelve a mostrar todos los del tipo; sin ninguno oculto se quita la clave', async () => {
    const { el, last } = await mount({ footer_sensors: ['motion'], footer_excluded: ['binary_sensor.mov_salon', 'binary_sensor.mov_cocina'] });
    bulk(el, 'clear').click();
    expect('footer_excluded' in last()).toBe(false);
  });

  it('los botones se desactivan cuando no tienen nada que hacer', async () => {
    const none = await mount({ footer_sensors: ['motion'] });
    expect(bulk(none.el, 'clear').disabled).toBe(true);
    expect(bulk(none.el, 'mark').disabled).toBe(false);
    const all = await mount({ footer_sensors: ['motion'], footer_excluded: ['binary_sensor.mov_salon', 'binary_sensor.mov_cocina', 'binary_sensor.mov_roto'] });
    expect(bulk(all.el, 'mark').disabled).toBe(true);
    expect(bulk(all.el, 'clear').disabled).toBe(false);
  });
});
