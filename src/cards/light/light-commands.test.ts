import { describe, expect, it } from 'vitest';
import { brightnessCommand, colorCommand, colorTempCommand, effectCommand, sendLightCommand } from './light-commands';

describe('órdenes de light.turn_on', () => {
  it('brillo en porcentaje acotado entre 1 y 100', () => {
    expect(brightnessCommand('light.sala', 70.4)).toEqual({ entity_id: 'light.sala', brightness_pct: 70 });
    expect(brightnessCommand('light.sala', 0)).toEqual({ entity_id: 'light.sala', brightness_pct: 1 });
    expect(brightnessCommand('light.sala', 500)).toEqual({ entity_id: 'light.sala', brightness_pct: 100 });
  });
  it('temperatura de color en kelvin', () => {
    expect(colorTempCommand('light.sala', 2700.4)).toEqual({ entity_id: 'light.sala', color_temp_kelvin: 2700 });
  });
  it('color por tono y saturación', () => {
    expect(colorCommand('light.sala', 200, 80)).toEqual({ entity_id: 'light.sala', hs_color: [200, 80] });
    expect(colorCommand('light.sala', 999, -5)).toEqual({ entity_id: 'light.sala', hs_color: [360, 0] });
  });
  it('efecto por nombre', () => {
    expect(effectCommand('light.sala', 'rainbow')).toEqual({ entity_id: 'light.sala', effect: 'rainbow' });
  });
  it('se envía al servicio light.turn_on', async () => {
    const calls: unknown[][] = [];
    await sendLightCommand({ states: {}, callService: async (...args: unknown[]) => void calls.push(args) } as never, brightnessCommand('light.sala', 50));
    expect(calls).toEqual([['light', 'turn_on', { entity_id: 'light.sala', brightness_pct: 50 }]]);
  });
});
