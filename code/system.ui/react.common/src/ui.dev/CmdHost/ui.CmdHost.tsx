import { useState } from 'react';

import { css, SpecList, t } from './common';
import { CmdBar } from './ui.CmdBar';
import { useKeyboard } from './useKeyboard.mjs';

export type CmdHostProps = {
  pkg: { name: string; version: string };
  specs?: t.SpecImports;
  filter?: string;
  selectedIndex?: number;
  hintKey?: string | string[];
  hrDepth?: number;
  badge?: t.SpecListBadge;
  style?: t.CssValue;
  focusOnReady?: boolean;
  onChanged?: t.CmdHostChangedHandler;
  onCmdFocusChange?: t.TextInputFocusChangeHandler;
  onKeyDown?: t.TextInputKeyEventHandler;
  onKeyUp?: t.TextInputKeyEventHandler;
};

export const CmdHost: React.FC<CmdHostProps> = (props) => {
  const { pkg } = props;
  const [textboxRef, setTextboxRef] = useState<t.TextInputRef>();

  useKeyboard(textboxRef, {
    onArrowKey(e) {
      textboxRef?.focus();
    },
  });

  /**
   * Handlers
   */
  const filterChanged = (command: string) => {
    props.onChanged?.({ command });
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', display: 'grid', gridTemplateRows: '1fr auto' }),
    body: css({ position: 'relative', display: 'grid' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <SpecList
          title={pkg.name}
          version={pkg.version}
          imports={props.specs}
          filter={props.filter}
          badge={props.badge}
          hrDepth={props.hrDepth}
          selectedIndex={props.selectedIndex}
          scroll={true}
        />
      </div>
      <CmdBar
        text={props.filter}
        hintKey={props.hintKey}
        focusOnReady={props.focusOnReady ?? true}
        onReady={(ref) => setTextboxRef(ref)}
        onChanged={(e) => filterChanged(e.to)}
        onFocusChange={props.onCmdFocusChange}
        onKeyDown={props.onKeyDown}
        onKeyUp={props.onKeyUp}
      />
    </div>
  );
};
