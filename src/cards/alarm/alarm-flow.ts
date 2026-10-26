import { VIEW_REVEAL_MS, VIEW_TIMEOUT_MS } from './constants';
import type { AlarmCommand } from './types';

/** Vista que cuelga sobre el contenido de la tarjeta mientras se pide algo al usuario. */
export type AlarmView =
  | { kind: 'modes'; choices: AlarmCommand[] }
  | { kind: 'confirm'; command: AlarmCommand }
  | { kind: 'keypad'; command: AlarmCommand; format: 'number' | 'text' }
  | { kind: 'sensors'; type: string };

/**
 * Estado de la vista abierta (modos, confirmación, teclado o lista de
 * sensores): cuál es, el código escrito, y los temporizadores que la
 * muestran con un pequeño retardo (para que el halo arranque limpio) y la
 * cierran sola si nadie la toca. No sabe nada de Home Assistant: la tarjeta
 * decide qué vista abrir y qué hacer con el resultado.
 */
export class AlarmFlow {
  view?: AlarmView;
  /** La vista se muestra `VIEW_REVEAL_MS` después de abrirla (ver esa constante). */
  shown = false;
  code = '';
  codeError = false;
  private _timeout?: ReturnType<typeof setTimeout>;
  private _reveal?: ReturnType<typeof setTimeout>;

  constructor(private readonly _onChange: () => void) {}

  open(view: AlarmView): void {
    this.view = view;
    this.shown = false;
    this.code = '';
    this.codeError = false;
    this._restartTimeout();
    clearTimeout(this._reveal);
    this._reveal = setTimeout(() => {
      this.shown = true;
      this._onChange();
    }, VIEW_REVEAL_MS);
    this._onChange();
  }

  /** Cierra la vista y avisa a la tarjeta para repintar. */
  close(): void {
    this.drop();
    this._onChange();
  }

  /** Cierra la vista sin pedir repintado (para usarlo desde `willUpdate`). */
  drop(): void {
    clearTimeout(this._timeout);
    clearTimeout(this._reveal);
    this.view = undefined;
    this.shown = false;
    this.code = '';
    this.codeError = false;
  }

  /** Escribe un carácter del código (teclado numérico o campo de texto). */
  append(char: string): void {
    this.code += char;
    this.codeError = false;
    this._touch();
  }

  /** Borra el último carácter del código. */
  backspace(): void {
    this.code = this.code.slice(0, -1);
    this._touch();
  }

  /** Sustituye todo el código (campo de texto). */
  setCode(code: string): void {
    this.code = code;
    this.codeError = false;
    this._touch();
  }

  /** La orden con este código falló (código incorrecto): se vacía y se avisa, la vista sigue abierta. */
  markError(): void {
    this.code = '';
    this.codeError = true;
    this._touch();
  }

  private _touch(): void {
    this._restartTimeout();
    this._onChange();
  }

  private _restartTimeout(): void {
    clearTimeout(this._timeout);
    this._timeout = setTimeout(() => this.close(), VIEW_TIMEOUT_MS);
  }
}
