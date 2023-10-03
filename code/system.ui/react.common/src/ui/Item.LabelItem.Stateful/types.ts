import type { t } from './common';

type InstanceId = string;
export type LabelItemBehaviorKind =
  | 'Item'
  | 'Item.Selection'
  | 'Item.Edit'
  | 'List'
  | 'List.Navigation';

/**
 * Context for when an item exists
 * within the context of a list.
 */
export type LabelItemList = {
  selected?: InstanceId;
};

/**
 * Item (Data Model)
 */
export type LabelItem = {
  label?: string;
  editing?: boolean;
  enabled?: boolean;
  focused?: boolean;
  selected?: boolean;
  left?: t.LabelAction | t.LabelAction[];
  right?: t.LabelAction | t.LabelAction[];
};

/**
 * Simple safe/immutable state wrapper for the data object.
 */
export type LabelItemState = t.Immutable<t.LabelItem> & { readonly instance: InstanceId };
export type LabelItemStateNext = t.ImmutableNext<t.LabelItem>;

export type LabelItemListState = t.Immutable<t.LabelItemList>;
export type LabelItemListStateNext = t.ImmutableNext<t.LabelItemList>;

/**
 * Controller API's
 */
export type LabelItemController<Kind extends string> = {
  readonly kind: Kind;
  readonly enabled: boolean;
  readonly data: t.LabelItem;
  readonly handlers: t.LabelItemPropsHandlers;
};

export type LabelListController<Kind extends string> = {
  readonly kind: Kind;
  readonly enabled: boolean;
  readonly listRef: React.MutableRefObject<HTMLDivElement | undefined>;
};

/**
 * Component (View).
 */
export type LabelItemStatefulProps = {
  item?: t.LabelItemState;
  list?: t.LabelItemListState;
  useBehaviors?: t.LabelItemBehaviorKind[];
  style?: t.CssValue;
  onChange?: LabelItemStateChangeHandler;
};

/**
 * Events.
 */
export type LabelItemStateChangeHandler = (e: LabelItemStateChangeHandlerArgs) => void;
export type LabelItemStateChangeHandlerArgs = {
  readonly action: LabelItemChangeAction;
  readonly data: LabelItem;
};
export type LabelItemChangeAction =
  | 'ready'
  | 'data:label'
  | 'view:focus'
  | 'view:blur'
  | 'view:selected'
  | 'edit:start'
  | 'edit:accept'
  | 'edit:cancel';
