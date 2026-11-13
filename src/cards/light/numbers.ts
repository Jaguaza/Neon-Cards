/** Un número finito (descarta `NaN`, `Infinity` y todo lo que no sea un número): los atributos de una entidad llegan sin tipar. */
export const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

/** Acota `value` entre `min` y `max`. */
export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
