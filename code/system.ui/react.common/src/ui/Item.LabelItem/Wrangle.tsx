import { COLORS, Color, DEFAULTS, Icons, type t } from './common';

type RenderArgs = {
  index: number;
  total: number;
  item: t.LabelItem;
  selected?: boolean;
  enabled?: boolean;
  focused?: boolean;
  editing?: boolean;
};

export const Wrangle = {
  valuesOrDefault(props: Partial<t.LabelItemDynamicValueArgs>): t.LabelItemDynamicValueArgs {
    const {
      index = DEFAULTS.index,
      total = DEFAULTS.total,
      selected = DEFAULTS.selected,
      focused = DEFAULTS.focused,
      item = {},
    } = props;
    const enabled = item.enabled ?? props.enabled ?? DEFAULTS.enabled;
    const editing = item.editing ?? props.editing ?? DEFAULTS.editing;
    return { index, total, enabled, selected, focused, editing, item } as const;
  },

  dynamicValue<T>(
    value: t.LabelItemValue<T> | undefined,
    flags: Partial<t.LabelItemDynamicValueArgs>,
    defaultValue: T,
  ) {
    if (typeof value === 'function') {
      const fn = value as t.LabelItemDynamicValue<T>;
      const args = Wrangle.valuesOrDefault(flags);
      return fn(args);
    }
    return value ?? defaultValue;
  },

  labelText(args: { label?: string }) {
    const text = args.label || '';
    const hasValue = Boolean(text.trim());
    const isEmpty = !hasValue;
    return { text, hasValue, isEmpty } as const;
  },

  backgroundColor(args: { selected?: boolean; focused?: boolean }) {
    const { selected = DEFAULTS.selected, focused = DEFAULTS.focused } = args;
    if (!selected) return undefined;
    return focused ? COLORS.BLUE : Color.alpha(COLORS.DARK, 0.08);
  },

  foreColor(args: { selected?: boolean; focused?: boolean }) {
    const { selected = DEFAULTS.selected, focused = DEFAULTS.focused } = args;
    return selected && focused ? COLORS.WHITE : COLORS.DARK;
  },

  borderColor(args: { selected?: boolean; focused?: boolean }) {
    const { selected = DEFAULTS.selected, focused = DEFAULTS.focused } = args;
    if (!focused) return Color.format(0);
    const color = selected ? Color.format(0) : Color.alpha(COLORS.BLUE, 0.3);
    return color;
  },

  renderer(renderers: t.LabelItemRenderers, kind: t.LabelActionKind) {
    const done = (res?: t.LabelItemRenderer | void) => res ?? undefined;

    if (typeof renderers.action === 'function') {
      const res = renderers.action?.(kind, actionHelpers);
      if (res) return done(res);
    }
    return done(DEFAULTS.renderers.action?.(kind, actionHelpers));
  },

  element(renderer: t.LabelItemRenderer | undefined, args: RenderArgs) {
    const { index, total } = args;
    const { enabled, selected, focused, editing, item: item } = Wrangle.valuesOrDefault(args);

    if (typeof renderer === 'string') return renderer;

    if (typeof renderer === 'function') {
      const color = Wrangle.foreColor(args);
      const el = renderer({
        index,
        total,
        item,
        enabled,
        selected,
        focused,
        editing,
        color,
      });
      return el ?? Wrangle.defaultIcon(args);
    }

    return undefined;
  },

  icon(renderer: t.LabelItemRenderer | undefined, args: RenderArgs) {
    return Wrangle.element(renderer, args) ?? Wrangle.defaultIcon(args);
  },

  defaultIcon(args: { selected?: boolean }) {
    const color = Wrangle.foreColor(args);
    return <Icons.Face size={18} color={color} offset={[0, 0]} />;
  },
} as const;

/**
 * Helpers
 */

const actionHelpers: t.LabelItemActionRenderHelpers = {
  opacity: (e: t.LabelItemRendererArgs) => (e.enabled ? 0.9 : e.selected ? 0.5 : 0.3),
  icon(e: t.LabelItemRendererArgs, size, offset): t.IconProps {
    return { color: e.color, opacity: actionHelpers.opacity(e), size, offset };
  },
};
