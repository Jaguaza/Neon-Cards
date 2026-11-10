import { describe, expect, it } from 'vitest';
import { favoriteCommand } from './light-commands';
import { isFavoriteActive, parseFavorites, parseHex } from './favorites';
import { footerItems } from './light-state';

describe('colores favoritos', () => {
  it('lee #rrggbb y #rgb, normalizados en minúsculas', () => {
    expect(parseHex('#FF3B30')).toEqual({ hex: '#ff3b30', rgb: [255, 59, 48] });
    expect(parseHex('#0f0')).toEqual({ hex: '#00ff00', rgb: [0, 255, 0] });
    expect(parseHex(' #0a84ff ')?.rgb).toEqual([10, 132, 255]);
  });

  it('ignora lo que no es un color', () => {
    expect(parseHex('rojo')).toBeUndefined();
    expect(parseHex('#12345')).toBeUndefined();
    expect(parseHex(42)).toBeUndefined();
    expect(parseFavorites(['#ff0000', 'nada', null, '#00ff00'])).toEqual([
      { hex: '#ff0000', rgb: [255, 0, 0] },
      { hex: '#00ff00', rgb: [0, 255, 0] },
    ]);
    expect(parseFavorites('#ff0000')).toEqual([]);
    expect(parseFavorites(undefined)).toEqual([]);
  });

  it('como mucho cinco', () => {
    const many = ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777'];
    expect(parseFavorites(many).map((color) => color.hex)).toEqual(many.slice(0, 5));
  });

  it('un favorito está activo si la luz tiene ese color (con la tolerancia del redondeo)', () => {
    const red = parseHex('#ff0000')!;
    expect(isFavoriteActive(red, { rgb_color: [255, 0, 0] })).toBe(true);
    expect(isFavoriteActive(red, { rgb_color: [254, 3, 2] })).toBe(true);
    expect(isFavoriteActive(red, { rgb_color: [255, 60, 0] })).toBe(false);
    expect(isFavoriteActive(red, {})).toBe(false);
    expect(isFavoriteActive(red, undefined)).toBe(false);
    expect(isFavoriteActive(red, { rgb_color: [255, 0] })).toBe(false);
  });

  it('la orden de un favorito manda su RGB', () => {
    expect(favoriteCommand('light.sala', [255, 59, 48])).toEqual({ entity_id: 'light.sala', rgb_color: [255, 59, 48] });
  });
});

describe('qué opciones muestra el pie', () => {
  const full = { supported_color_modes: ['color_temp', 'hs'], effect_list: ['a'] };

  it('sin favoritos no sale el icono de favoritos', () => {
    expect(footerItems(full)).toEqual(['brightness', 'color_temp', 'color', 'effects']);
  });

  it('con favoritos sale entre el color y los efectos', () => {
    expect(footerItems(full, undefined, true)).toEqual(['brightness', 'color_temp', 'color', 'favorites', 'effects']);
  });

  it('una luz sin color no ofrece favoritos aunque los haya', () => {
    expect(footerItems({ supported_color_modes: ['color_temp'] }, undefined, true)).toEqual(['brightness', 'color_temp']);
    expect(footerItems({ supported_color_modes: ['brightness'] }, undefined, true)).toEqual(['brightness']);
  });

  it('footer_options deja solo las elegidas, en el orden fijo del pie', () => {
    expect(footerItems(full, ['effects', 'brightness'], true)).toEqual(['brightness', 'effects']);
    expect(footerItems(full, ['favorites', 'color'], true)).toEqual(['color', 'favorites']);
  });

  it('elegir una opción que la luz no soporta no la añade', () => {
    expect(footerItems({ supported_color_modes: ['brightness'] }, ['brightness', 'color', 'effects'])).toEqual(['brightness']);
  });

  it('una lista vacía no deja ninguna; una clave que no es lista se ignora', () => {
    expect(footerItems(full, [], true)).toEqual([]);
    expect(footerItems(full, 'brightness' as unknown as string[], true)).toHaveLength(5);
  });
});
