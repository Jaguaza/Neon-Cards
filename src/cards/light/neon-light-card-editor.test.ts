// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Editor = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

async function mount(config: Record<string, unknown>, language = 'es'): Promise<{ el: Editor; last: () => Record<string, unknown> }> {
  await import('./index');
  const el = document.createElement('neon-light-card-editor') as Editor;
  let latest: Record<string, unknown> = config;
  el.addEventListener('config-changed', (ev) => {
    latest = (ev as CustomEvent).detail.config;
  });
  el.hass = { locale: { language }, states: {} };
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

afterEach(() => {
  document.body.innerHTML = '';
});

describe('NeonLightCardEditor', () => {
  it('el selector de entidad solo ofrece el dominio light', async () => {
    const { el } = await mount({ entity: 'light.sala' });
    expect((q(el, 'ha-entity-picker') as unknown as { includeDomains: string[] }).includeDomains).toEqual(['light']);
  });

  it('el nombre se guarda y, al vaciarlo, se borra de la config', async () => {
    const { el, last } = await mount({ entity: 'light.sala' });
    const input = q(el, '#name') as HTMLInputElement;
    input.value = 'Luz del salón';
    input.dispatchEvent(new InputEvent('input'));
    expect(last().name).toBe('Luz del salón');
    await el.updateComplete;
    const again = q(el, '#name') as HTMLInputElement;
    again.value = '';
    again.dispatchEvent(new InputEvent('input'));
    expect('name' in last()).toBe(false);
  });

  it('el subtítulo es personalizado por defecto, con texto libre', async () => {
    const { el, last } = await mount({ entity: 'light.sala' });
    const select = q(el, '#subtitle-type') as HTMLSelectElement;
    expect(select.value).toBe('custom');
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['custom', 'name', 'state', 'last-changed', 'last-updated']);
    const text = q(el, '#subtitle') as HTMLInputElement;
    text.value = 'Salón';
    text.dispatchEvent(new InputEvent('input'));
    expect(last().subtitle).toBe('Salón');
  });

  it('elegir un dato de la entidad guarda el tipo y quita el campo de texto; volver a personalizado lo borra', async () => {
    const { el, last } = await mount({ entity: 'light.sala' });
    change(q(el, '#subtitle-type') as HTMLSelectElement, 'state');
    expect(last().subtitle_type).toBe('state');
    await el.updateComplete;
    expect(q(el, '#subtitle')).toBeNull();
    change(q(el, '#subtitle-type') as HTMLSelectElement, 'custom');
    expect('subtitle_type' in last()).toBe(false);
  });

  it('la paleta personalizada enseña los tres colores y se guarda lo elegido', async () => {
    const { el, last } = await mount({ entity: 'light.sala', neon_palette: 'custom' });
    expect(el.shadowRoot!.querySelectorAll('.custom-colors-grid input[type="color"]')).toHaveLength(3);
    change(q(el, '#palette') as HTMLSelectElement, 'sunset');
    expect(last().neon_palette).toBe('sunset');
  });

  it('las tres acciones salen con pulsar = alternar, mantener = más información y doble toque = nada', async () => {
    const { el } = await mount({ entity: 'light.sala' });
    const editors = Array.from(el.shadowRoot!.querySelectorAll('hui-action-editor')) as unknown as Array<{ config: { action: string }; configValue: string }>;
    expect(editors.map((e) => [e.configValue, e.config.action])).toEqual([
      ['tap_action', 'toggle'],
      ['hold_action', 'more-info'],
      ['double_tap_action', 'none'],
    ]);
  });

  it('los textos salen en el idioma de Home Assistant', async () => {
    const es = await mount({ entity: 'light.sala' });
    expect(es.el.shadowRoot!.querySelector('.section-header')!.textContent).toBe('Configuración principal');
    document.body.innerHTML = '';
    const en = await mount({ entity: 'light.sala' }, 'en');
    expect(en.el.shadowRoot!.querySelector('.section-header')!.textContent).toBe('Main configuration');
  });
});
