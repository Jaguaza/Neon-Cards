import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import { getSensorDisplay } from '../../ha/sensors';
import { MAX_FOOTER_SENSORS } from './constants';
import type { FooterSensorConfig, ThermostatSize } from './types';

/** Pie de sensores (hasta `MAX_FOOTER_SENSORS`, con icono + estado +
    unidad). No existe en la vista compacta; los sensores que no existen
    en HA se omiten, y sin ninguno válido no se pinta el pie. */
export function renderFooter(
  footer: FooterSensorConfig[] | undefined,
  hass: HomeAssistant | undefined,
  size: ThermostatSize
): TemplateResult | typeof nothing {
  if (size === 'compact') return nothing;
  if (!footer?.length || !hass) return nothing;
  const displays = footer
    .slice(0, MAX_FOOTER_SENSORS)
    .map((item) => getSensorDisplay(item.entity, hass, { icon: item.icon }))
    .filter((d): d is NonNullable<typeof d> => d !== null);
  if (!displays.length) return nothing;

  return html`
    <div class="footer ${displays.length === 1 ? 'footer-single' : ''}" style="grid-template-columns: repeat(${displays.length}, 1fr)">
      ${displays.map(
        (d, i) => html`
          <div class="footer-item ${i > 0 ? 'footer-item--divided' : ''}">
            <ha-icon icon=${d.icon}></ha-icon>
            <span>${d.state}${d.unit}</span>
          </div>
        `
      )}
    </div>
  `;
}
