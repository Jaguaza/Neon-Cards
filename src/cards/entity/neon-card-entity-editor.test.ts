// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Editor = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

async function mount(config: Record<string, unknown>, language = 'es'): Promise<{ el: Editor; last: () => Record<string, unknown> }> {
  await import('./index');
  const el = document.createElement('neon-card-entity-editor') as Editor;
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

describe('NeonCardEntityEditor', () => {
  it('el interruptor del punto de estado lleva su etiqueta dentro, también en HA 2026.11 (sin ha-formfield)', async () => {
    const { el } = await mount({ entity: 'sensor.temperatura' });
    const sw = q(el, '.editor-section > ha-switch') as unknown as HTMLElement;
    expect(sw.textContent!.trim()).toBe('Mostrar punto de estado');
    expect(q(el, 'ha-formfield')).toBeNull();
  });

  it('la etiqueta sale en inglés con el HA en inglés', async () => {
    const { el } = await mount({ entity: 'sensor.temperatura' }, 'en');
    expect((q(el, '.editor-section > ha-switch') as HTMLElement).textContent!.trim()).toBe('Show status dot');
  });

  it('el interruptor está activo por defecto y apagarlo guarda show_status_dot: false', async () => {
    const { el, last } = await mount({ entity: 'sensor.temperatura' });
    const sw = q(el, '.editor-section > ha-switch') as unknown as HTMLInputElement;
    expect(sw.checked).toBe(true);
    sw.checked = false;
    sw.dispatchEvent(new Event('change'));
    expect(last().show_status_dot).toBe(false);
  });
});
