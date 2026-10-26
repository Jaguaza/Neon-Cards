// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Editor = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

async function mount(config: Record<string, unknown>): Promise<{ el: Editor; last: () => Record<string, unknown> }> {
  await import('./index');
  const el = document.createElement('neon-alarm-card-editor') as Editor;
  let latest: Record<string, unknown> = config;
  el.addEventListener('config-changed', (ev) => {
    latest = (ev as CustomEvent).detail.config;
  });
  el.hass = { locale: { language: 'es' }, states: {} };
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

  it('los tipos de sensor: tres huecos en la grande, dos en la mediana y ninguno en la compacta', async () => {
    const count = async (size: string) => (await mount({ size })).el.shadowRoot!.querySelectorAll('.sensor-slot').length;
    expect([await count('large'), await count('medium'), await count('compact')]).toEqual([3, 2, 0]);
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
    expect(el.shadowRoot!.querySelectorAll('input[type="color"]').length).toBe(3);
    const input = el.shadowRoot!.querySelector('input[type="color"]') as HTMLInputElement;
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
});
