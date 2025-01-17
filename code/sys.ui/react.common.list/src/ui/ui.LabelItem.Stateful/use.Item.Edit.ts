import { useEffect, useState } from 'react';
import { DEFAULTS, Keyboard, Model, Time, rx, type t } from './common';

type RevertibleItem = t.LabelItem & { _revert?: { label?: string } };
type ChangeItem = t.ImmutableMutator<RevertibleItem>;
type ChangeList = t.ImmutableMutator<t.LabelList>;

type Args = {
  position: t.LabelItemPosition;
  enabled?: boolean;
  item?: t.LabelItemState;
  list?: t.LabelListState;
  handlers?: t.LabelItemPropsHandlers;
  onChange?: t.LabelItemStateChangedHandler;
};

/**
 * HOOK: edit behavior controller for a single <Item>.
 */
export function useItemEditController(args: Args) {
  const { item, list, position, enabled = true } = args;
  const dispatch = {
    item: Model.Item.commands(item),
    list: Model.List.commands(list),
  } as const;

  const [ref, setRef] = useState<t.LabelItemRef>();
  const [, setCount] = useState(0);
  const redraw = () => setCount((prev) => prev + 1);

  /**
   * Handlers.
   */
  type A = t.LabelItemChangeAction;
  const fire = (action: A) => args.onChange?.({ action, position, item: api.current });
  const change = (action: A, changeList: ChangeList, changeItem: ChangeItem) => {
    if (!(enabled && list && item)) return;
    list.change(changeList);
    item.change(changeItem);
    fire(action);
    redraw();
  };

  const Edit = {
    is: {
      get focused() {
        return Boolean(list?.current.focused);
      },
      get editing() {
        return Boolean(item?.instance === list?.current.editing);
      },
      get editable() {
        if (!Edit.is.focused) return false;
        return item?.current?.editable ?? DEFAULTS.editable;
      },
    },

    start() {
      if (Edit.is.editing || !Edit.is.editable) return;
      change(
        'edit:start',
        (list) => (list.editing = item?.instance),
        (item) => ((item._revert || (item._revert = {})).label = item.label),
      );
    },

    accept() {
      if (!Edit.is.editing) return;
      const focused = Edit.is.focused;
      change(
        'edit:accept',
        (list) => (list.editing = undefined),
        (item) => delete item._revert,
      );
      dispatch.item.edited('accepted');
      if (focused) dispatch.list.focus();
    },

    cancel() {
      if (!Edit.is.editing) return;
      const focused = Edit.is.focused;
      change(
        'edit:cancel',
        (list) => (list.editing = undefined),
        (item) => {
          if (item._revert) item.label = item._revert.label;
          delete item._revert;
        },
      );
      dispatch.item.edited('cancelled');
      if (focused) dispatch.list.focus();
    },
  };

  /**
   * View component events.
   */
  const handlers: t.LabelItemPropsHandlers = {
    ...args.handlers,

    onReady(e) {
      setRef(e.ref);
      change(
        'ready',
        (list) => null,
        (item) => null,
      );
      args.handlers?.onReady?.(e);
    },

    onEditChange(e) {
      change(
        'label',
        (list) => null,
        (item) => (item.label = e.label),
      );
      args.handlers?.onEditChange?.(e);
    },

    onLabelDoubleClick(e) {
      dispatch.item.edit('start');
      args.handlers?.onLabelDoubleClick?.(e);
    },

    onEditClickAway(e) {
      dispatch.item.edit('accept');
      args.handlers?.onEditClickAway?.(e);
    },
  };

  /**
   * Reset when state instance changes.
   */
  useEffect(() => redraw(), [item?.instance]);

  /**
   * Keyboard.
   */
  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();
    const keyboard = Keyboard.until(dispose$);
    const isSelected = () => list && item && list?.current.selected === item?.instance;

    keyboard.on({
      Escape(e) {
        if (isSelected()) dispatch.item.edit('cancel');
      },
      Enter(e) {
        if (isSelected()) dispatch.item.edit('toggle');
      },
    });

    if (!enabled) dispose();
    return dispose;
  }, [enabled, ref, item?.instance]);

  /**
   * Command listener (Item).
   */
  useEffect(() => {
    const events = item?.events();
    events?.cmd.edit$
      .pipe(
        rx.filter((e) => enabled),
        rx.filter((e) => !e.cancelled),
      )
      .subscribe((e) => {
        if (e.action === 'start') {
          dispatch.list.focus();
          Time.delay(0, Edit.start);
        }
        if (e.action === 'accept') Edit.accept();
        if (e.action === 'cancel') Edit.cancel();
        if (e.action === 'toggle') {
          if (Edit.is.editing) {
            Edit.accept();
          } else {
            Edit.start();
          }
        }
      });
    return events?.dispose;
  }, [enabled, item?.instance]);

  /**
   * Command listener (List).
   */
  useEffect(() => {
    const events = list?.events();
    events?.cmd.edit$
      .pipe(
        rx.filter((e) => enabled),
        rx.filter((e) => e.item === item?.instance),
      )
      .subscribe((e) => dispatch.item.edit(e.action));
    return events?.dispose;
  }, [enabled, list?.instance]);

  /**
   * API
   */
  const api = {
    enabled,
    handlers,
    get current() {
      return item?.current ?? DEFAULTS.data.item;
    },
  } as const;
  return api;
}
