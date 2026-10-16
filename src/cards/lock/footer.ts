import type { HomeAssistant } from '../../ha/types';
import { localize } from '../../core';
import { LOCK_TRANSLATIONS } from './translations';
import type { LockFooterItem, NeonLockCardConfig } from './types';

/** Máximo de iconos informativos en el pie. */
export const MAX_FOOTER_ITEMS = 3;

/** Tipos válidos, en el orden en que los ofrece el editor. */
export const LOCK_FOOTER_ITEM_TYPES: readonly LockFooterItem[] = ['door', 'battery', 'last_user'];

/** Aspecto del valor: `warn` ámbar (puerta abierta), `alert` rojo (batería baja), `muted` sin dato. */
export type FooterTone = 'normal' | 'warn' | 'alert' | 'muted';

export interface FooterItemView {
  type: LockFooterItem;
  /** Icono mdi. */
  icon: string;
  /** Texto pequeño encima del valor (solo «Último acceso»). */
  label?: string;
  text: string;
  tone: FooterTone;
}

/** Entidad de HA tal como la usa el pie (solo lo que lee). */
interface EntityLike {
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
}

const NO_DATA = '—';
/** Batería a partir de la cual se avisa en rojo. */
const LOW_BATTERY = 20;
const INVALID_STATES = ['unknown', 'unavailable', 'none', ''];

/** Iconos [abierto, cerrado] según la `device_class` del sensor de puerta. */
const DOOR_ICONS: Record<string, readonly [string, string]> = {
  door: ['mdi:door-open', 'mdi:door-closed'],
  garage_door: ['mdi:garage-open', 'mdi:garage'],
  window: ['mdi:window-open', 'mdi:window-closed'],
};

/**
 * Items configurados, ya sin repetidos ni tipos desconocidos y recortados
 * a `MAX_FOOTER_ITEMS`: lo que realmente se dibuja.
 */
export function normalizeFooterItems(items: unknown): LockFooterItem[] {
  if (!Array.isArray(items)) return [];
  const out: LockFooterItem[] = [];
  for (const item of items) {
    if (LOCK_FOOTER_ITEM_TYPES.includes(item as LockFooterItem) && !out.includes(item as LockFooterItem)) out.push(item as LockFooterItem);
  }
  return out.slice(0, MAX_FOOTER_ITEMS);
}

/** Icono de batería de mdi más cercano al nivel (`mdi:battery-70`, `mdi:battery-alert`…). */
export function batteryIcon(level: number | undefined): string {
  if (level === undefined) return 'mdi:battery-unknown';
  if (level >= 95) return 'mdi:battery';
  if (level < 10) return 'mdi:battery-alert';
  return `mdi:battery-${Math.round(level / 10) * 10}`;
}

/** Hora de un acceso: solo `HH:MM` si es de hoy y `d mmm, HH:MM` si es de otro día. */
export function formatAccessTime(iso: string | undefined, language: string, now: Date = new Date()): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const time = new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(date);
  if (date.toDateString() === now.toDateString()) return time;
  return `${new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short' }).format(date)}, ${time}`;
}

function numeric(raw: unknown): number | undefined {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined;
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function doorItem(config: NeonLockCardConfig, hass: HomeAssistant | undefined): FooterItemView {
  const closedDefault = DOOR_ICONS.door[1];
  const entity = config.door_entity ? (hass?.states[config.door_entity] as EntityLike | undefined) : undefined;
  if (!entity || (entity.state !== 'on' && entity.state !== 'off')) {
    const text = entity ? localize(hass, LOCK_TRANSLATIONS, 'state_error') : NO_DATA;
    return { type: 'door', icon: closedDefault, text, tone: 'muted' };
  }
  const [openIcon, closedIcon] = DOOR_ICONS[String(entity.attributes.device_class)] ?? DOOR_ICONS.door;
  const open = entity.state === 'on';
  return {
    type: 'door',
    icon: open ? openIcon : closedIcon,
    text: localize(hass, LOCK_TRANSLATIONS, open ? 'door_open' : 'door_closed'),
    tone: open ? 'warn' : 'normal',
  };
}

function batteryItem(config: NeonLockCardConfig, hass: HomeAssistant | undefined, lock: EntityLike | undefined): FooterItemView {
  const raw = config.battery_entity
    ? (hass?.states[config.battery_entity] as EntityLike | undefined)?.state
    : (lock?.attributes.battery_level ?? lock?.attributes.battery);
  const value = numeric(raw);
  const level = value === undefined ? undefined : Math.min(100, Math.max(0, value));
  return {
    type: 'battery',
    icon: batteryIcon(level),
    text: level === undefined ? NO_DATA : `${Math.round(level)} %`,
    tone: level === undefined ? 'muted' : level <= LOW_BATTERY ? 'alert' : 'normal',
  };
}

function lastUserItem(config: NeonLockCardConfig, hass: HomeAssistant | undefined, lock: EntityLike | undefined, now: Date): FooterItemView {
  let name: string | undefined;
  let when: string | undefined;
  if (config.last_user_entity) {
    const entity = hass?.states[config.last_user_entity] as EntityLike | undefined;
    if (entity && !INVALID_STATES.includes(entity.state.trim().toLowerCase())) name = entity.state.trim();
    when = entity?.last_updated;
  } else {
    const by = lock?.attributes.changed_by;
    if (typeof by === 'string' && by.trim() !== '') name = by.trim();
    when = lock?.last_changed;
  }
  const time = name ? formatAccessTime(when, hass?.locale?.language ?? 'es', now) : '';
  return {
    type: 'last_user',
    icon: 'mdi:account',
    label: localize(hass, LOCK_TRANSLATIONS, 'last_access'),
    text: name ? (time ? `${name} · ${time}` : name) : NO_DATA,
    tone: name ? 'normal' : 'muted',
  };
}

/**
 * Los iconos del pie ya resueltos a partir de la config y los estados de HA.
 * Un dato que no se puede obtener se muestra como «—», no desaparece.
 */
export function resolveFooterItems(
  config: NeonLockCardConfig,
  hass: HomeAssistant | undefined,
  lock: EntityLike | undefined,
  now: Date = new Date()
): FooterItemView[] {
  return normalizeFooterItems(config.footer_items).map((type) => {
    if (type === 'door') return doorItem(config, hass);
    if (type === 'battery') return batteryItem(config, hass, lock);
    return lastUserItem(config, hass, lock, now);
  });
}
