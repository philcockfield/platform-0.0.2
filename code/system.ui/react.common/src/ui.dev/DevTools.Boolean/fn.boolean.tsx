import { t } from '../common';
import { Boolean } from './ui.Boolean';
import { ValueHandler } from '../DevTools/ValueHandler.mjs';

type O = Record<string, unknown>;

/**
 * A simple clickable text-busson that represents a boolean value.
 */
export function boolean<S extends O = O>(
  ctx: t.DevCtx,
  events: t.DevEvents,
  initial: S,
  fn: t.DevBooleanHandler<S>,
) {
  if (!ctx.is.initial) return;

  const label = ValueHandler<string, S>(events);
  const value = ValueHandler<boolean, S>(events);
  const clickHandlers: t.DevBooleanClickHandler<S>[] = [];

  const args: t.DevBooleanHandlerArgs<S> = {
    ctx,
    label(input) {
      label.handler(input);
      return args;
    },
    value(input) {
      value.handler(input);
      return args;
    },
    onClick(handler) {
      clickHandlers.push(handler);
      return args;
    },
  };

  const ref = ctx.debug.row(async (e) => {
    const state = await ctx.state<S>(initial);
    const change = state.change;
    const onClick = async () => {
      const current = (await value.current()) ?? false;
      clickHandlers.forEach((fn) => fn({ ...args, current, state, change }));
    };
    return (
      <Boolean
        value={await value.current()}
        label={await label.current()}
        isEnabled={clickHandlers.length > 0}
        onClick={clickHandlers.length > 0 ? onClick : undefined}
      />
    );
  });

  label.subscribe(ref.redraw);
  value.subscribe(ref.redraw);

  fn?.(args);
}
