import { type t } from './common';

/**
 * API: Imperative handle reference.
 */
export type RepoListRef = t.LabelListDispatch & { store: t.Store };
export type RepoListBehavior = 'Focus.OnLoad' | 'Focus.OnArrowKey' | 'Share';

/**
 * <Component>
 */
export type RepoListProps = {
  list?: t.RepoListState | t.RepoListModel;
  behaviors?: t.RepoListBehavior[];
  renderCount?: t.RenderCountProps;
  tabIndex?: number;
  style?: t.CssValue;
};

/**
 * Action
 */
export type RepoListActionCtx = {
  kind: 'Share';
};
