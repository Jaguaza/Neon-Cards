import { describe, expect, it } from 'vitest';
import { isCssColor, toHex6 } from './css-color';

describe('isCssColor', () => {
  it('acepta hex, rgb/hsl, nombres y var(--x)', () => {
    for (const ok of ['#fff', '#39e07a', '#39e07a80', 'rgb(255, 0, 0)', 'rgba(255,0,0,.5)', 'hsl(120 50% 50%)', 'orange', 'var(--primary-color)', '  #fff  ']) {
      expect(isCssColor(ok), ok).toBe(true);
    }
  });
  it('rechaza lo que no es un color o intenta colar otras propiedades', () => {
    for (const bad of ['', '   ', 'red; background: url(x)', 'red}', '#12', '#ggg', 'url(x)', 'expression(alert(1))', 'rgb(1,2,3); x:y', 'var(--a); color: red', '"red"', 5, null, undefined, {}]) {
      expect(isCssColor(bad), String(bad)).toBe(false);
    }
  });
});

describe('toHex6', () => {
  it('deja #rrggbb tal cual (en minúsculas) y expande #rgb', () => {
    expect(toHex6('#39E07A')).toBe('#39e07a');
    expect(toHex6('#abc')).toBe('#aabbcc');
    expect(toHex6('  #FFF  ')).toBe('#ffffff');
  });
  it('cualquier otro formato no se puede pasar a <input type=color>', () => {
    for (const other of ['rgb(1, 2, 3)', 'orange', 'var(--x)', '#12345', '#39e07a80', '']) expect(toHex6(other), other).toBeUndefined();
  });
});
