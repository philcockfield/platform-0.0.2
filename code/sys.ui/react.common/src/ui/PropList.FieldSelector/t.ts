import type { t } from './common';

export type PropListFieldSelectorAction = 'Select' | 'Deselect' | 'Reset:Default' | 'Reset:Clear';

/**
 * Component: <PropsList.FieldSelector>
 */
export type PropListFieldSelectorProps<F extends string = string> = {
  title?: t.PropListTitleInput;
  all?: (F | undefined | null)[];
  selected?: (F | undefined | null)[];
  defaults?: F[];

  resettable?: boolean;
  indexes?: boolean;

  indent?: number;
  switchColor?: string | number;
  theme?: t.CommonTheme;
  style?: t.CssValue;
  onClick?: PropListFieldSelectorClickHandler;
};

export type PropListFieldSelectorClickHandler = (e: PropListFieldSelectorClickHandlerArgs) => void;
export type PropListFieldSelectorClickHandlerArgs<F extends string = string> = {
  action: PropListFieldSelectorAction;
  field?: F;
  previous?: F[];
  next?: F[];
  as<T extends string>(): PropListFieldSelectorClickHandlerArgs<T>;
};