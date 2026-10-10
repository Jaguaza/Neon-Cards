// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Editor = HTMLElement & { setConfig(c: unknown): void; hass: unknown; updateComplete: Promise<boolean> };

async function mount(config: Record<string, unknown>): Promise<{ el: Editor; last: () => Record<string, unknown> }> {
  await import('./index');
  const el = document.createElement('neon-sensor-card-editor') as Editor;
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
const qa = (el: Editor, sel: string) => el.shadowRoot!.querySelectorAll(sel);

describe('NeonSensorCardEditor', () => {
  it('no ofrece desactivar el gráfico; sí las horas de histórico', async () => {
    const { el } = await mount({ entity: 'sensor.temp' });
    expect(el.shadowRoot!.textContent).not.toContain('Mostrar gráfico');
    expect(q(el, '#graph-hours')).not.toBeNull();
  });

  it('el selector de efecto ofrece normal, halo y un color; halo por defecto con paleta', async () => {
    const { el } = await mount({ entity: 'sensor.temp' });
    const select = q(el, '#effect') as HTMLSelectElement;
    expect([...select.options].map((o) => o.value)).toEqual(['normal', 'halo', 'single']);
    expect(select.value).toBe('halo');
    expect(q(el, '#palette')).not.toBeNull();
  });

  it('un color muestra un único selector de color y no la paleta', async () => {
    const { el } = await mount({ entity: 'sensor.temp', neon_effect: 'single' });
    expect(q(el, '#palette')).toBeNull();
    expect(qa(el, 'input[type="color"]').length).toBe(1);
  });

  it('normal no muestra ni paleta ni colores', async () => {
    const { el } = await mount({ entity: 'sensor.temp', neon_effect: 'normal' });
    expect(q(el, '#palette')).toBeNull();
    expect(qa(el, 'input[type="color"]').length).toBe(0);
  });

  it('elegir el efecto guarda neon_effect; halo (el de por defecto) lo elimina', async () => {
    const { el, last } = await mount({ entity: 'sensor.temp' });
    const select = q(el, '#effect') as HTMLSelectElement;
    select.value = 'single';
    select.dispatchEvent(new Event('change'));
    expect(last().neon_effect).toBe('single');
    await el.updateComplete;
    (q(el, '#effect') as HTMLSelectElement).value = 'halo';
    q(el, '#effect')!.dispatchEvent(new Event('change'));
    expect('neon_effect' in last()).toBe(false);
  });

  it('umbrales desactivados: solo se ve el interruptor', async () => {
    const { el } = await mount({ entity: 'sensor.temp' });
    expect(q(el, '#th-low')).toBeNull();
    expect(q(el, '#th-high')).toBeNull();
  });

  it('umbrales activados (sensor): dos campos numéricos y tres colores', async () => {
    const { el } = await mount({ entity: 'sensor.temp', neon_effect: 'normal', thresholds_enabled: true });
    expect(q(el, '#th-low')).not.toBeNull();
    expect(q(el, '#th-high')).not.toBeNull();
    expect(qa(el, 'input[type="color"]').length).toBe(3);
  });

  it('escribir los umbrales guarda números', async () => {
    const { el, last } = await mount({ entity: 'sensor.temp', thresholds_enabled: true });
    const low = q(el, '#th-low') as HTMLInputElement;
    low.value = '22';
    low.dispatchEvent(new Event('input'));
    expect(last().threshold_low).toBe(22);
    await el.updateComplete;
    const high = q(el, '#th-high') as HTMLInputElement;
    high.value = '26';
    high.dispatchEvent(new Event('input'));
    expect(last().threshold_high).toBe(26);
    expect(last().threshold_low).toBe(22);
  });

  it('umbrales activados (binary_sensor): estado de alerta y dos colores', async () => {
    const { el } = await mount({ entity: 'binary_sensor.puerta', neon_effect: 'normal', thresholds_enabled: true });
    expect(q(el, '#alert-state')).not.toBeNull();
    expect(q(el, '#th-low')).toBeNull();
    expect(qa(el, 'input[type="color"]').length).toBe(2);
  });

  it('activar el interruptor guarda thresholds_enabled; desactivarlo lo elimina', async () => {
    const { el, last } = await mount({ entity: 'sensor.temp' });
    const boxes = qa(el, 'input[type="checkbox"]');
    const box = boxes[boxes.length - 1] as HTMLInputElement;
    box.checked = true;
    box.dispatchEvent(new Event('change'));
    expect(last().thresholds_enabled).toBe(true);
    await el.updateComplete;
    const boxes2 = qa(el, 'input[type="checkbox"]');
    const box2 = boxes2[boxes2.length - 1] as HTMLInputElement;
    box2.checked = false;
    box2.dispatchEvent(new Event('change'));
    expect('thresholds_enabled' in last()).toBe(false);
  });
});
