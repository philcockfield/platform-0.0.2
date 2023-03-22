import { useEffect, useState, useRef } from 'react';

import { COLORS, Color, css, FC, TextInput, t } from '../common';
import { Button } from '../DevTools.Button';

const DEFAULT = {
  isEnabled: true,
  placeholder: 'enter text...',
};

type StringOrNil = string | undefined | null;
type ContentInput = StringOrNil | JSX.Element;
type ErrorInput = t.DevTextboxError | boolean | undefined | null;

export type TextboxProps = {
  isEnabled?: boolean;
  label?: ContentInput;
  value?: StringOrNil;
  placeholder?: ContentInput;
  left?: ContentInput;
  right?: ContentInput;
  footer?: ContentInput;
  error?: ErrorInput;
  style?: t.CssValue;
  labelOpacity?: number;
  onChange?: t.TextInputChangeEventHandler;
  onEnter?: t.TextInputKeyEventHandler;
};

const View: React.FC<TextboxProps> = (props) => {
  const isActive = Wrangle.isActive(props);
  const [isFocused, setFocused] = useState(false);

  /**
   * [Render]
   */
  const HEIGHT = 26;
  const errorColor = Wrangle.errorColor(props);
  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      userSelect: 'none',
      color: COLORS.DARK,
    }),
    title: css({
      fontSize: 12,
      color: Color.alpha(COLORS.DARK, 0.7),
      marginBottom: 5,
      opacity: isActive ? 1 : 0.4,
    }),
    body: css({
      borderBottom: `solid 1px`,
      borderBottomColor: Wrangle.borderColor(props, isActive, isFocused),
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
    }),
    input: css({
      boxSizing: 'border-box',
      paddingLeft: props.left ? 1 : 5,
      paddingRight: props.right ? 1 : 5,
      PaddingY: 3,
      display: 'grid',
      height: HEIGHT,
    }),
    edge: css({
      height: HEIGHT,
      opacity: isActive ? 1 : 0.2,
      display: 'grid',
      placeItems: 'center',
    }),
    footer: css({
      boxSizing: 'border-box',
      marginTop: 4,
      fontSize: 12,
      fontStyle: 'italic',
      color: errorColor ?? Color.alpha(COLORS.DARK, 0.5),
    }),
  };

  const elInput = (
    <div {...styles.input}>
      <TextInput
        isEnabled={isActive}
        value={Wrangle.value(props)}
        placeholder={Wrangle.placeholder(props)}
        placeholderStyle={{ opacity: 0.2, italic: true }}
        focusAction={'Select'}
        spellCheck={false}
        onFocusChange={(e) => setFocused(e.isFocused)}
        onChanged={(e) => {
          if (isActive) props.onChange?.(e);
        }}
        onEnter={(e) => {
          if (isActive) props.onEnter?.(e);
        }}
      />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {props.label && <div {...styles.title}>{props.label}</div>}
      <div {...styles.body}>
        <div {...styles.edge}>{props.left}</div>
        {elInput}
        <div {...styles.edge}>{props.right}</div>
      </div>
      {props.footer && <div {...styles.footer}>{props.footer}</div>}
    </div>
  );
};

/**
 * [Helpers]
 */

const Wrangle = {
  isActive(props: TextboxProps): boolean {
    const { isEnabled = DEFAULT.isEnabled } = props;
    if (!isEnabled) return false;
    return true;
  },

  value(props: TextboxProps) {
    return props.value ?? '';
  },

  placeholder(props: TextboxProps) {
    if (props.placeholder === null) return '';
    return props.placeholder ?? DEFAULT.placeholder;
  },

  error(props: TextboxProps) {
    let error: t.DevTextboxError | undefined = undefined;
    if (props.error === true) error = 'error';
    if (typeof props.error === 'string') error = props.error;

    const isError = error === 'error';
    const isWarning = error === 'warning';

    return {
      error,
      isError,
      isWarning,
    };
  },

  errorColor(props: TextboxProps) {
    const { isError, isWarning } = Wrangle.error(props);
    if (isError) return COLORS.RED;
    if (isWarning) return COLORS.YELLOW;
    return;
  },

  borderColor(props: TextboxProps, isActive: boolean, isFocused: boolean) {
    const errorColor = Wrangle.errorColor(props);
    if (errorColor) return errorColor;
    return isActive && isFocused ? Color.alpha(COLORS.CYAN, 1) : Color.alpha(COLORS.DARK, 0.1);
  },
};

/**
 * Export
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
  isActive: typeof Wrangle.isActive;
};
export const Textbox = FC.decorate<TextboxProps, Fields>(
  View,
  { DEFAULT, isActive: Wrangle.isActive },
  { displayName: 'Textbox' },
);
