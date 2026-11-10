import { MAX_FAVORITES } from './constants';

export type Rgb = [number, number, number];

/** Un color favorito: el hexadecimal normalizado (`#rrggbb`) y su RGB. */
export interface FavoriteColor {
  hex: string;
  rgb: Rgb;
}

/** Diferencia máxima (suma de los tres canales) para dar por «el mismo» el color de la luz y un favorito: Home Assistant redondea al convertir entre modos de color. */
const SAME_COLOR_TOLERANCE = 24;

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

/** `#rgb` o `#rrggbb` a color; cualquier otra cosa, `undefined`. */
export function parseHex(value: unknown): FavoriteColor | undefined {
  if (typeof value !== 'string' || !HEX.test(value.trim())) return undefined;
  let digits = value.trim().slice(1).toLowerCase();
  if (digits.length === 3) digits = [...digits].map((digit) => digit + digit).join('');
  const number = parseInt(digits, 16);
  return { hex: `#${digits}`, rgb: [(number >> 16) & 255, (number >> 8) & 255, number & 255] };
}

/** Los colores válidos de `favorite_colors`, como mucho `MAX_FAVORITES`; lo que no sea un color se ignora. */
export function parseFavorites(value: unknown): FavoriteColor[] {
  if (!Array.isArray(value)) return [];
  return value.map(parseHex).filter((color): color is FavoriteColor => color !== undefined).slice(0, MAX_FAVORITES);
}

/** ¿Es este favorito el color que tiene ahora la luz (`rgb_color`)? */
export function isFavoriteActive(favorite: FavoriteColor, attributes: Record<string, unknown> | undefined): boolean {
  const rgb = attributes?.rgb_color;
  if (!Array.isArray(rgb) || rgb.length < 3 || !rgb.slice(0, 3).every(isNumber)) return false;
  const distance = Math.abs(rgb[0] - favorite.rgb[0]) + Math.abs(rgb[1] - favorite.rgb[1]) + Math.abs(rgb[2] - favorite.rgb[2]);
  return distance <= SAME_COLOR_TOLERANCE;
}
