import { slug, type t } from './common';

/**
 * Dispatcher of "command" events for the given item.
 */
export function commands(item?: t.LabelItemState) {
  const dispatch = (cmd: t.LabelItemCommand) => item?.change((d) => (d.command = cmd));
  const api = {
    /**
     * Re-render item.
     */
    redraw() {
      dispatch({ type: 'Item:Redraw', payload: { tx: slug() } });
    },

    /**
     * Clipboard related actions.
     */
    clipboard(action: t.LabelItemClipboard['action']) {
      dispatch({ type: 'Item:Clipboard', payload: { action, tx: slug() } });
    },

    /**
     * Keyboard related actions.
     */
    key: {
      down(e: t.LabelItemKeyHandlerArgs) {
        dispatch({ type: 'Item:Keydown', payload: { ...e, tx: slug() } });
        const meta = (code: string) => e.is.meta && e.code === code;
        if (meta('KeyX')) api.clipboard('Cut');
        if (meta('KeyC')) api.clipboard('Copy');
        if (meta('KeyV')) api.clipboard('Paste');
      },
      up(e: t.LabelItemKeyHandlerArgs) {
        dispatch({ type: 'Item:Keyup', payload: { ...e, tx: slug() } });
      },
    },

    action: {
      invoke(e: t.LabelItemActionHandlerArgs) {
        dispatch({ type: 'Item:Action', payload: { ...e, tx: slug() } });
      },
    },
  } as const;
  return api;
}
