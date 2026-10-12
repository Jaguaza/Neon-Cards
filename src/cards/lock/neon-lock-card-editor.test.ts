// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Editor = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

async function mount(config: Record<string, unknown>): Promise<{ el: Editor; last: () => Record<string, unknown> }> {
  await import('./index');
  const el = document.createElement('neon-lock-card-editor') as Editor;
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

describe('NeonLockCardEditor', () => {
  it('el selector de entidad solo ofrece el dominio lock', async () => {
    const { el } = await mount({ entity: 'lock.puerta' });
    expect((q(el, 'ha-entity-picker') as unknown as { includeDomains: string[] }).includeDomains).toEqual(['lock']);
  });

  it('el subtítulo ofrece estado (por defecto), personalizado, cambio, actualización y ninguno', async () => {
    const { el } = await mount({ entity: 'lock.puerta' });
    const select = q(el, '#subtitle-type') as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['state', 'custom', 'last-changed', 'last-updated', 'none']);
    expect(select.value).toBe('state');
    expect(q(el, '#subtitle')).toBeNull();
  });

  it('elegir personalizado guarda subtitle_type y muestra el texto libre; estado lo elimina', async () => {
    const { el, last } = await mount({ entity: 'lock.puerta' });
    const select = q(el, '#subtitle-type') as HTMLSelectElement;
    select.value = 'custom';
    select.dispatchEvent(new Event('change'));
    expect(last().subtitle_type).toBe('custom');
    await el.updateComplete;
    expect(q(el, '#subtitle')).not.toBeNull();
    (q(el, '#subtitle-type') as HTMLSelectElement).value = 'state';
    q(el, '#subtitle-type')!.dispatchEvent(new Event('change'));
    expect('subtitle_type' in last()).toBe(false);
  });

  it('paleta custom muestra tres selectores de color', async () => {
    const { el } = await mount({ entity: 'lock.puerta', neon_palette: 'custom' });
    expect(el.shadowRoot!.querySelectorAll('input[type="color"]').length).toBe(3);
  });

  it('tiene tres editores de acción (tap, hold, double tap)', async () => {
    const { el } = await mount({ entity: 'lock.puerta' });
    expect(el.shadowRoot!.querySelectorAll('hui-action-editor').length).toBe(3);
  });
});
