import { html } from 'lit';
import type { TemplateResult } from 'lit';

/**
 * Las vistas que cuelgan encima del contenido de una tarjeta (confirmar,
 * elegir modo, teclado, lista de sensores) recogen sus propios gestos: sin
 * cortar la propagación, el clic en un botón llegaría al `ha-card` y se
 * interpretaría como otra pulsación de la tarjeta.
 */
const stop = (ev: Event) => ev.stopPropagation();

/**
 * Envoltorio común de esas vistas: un `alertdialog` accesible que corta los
 * gestos y se cierra con Escape.
 *
 * @param className Clases del contenedor (la tarjeta pone aquí las suyas).
 * @param title Nombre accesible del diálogo (`aria-label`).
 * @param onCancel Se llama al pulsar Escape.
 * @param content Lo que va dentro: texto y botones.
 */
export function renderAlertDialog(className: string, title: string, onCancel: () => void, content: TemplateResult): TemplateResult {
  return html`
    <div
      class=${className}
      role="alertdialog"
      aria-label=${title}
      @pointerdown=${stop}
      @pointerup=${stop}
      @pointercancel=${stop}
      @click=${stop}
      @keydown=${(ev: KeyboardEvent) => {
        if (ev.key === 'Escape') onCancel();
      }}
    >
      ${content}
    </div>
  `;
}
