import { describe, expect, it } from 'vitest';
import { hsToCss, kelvinToCss, lightColorCss, rgbToCss } from './light-color';

describe('color del icono', () => {
  it('rgb a CSS, acotado a 0-255', () => {
    expect(rgbToCss(0, 255, 0)).toBe('rgb(0, 255, 0)');
    expect(rgbToCss(-5, 300.4, 12.6)).toBe('rgb(0, 255, 13)');
  });

  it('tono y saturación: 100 es el color puro y 0 el blanco', () => {
    expect(hsToCss(120, 100)).toBe('hsl(120, 100%, 50%)');
    expect(hsToCss(240, 0)).toBe('hsl(240, 100%, 100%)');
    expect(hsToCss(0, 50)).toBe('hsl(0, 100%, 75%)');
  });

  it('la temperatura cálida es anaranjada, la neutra casi blanca y la fría azulada', () => {
    expect(kelvinToCss(2000)).toBe('rgb(255, 137, 14)');
    expect(kelvinToCss(6600)).toBe('rgb(255, 255, 255)');
    const cold = kelvinToCss(10000).match(/\d+/g)!.map(Number);
    expect(cold[2]).toBe(255);
    expect(cold[0]).toBeLessThan(cold[2]);
  });

  it('el color real de la luz: rgb_color manda, luego hs_color', () => {
    expect(lightColorCss({ rgb_color: [0, 255, 0], hs_color: [10, 10] })).toBe('rgb(0, 255, 0)');
    expect(lightColorCss({ hs_color: [240, 100] })).toBe('hsl(240, 100%, 50%)');
  });

  it('una luz sin color (solo brillo o apagada) no tiene color propio', () => {
    expect(lightColorCss({})).toBeUndefined();
    expect(lightColorCss(undefined)).toBeUndefined();
    expect(lightColorCss({ rgb_color: [1, 2] })).toBeUndefined();
  });

  it('mientras se arrastra, manda la barra: tono con la saturación de la luz, o temperatura', () => {
    expect(lightColorCss({ hs_color: [10, 60], rgb_color: [255, 0, 0] }, { control: 'color', value: 120 })).toBe('hsl(120, 100%, 70%)');
    expect(lightColorCss({}, { control: 'color', value: 200 })).toBe('hsl(200, 100%, 50%)');
    expect(lightColorCss({ hs_color: [0, 0] }, { control: 'color', value: 120 })).toBe('hsl(120, 100%, 50%)');
    expect(lightColorCss({ rgb_color: [0, 255, 0] }, { control: 'color_temp', value: 6600 })).toBe('rgb(255, 255, 255)');
    expect(lightColorCss({ rgb_color: [0, 255, 0] }, { control: 'brightness', value: 50 })).toBe('rgb(0, 255, 0)');
  });
});
