import { useRef } from 'react';
import { slug, type t } from './common';

import { CmdBar } from 'sys.ui.react.common';
import { useController } from './use.Controller';

export const View: React.FC<t.CmdBarProps> = (props) => {
  const { enabled, doc, paths, debug, focusOnReady, onCommand, onTextChanged } = props;
  const instance = useRef(props.instance ?? slug()).current;
  const handlers = wrangle.handlers(props);
  const controller = useController({
    instance,
    enabled,
    doc,
    paths,
    debug,
    focusOnReady,
    handlers,
  });
  return (
    <CmdBar
      text={controller.text}
      enabled={controller.is.enabled}
      theme={props.theme}
      style={props.style}
      onReady={(e) => controller.onReady(e.ref)}
      onChange={(e) => controller.onChange(e.to)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') controller.onInvoke();
      }}
    />
  );
};

/**
 * Helpers
 */
const wrangle = {
  handlers(props: t.CmdBarProps): t.CmdBarHandlers {
    const { onTextChanged, onCommand, onInvoked } = props;
    return { onTextChanged, onCommand, onInvoked };
  },
} as const;
