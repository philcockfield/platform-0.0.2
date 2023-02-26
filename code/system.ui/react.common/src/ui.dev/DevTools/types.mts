import type { t } from '../../common.t';

type O = Record<string, unknown>;
type SectionHandler<S extends O> = (dev: DevTools<S>) => void;

/**
 * Index of development tools (UI widgets).
 */
export type DevTools<S extends O = O> = {
  ctx: t.DevCtx;
  change: t.DevCtxState<S>['change'];

  header: t.DevCtxDebugHeader;
  footer: t.DevCtxDebugFooter;
  row: t.DevCtxDebug<S>['row'];

  /**
   * Helpers.
   */
  lorem(words?: number, endWith?: string): string;
  theme(value: t.DevTheme): DevTools<S>;

  // NB: Useful for logically grouping blocks.
  section(title: string, fn?: SectionHandler<S>): DevTools<S>;
  section(fn: SectionHandler<S>): DevTools<S>;

  /**
   * Widgets.
   */
  button(label: string, onClick?: t.DevButtonClickHandler<S>): DevTools<S>;
  button(fn: t.DevButtonHandler<S>): DevTools<S>;

  boolean(fn: t.DevBooleanHandler<S>): DevTools<S>;

  title(text: string, style?: t.DevTitleStyle): DevTools<S>;
  title(fn: t.DevTitleHandler<S>): DevTools<S>;

  TODO(text?: string, style?: t.DevTodoStyle): DevTools<S>;
  TODO(fn: t.DevTodoHandler<S>): DevTools<S>;

  hr(): DevTools<S>;
  hr(
    line: t.DevHrThickness | [t.DevHrThickness, t.DevHrOpacity],
    margin?: t.DevHrMargin,
    color?: t.DevHrColor,
  ): DevTools<S>;
  hr(fn: t.DevHrHandler<S>): DevTools<S>;
};
