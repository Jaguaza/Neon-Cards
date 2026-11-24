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
   * proyector (`projector`) o TV en mueble (`tv`). Siempre se elige a mano: ya
   * no se deduce del `device_class` de la entidad. Sin él, o con un valor que
   * no sea uno de los seis, es una persiana enrollable. La pantalla de
   * proyector y la TV son binarias: solo abiertas o cerradas, sin porcentaje,
   * dial ni deslizadores.
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
   * Color del icono grande (hex, `rgb()`/`hsl()`, nombre o `var(--x)`). Sin él
   * (o con uno inválido) el icono sigue al halo: color de la paleta mientras
   * la persiana no está cerrada y color de texto cuando lo está.
   */
  icon_color?: string;
  /**
   * Color del punto junto al estado, uno por grupo de estados; cualquier color
   * CSS válido. Si falta o no es válido vale el color por defecto del grupo.
   * `status_color_open`: abierta (verde).
   * `status_color_moving`: abriéndose o cerrándose (ámbar).
   * `status_color_closed`: cerrada (gris).
   * `status_color_alert`: no disponible (rojo).
   */
  status_color_open?: string;
  status_color_moving?: string;
  status_color_closed?: string;
  status_color_alert?: string;
  /**
   * Escape hatch deliberado, mismo motivo y mismo alcance que en
   * `cards/button/types.ts`: sin este índice, `_configChanged(key: string,
   * value: unknown)` del editor (asignación dinámica `config[key] = value`)
   * no compila (TS7053). Los campos ya declarados arriba siguen totalmente
   * comprobados.
   */
  [key: string]: unknown;
}
