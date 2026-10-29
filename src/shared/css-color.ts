/** Lista blanca de colores CSS que se aceptan en la config: hex, rgb/hsl, un nombre o `var(--x)`. */
const CSS_COLOR = /^(#[0-9a-f]{3,8}|[a-z]{3,30}|(rgb|hsl)a?\([0-9a-z%.,/\s-]{1,60}\)|var\(--[\w-]{1,60}\))$/i;

/**
 * ¿Es un color que se puede escribir tal cual en un estilo? La config viene
 * de YAML y acaba en un atributo `style`: solo pasa la lista blanca (sin `;`,
 * llaves ni comillas, así que no puede colar otras propiedades) y, donde el
 * navegador lo sabe comprobar, que CSS lo reconozca como color.
 */
export function isCssColor(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const color = value.trim();
  if (!CSS_COLOR.test(color)) return false;
  return typeof CSS === 'undefined' || typeof CSS.supports !== 'function' || CSS.supports('color', color);
}

/** `#rgb` o `#rrggbb` → `#rrggbb` (lo único que acepta `<input type=color>`); otro formato → `undefined`. */
export function toHex6(color: string): string | undefined {
  const value = color.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(value)) return value;
  if (/^#[0-9a-f]{3}$/.test(value)) return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  return undefined;
}
