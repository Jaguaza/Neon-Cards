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

  it('ofrece cuatro iconos en fichas, con el candado marcado por defecto', async () => {
    const { el } = await mount({ entity: 'lock.puerta' });
    const tiles = Array.from(el.shadowRoot!.querySelectorAll('.icon-tile')) as HTMLElement[];
    expect(tiles.map((t) => t.dataset.icon)).toEqual(['padlock', 'door', 'garage_roller', 'garage_sliding']);
    expect(tiles.map((t) => t.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false', 'false']);
    expect(tiles.map((t) => t.textContent!.trim())).toEqual(['Candado', 'Puerta abriéndose', 'Garaje con puerta enrollable', 'Garaje con puerta corredera']);
  });

  it('marca la ficha del icono configurado', async () => {
    const { el } = await mount({ entity: 'lock.puerta', lock_icon: 'garage_sliding' });
    const checked = Array.from(el.shadowRoot!.querySelectorAll('.icon-tile[aria-checked="true"]')) as HTMLElement[];
    expect(checked.map((t) => t.dataset.icon)).toEqual(['garage_sliding']);
  });

  it('cada ficha trae su dibujo ya pintado (cerrado)', async () => {
    const { el } = await mount({ entity: 'lock.puerta' });
    const d = (type: string, sel: string) => el.shadowRoot!.querySelector(`.icon-tile[data-icon="${type}"] ${sel}`)?.getAttribute('d');
    expect(d('padlock', '.shackle')).toBe('M8.5 17.5V10A3.5 3.5 0 0 1 15.5 10V13.6');
    expect(d('door', '.leaf')).toMatch(/^M6\.3 5L17\.7 5/);
    expect(d('garage_sliding', '.panel')).toBe('M5 12H19V14H5ZM5 15H19V17H5ZM5 18H19V20H5ZM5 12H6V20H5Z');
    expect(d('garage_roller', '.slats')).toBe('M5 12H19V14H5ZM5 15H19V17H5ZM5 18H19V20H5Z');
  });

  it('elegir un icono guarda lock_icon; elegir el candado lo quita de la config', async () => {
    const { el, last } = await mount({ entity: 'lock.puerta' });
    const tile = (type: string) => el.shadowRoot!.querySelector(`.icon-tile[data-icon="${type}"]`) as HTMLButtonElement;
    tile('garage_roller').click();
    expect(last().lock_icon).toBe('garage_roller');
    await el.updateComplete;
    expect(tile('garage_roller').getAttribute('aria-checked')).toBe('true');
    tile('padlock').click();
    expect('lock_icon' in last()).toBe(false);
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
