// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Editor = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

async function mount(config: Record<string, unknown>, language = 'es'): Promise<{ el: Editor; last: () => Record<string, unknown>; events: () => number }> {
  await import('./index');
  const el = document.createElement('neon-alarm-card-editor') as Editor;
  let latest: Record<string, unknown> = config;
  let count = 0;
  el.addEventListener('config-changed', (ev) => {
    latest = (ev as CustomEvent).detail.config;
    count += 1;
  });
  el.hass = { locale: { language }, states: {} };
  el.setConfig(config);
  document.body.appendChild(el);
  await el.updateComplete;
  return { el, last: () => latest, events: () => count };
}

const picker = (el: Editor, key: string) => el.shadowRoot!.querySelector(`input[data-color="${key}"]`) as HTMLInputElement;
const choose = (el: Editor, key: string, value: string) => {
  const input = picker(el, key);
  input.value = value;
  input.dispatchEvent(new Event('input'));
};
const resetButton = (el: Editor) => el.shadowRoot!.querySelector('.reset-colors') as HTMLButtonElement | null;

describe('editor · colores', () => {
  it('hay un selector por cada grupo del punto de estado y uno para los sensores activos', async () => {
    const { el } = await mount({ entity: 'alarm_control_panel.casa' });
    const keys = Array.from(el.shadowRoot!.querySelectorAll<HTMLInputElement>('input[data-color]')).map((i) => i.dataset.color);
    expect(keys).toEqual(['status_color_disarmed', 'status_color_armed_home', 'status_color_armed_away', 'status_color_armed_night', 'status_color_armed_vacation', 'status_color_armed_custom_bypass', 'status_color_transition', 'status_color_triggered', 'status_color_unavailable', 'sensor_active_color']);
  });

  it('sin configurar cada selector parte del color que ya tiene la tarjeta', async () => {
    const { el } = await mount({});
    expect(picker(el, 'status_color_disarmed').value).toBe('#39e07a');
    expect(picker(el, 'status_color_armed_home').value).toBe('#ffb02e');
    expect(picker(el, 'status_color_triggered').value).toBe('#ff5c5c');
    expect(picker(el, 'sensor_active_color').value).toBe('#ffb02e');
  });

  it('los textos explican qué colores son (ES)', async () => {
    const { el } = await mount({});
    const text = el.shadowRoot!.textContent!;
    expect(text).toContain('Punto de estado (el puntito junto al estado de la alarma)');
    expect(text).toContain('En transición (pendiente, armando y desarmando)');
    expect(text).toContain('No disponible o sin entidad');
    expect(text).toContain('Color con el que se pintan los sensores que están activos, en el pie y en la lista.');
  });

  it('los textos existen en inglés', async () => {
    const { el } = await mount({}, 'en');
    const text = el.shadowRoot!.textContent!;
    expect(text).toContain('State dot (the small dot next to the alarm state)');
    expect(text).toContain('Transitioning (pending, arming and disarming)');
  });

  it('elegir un color lo escribe en su clave; las demás no se tocan', async () => {
    const { el, last } = await mount({ entity: 'alarm_control_panel.casa' });
    choose(el, 'status_color_armed_away', '#123456');
    expect(last().status_color_armed_away).toBe('#123456');
    choose(el, 'sensor_active_color', '#abcdef');
    expect(last().sensor_active_color).toBe('#abcdef');
    expect('status_color_armed_home' in last()).toBe(false);
  });

  it('un color ya configurado (en #rgb o #rrggbb) sale en su selector; rgb() o un nombre vuelven al de por defecto', async () => {
    const { el } = await mount({ status_color_armed_away: '#ABC', status_color_armed_home: '#112233', status_color_armed_night: 'rgb(1, 2, 3)', status_color_disarmed: 'orange' });
    expect(picker(el, 'status_color_armed_away').value).toBe('#aabbcc');
    expect(picker(el, 'status_color_armed_home').value).toBe('#112233');
    expect(picker(el, 'status_color_armed_night').value).toBe('#7c6cff');
    expect(picker(el, 'status_color_disarmed').value).toBe('#39e07a');
  });

  it('el botón de restablecer solo sale si hay algún color cambiado y quita todos de una vez', async () => {
    const none = await mount({ entity: 'alarm_control_panel.casa' });
    expect(resetButton(none.el)).toBeNull();
    const { el, last, events } = await mount({ entity: 'alarm_control_panel.casa', name: 'Mi alarma', status_color_armed_away: '#111111', status_color_transition: '#222222', sensor_active_color: '#333333' });
    expect(resetButton(el)).not.toBeNull();
    resetButton(el)!.click();
    expect(events()).toBe(1);
    expect(last()).toEqual({ entity: 'alarm_control_panel.casa', name: 'Mi alarma' });
  });

  it('la compacta no tiene sensores que pintar: sin el color de sensores activos, pero con los del punto de estado', async () => {
    const { el } = await mount({ size: 'compact' });
    const keys = Array.from(el.shadowRoot!.querySelectorAll<HTMLInputElement>('input[data-color]')).map((i) => i.dataset.color);
    expect(keys).toHaveLength(9);
    expect(keys).not.toContain('sensor_active_color');
    expect(el.shadowRoot!.textContent).not.toContain('Sensores activos');
    expect(el.shadowRoot!.textContent).toContain('Punto de estado');
  });

  it('en la compacta, restablecer no toca el color de sensores (por si vuelve a la grande)', async () => {
    const { el, last } = await mount({ size: 'compact', status_color_armed_away: '#111111', sensor_active_color: '#333333' });
    resetButton(el)!.click();
    expect(last()).toEqual({ size: 'compact', sensor_active_color: '#333333' });
  });

  it('en la compacta, un color de sensores heredado no hace que salga el botón de restablecer', async () => {
    const { el } = await mount({ size: 'compact', sensor_active_color: '#333333' });
    expect(resetButton(el)).toBeNull();
  });
});
