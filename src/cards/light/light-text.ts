import type { HassEntityState } from '../../ha/types';
import { brightnessPercent } from './light-state';
import type { LightTranslations } from './translations';
import type { GroupCount } from './types';

type Translate = (key: keyof LightTranslations) => string;

function groupText(translate: Translate, group: GroupCount): string {
  return translate('group_count').replace('{on}', String(group.on)).replace('{total}', String(group.total));
}

/**
 * Estado de la luz para el subtítulo: «Encendida · 70 %», «Apagada» o «No
 * disponible»; en un grupo se añade cuántas luces hay encendidas («2 de 3
 * encendidas»).
 */
export function lightStateText(translate: Translate, stateObj: HassEntityState | undefined, group?: GroupCount): string {
  if (!stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown') return translate('state_unavailable');
  const parts = [translate(stateObj.state === 'on' ? 'state_on' : 'state_off')];
  const percent = stateObj.state === 'on' ? brightnessPercent(stateObj.attributes) : undefined;
  if (percent !== undefined) parts.push(`${percent}%`);
  if (group) parts.push(groupText(translate, group));
  return parts.join(' · ');
}
