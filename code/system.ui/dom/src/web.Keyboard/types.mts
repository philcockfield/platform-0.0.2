import type { t } from '../common.t';

export type KeyListenerHandle = { dispose(): void };

export type KeyPattern = string; // eg. "CMD + K"
export type KeyboardStage = 'Down' | 'Up';
export type KeyboardModifierEdges = [] | ['Left'] | ['Right'] | ['Left' | 'Right'];
export type KeyboardModifierKey = 'SHIFT' | 'CTRL' | 'ALT' | 'META';

export type KeyboardKeyFlags = {
  readonly down: boolean;
  readonly up: boolean;
  readonly modifier: boolean;
  readonly number: boolean;
  readonly letter: boolean;
  readonly enter: boolean;
  readonly escape: boolean;
  readonly arrow: boolean;
};

/**
 * State.
 */
export type KeyboardKey = { key: string; code: string; is: KeyboardKeyFlags };
export type KeyboardState = {
  current: KeyboardStateCurrent;
  last?: KeyboardKeypress;
};

export type KeyboardStateCurrent = {
  modified: boolean;
  modifierKeys: KeyboardModifierKeys;
  modifiers: KeyboardModifierFlags;
  pressed: KeyboardKey[];
};

export type KeyboardModifierKeys = {
  shift: KeyboardModifierEdges;
  ctrl: KeyboardModifierEdges;
  alt: KeyboardModifierEdges;
  meta: KeyboardModifierEdges;
};
export type KeyboardModifierFlags = {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
};

/**
 * Keypress
 */
export type KeyboardKeypress = {
  readonly stage: KeyboardStage;
  readonly key: string;
  readonly keypress: KeyboardKeypressProps;
  readonly is: KeyboardKeyFlags;
  cancel(): void;
};

export type KeyboardKeypressProps = t.UIEventBase &
  t.UIModifierKeys & {
    readonly code: string;
    readonly key: string;
    readonly isComposing: boolean;
    readonly location: number;
    readonly repeat: boolean;
  };
