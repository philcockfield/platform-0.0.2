import { type t } from './common';

type Id = string;
type Url = string;

/**
 * Component
 */
export type RootProps = {
  vimeo?: t.VimeoInstance;
  slugs?: t.VideoConceptSlug[];
  selected?: number;
  style?: t.CssValue;
  onSelect?: t.VideoConceptClickHandler;
};

export type RootStatefulProps = {
  slugs?: t.VideoConceptSlug[];
  style?: t.CssValue;
  onReady?: RootStatefulReadyHandler;
};

/**
 * Events
 */

export type RootStatefulReadyHandler = (e: RootStatefulReadyHandlerArgs) => void;
export type RootStatefulReadyHandlerArgs = {
  vimeo: t.VimeoInstance;
};

/**
 * Content
 */
export type VideoConceptSlug = {
  id: Id;
  title?: string;
  video?: t.ConceptSlugVideo;
  image?: { src: Url };
};

export type VideoConceptClickHandler = (e: VideoConceptClickHandlerArgs) => void;
export type VideoConceptClickHandlerArgs = {
  index: number;
};
