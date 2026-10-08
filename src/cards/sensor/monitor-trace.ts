/**
 * Geometría pura del trazo tipo monitor de constantes vitales: sin DOM,
 * sin Lit — solo números y cadenas `d` de SVG (testeable en Node).
 *
 * El SVG usa un viewBox fijo (`TRACE_WIDTH`×`TRACE_HEIGHT`) con
 * `preserveAspectRatio="none"` y `vector-effect: non-scaling-stroke`, así
 * que la geometría no depende del tamaño real de la tarjeta.
 */

export const TRACE_WIDTH = 200;
export const TRACE_HEIGHT = 60;
/** Margen vertical para que el halo del trazo no se recorte. */
const PAD = 6;

export interface SeriesPoint {
  time: number;
  value: number;
}

/** Valor numérico de un estado: números tal cual, binary_sensor on=1/off=0. */
export function toNumericState(state: string, domain: string): number | null {
  if (domain === 'binary_sensor') {
    if (state === 'on') return 1;
    if (state === 'off') return 0;
    return null;
  }
  if (state === '' || state === 'unknown' || state === 'unavailable') return null;
  const n = Number(state);
  return Number.isFinite(n) ? n : null;
}

/**
 * Reparte la serie en `buckets` tramos de igual duración entre `start` y
 * `end`: media de los puntos de cada tramo; si un tramo no tiene puntos
 * mantiene el último valor conocido (un sensor conserva su valor hasta
 * que cambia). Antes del primer punto se rellena con ese primer valor.
 */
export function resampleSeries(points: SeriesPoint[], start: number, end: number, buckets: number): number[] {
  if (!points.length || buckets < 1 || end <= start) return [];
  const sorted = [...points].sort((a, b) => a.time - b.time);
  const step = (end - start) / buckets;
  const out: number[] = [];
  let idx = 0;
  let carry = sorted[0].value;
  for (let i = 0; i < buckets; i++) {
    const limit = start + (i + 1) * step;
    let sum = 0;
    let count = 0;
    while (idx < sorted.length && sorted[idx].time < limit) {
      if (sorted[idx].time >= start + i * step) {
        sum += sorted[idx].value;
        count++;
      }
      carry = sorted[idx].value;
      idx++;
    }
    out.push(count ? sum / count : carry);
  }
  return out;
}

const r2 = (n: number): number => Math.round(n * 100) / 100;

function xAt(i: number, n: number): number {
  return n === 1 ? 0 : (i * TRACE_WIDTH) / (n - 1);
}

/** Trazo poligonal de aristas vivas (sin suavizar), como un monitor. */
export function buildTracePath(values: number[]): string {
  if (!values.length) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const yOf = (v: number): number =>
    span === 0 ? TRACE_HEIGHT / 2 : PAD + (1 - (v - min) / span) * (TRACE_HEIGHT - 2 * PAD);
  if (values.length === 1) {
    const y = r2(yOf(values[0]));
    return `M 0 ${y} L ${TRACE_WIDTH} ${y}`;
  }
  return values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${r2(xAt(i, values.length))} ${r2(yOf(v))}`).join(' ');
}

/** Onda cuadrada para valores 0/1 (binary_sensor): escalón en cada cambio. */
export function buildStepPath(values: number[]): string {
  if (!values.length) return '';
  const yOf = (v: number): number => (v >= 0.5 ? PAD : TRACE_HEIGHT - PAD);
  if (values.length === 1) {
    const y = yOf(values[0]);
    return `M 0 ${y} L ${TRACE_WIDTH} ${y}`;
  }
  let d = `M 0 ${yOf(values[0])}`;
  for (let i = 1; i < values.length; i++) {
    const x = r2(xAt(i, values.length));
    d += ` L ${x} ${yOf(values[i - 1])} L ${x} ${yOf(values[i])}`;
  }
  return d;
}
