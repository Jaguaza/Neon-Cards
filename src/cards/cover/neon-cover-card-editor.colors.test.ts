// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Editor = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

async function mount(config: Record<string, unknown>, language = 'es'): Promise<{ el: Editor; last: () => Record<string, unknown> }> {
  await import('./index');
  const el = document.createElement('neon-cover-card-editor') as Editor;
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

const picker = (el: Editor, key: string) => el.shadowRoot!.querySelector(`input[data-color="${key}"]`) as HTMLInputElement;
const KEYS = ['icon_color', 'status_color_open', 'status_color_moving', 'status_color_closed', 'status_color_alert'];

afterEach(() => {
  document.body.innerHTML = '';
});

describe('NeonCoverCardEditor: colores', () => {
  it('hay un selector para el icono y uno por cada estado, con el color por defecto', async () => {
    const { el } = await mount({ entity: 'cover.salon' });
    for (const key of KEYS) expect(picker(el, key)).not.toBeNull();
    expect(picker(el, 'status_color_open').value).toBe('#39e07a');
    expect(picker(el, 'status_color_moving').value).toBe('#ffb02e');
    expect(picker(el, 'status_color_closed').value).toBe('#9aa0a6');
    expect(picker(el, 'status_color_alert').value).toBe('#ff5c5c');
    expect(el.shadowRoot!.querySelector('.reset-colors')).toBeNull();
  });

  it('el selector del icono parte del primer color del halo', async () => {
    const { el } = await mount({ entity: 'cover.salon', neon_palette: 'custom', neon_color1: '#123456' });
    expect(picker(el, 'icon_color').value).toBe('#123456');
  });

  it('elegir un color lo guarda en su clave y los demás no se tocan', async () => {
    const { el, last } = await mount({ entity: 'cover.salon' });
    const input = picker(el, 'status_color_closed');
    input.value = '#aabbcc';
    input.dispatchEvent(new Event('input'));
    expect(last().status_color_closed).toBe('#aabbcc');
    const icon = picker(el, 'icon_color');
    icon.value = '#ff0000';
    icon.dispatchEvent(new Event('input'));
    expect(last().icon_color).toBe('#ff0000');
    expect(last().status_color_closed).toBe('#aabbcc');
    expect('status_color_open' in last()).toBe(false);
  });

  it('un color configurado sale en su selector y aparece «Restablecer colores»', async () => {
    const { el } = await mount({ entity: 'cover.salon', status_color_open: '#102030' });
    expect(picker(el, 'status_color_open').value).toBe('#102030');
    expect(el.shadowRoot!.querySelector('.reset-colors')?.textContent?.trim()).toBe('Restablecer colores');
  });

  it('con un formato que el selector no entiende se muestra el de por defecto sin tocar la config', async () => {
    const { el, last } = await mount({ entity: 'cover.salon', status_color_open: 'var(--success-color)' });
    expect(picker(el, 'status_color_open').value).toBe('#39e07a');
    expect(last().status_color_open).toBe('var(--success-color)');
  });

  it('Restablecer colores quita los cinco de una vez, con un solo config-changed', async () => {
    const { el, last } = await mount({ entity: 'cover.salon', name: 'Salón', icon_color: '#111111', status_color_open: '#222222', status_color_alert: '#333333' });
    let events = 0;
    el.addEventListener('config-changed', () => events++);
    (el.shadowRoot!.querySelector('.reset-colors') as HTMLButtonElement).click();
    expect(events).toBe(1);
    for (const key of KEYS) expect(key in last()).toBe(false);
    expect(last().name).toBe('Salón');
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.reset-colors')).toBeNull();
  });

  it('los textos salen en inglés', async () => {
    const { el } = await mount({ entity: 'cover.salon' }, 'en');
    const text = el.shadowRoot!.textContent ?? '';
    expect(text).toContain('Icon colour');
    expect(text).toContain('State colour');
    expect(text).toContain('Opening or closing');
  });
});
