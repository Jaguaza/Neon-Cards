import { DEFAULT_SIZE, MIN_COLUMNS, SIZE_COLUMNS } from './constants';
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

/** Opciones de grid de HA (secciones) de cada tamaño. */
export function gridOptionsFor(size: SensorSize): { rows: 'auto'; columns: number; min_columns: number } {
  return { rows: 'auto', columns: SIZE_COLUMNS[size], min_columns: MIN_COLUMNS };
}
