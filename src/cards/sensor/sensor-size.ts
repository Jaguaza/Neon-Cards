import { DEFAULT_SIZE, SIZE_GRID } from './constants';
import type { NeonSensorCardConfig, SensorSize } from './types';

/** Tamaño efectivo: cualquier valor desconocido cae al tamaño mediano. */
export function resolveSize(config: NeonSensorCardConfig | undefined): SensorSize {
  const size = config?.size;
  return size === 'compact' || size === 'large' ? size : DEFAULT_SIZE;
}

/** El tamaño pequeño es el único sin gráfico. */
export function hasGraph(size: SensorSize): boolean {
  return size !== 'compact';
}

export interface SensorGridOptions {
  columns: number;
  rows: number;
  min_columns: number;
  max_columns: number;
  min_rows: number;
  max_rows: number;
}

/** Opciones de grid de HA de cada tamaño: hueco fijo (mínimo = máximo). */
export function gridOptionsFor(size: SensorSize): SensorGridOptions {
  const { columns, rows } = SIZE_GRID[size];
  return { columns, rows, min_columns: columns, max_columns: columns, min_rows: rows, max_rows: rows };
}
