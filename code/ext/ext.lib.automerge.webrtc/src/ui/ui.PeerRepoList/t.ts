import type { t } from './common';

export type PeerRepoListTarget = 'Peer' | 'RepoList';

/**
 * <Component>
 */
export type PeerRepoListProps = {
  model?: t.RepoListModel;
  network?: t.WebrtcStore;
  focusOnLoad?: PeerRepoListTarget;
  focusOnArrowKey?: PeerRepoListTarget;
  shareable?: boolean;
  debug?: PeerRepoListPropsDebug;
  style?: t.CssValue;
  onStreamSelection?: t.PeerStreamSelectionHandler;
};

export type PeerRepoListPropsDebug = { label?: PeerRepoListPropsDebugLabel };
export type PeerRepoListPropsDebugLabel = {
  text: string;
  absolute?: t.CssEdgesInput;
  align?: 'Left' | 'Right';
};
