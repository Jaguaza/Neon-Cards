/**
 * Grupo de estados que comparten el color del punto junto al estado:
 * abierta, en movimiento (abriéndose o cerrándose), cerrada y no disponible.
 */
export type StatusGroup = 'open' | 'moving' | 'closed' | 'alert';

/** Tipo de cover: el dibujo que lleva la tarjeta. */
export type CoverType = 'shutter' | 'blind' | 'curtain' | 'awning' | 'projector' | 'tv';

export interface NeonCoverCardConfig {
  type?: string;
  /** Entidad `cover` (persiana, veneciana, cortina, toldo…). */
  entity?: string;
  /** Nombre; sin él se usa el `friendly_name` de la entidad. */
  name?: string;
  /**
   * Tipo de cover, es decir, el dibujo: persiana enrollable (`shutter`),
   * veneciana (`blind`), cortina (`curtain`), toldo (`awning`), pantalla de
   * proyector (`projector`) o TV en mueble (`tv`). Sin él se deduce del
   * `device_class` de la entidad (los dos últimos solo se eligen a mano) y, si
   * no lo tiene o no es uno de los cuatro primeros, es una persiana. La
   * pantalla de proyector y la TV son binarias: solo abiertas o cerradas, sin
   * porcentaje, dial ni deslizadores.
   */
  cover_type?: CoverType;
  /**
   * Paleta neón del halo perimetral de la tarjeta. Mismos campos que el
   * resto de tarjetas (`NeonPaletteConfig` en `src/shared/neon-palette.ts`).
   * También da el color del porcentaje, el dial y los deslizadores mientras
   * la persiana no está cerrada.
   */
  neon_palette?: string;
  neon_color1?: string;
  neon_color2?: string;
  neon_color3?: string;
  /**
   * Escape hatch deliberado, mismo motivo y mismo alcance que en
   * `cards/button/types.ts`: sin este índice, `_configChanged(key: string,
   * value: unknown)` del editor (asignación dinámica `config[key] = value`)
   * no compila (TS7053). Los campos ya declarados arriba siguen totalmente
   * comprobados.
   */
  [key: string]: unknown;
}
