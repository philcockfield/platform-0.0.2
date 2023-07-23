import { type t } from './common';

type Id = string;
type Url = string;
type VideoId = number;

/**
 * Component
 */
export type RootProps = {
  slugs?: t.VideoConceptSlug[];
  selected?: number;
  style?: t.CssValue;
  onSelect?: t.VideoConceptClickHandler;
};

export type RootStatefulProps = {
  slugs?: t.VideoConceptSlug[];
  style?: t.CssValue;
};

/**
 * Content
 */
export type VideoConceptSlug = {
  id: Id;
  title?: string;
  video: { id: VideoId };
  image?: { src: Url };
};

export type VideoConceptClickHandler = (e: VideoConceptClickHandlerArgs) => void;
export type VideoConceptClickHandlerArgs = {
  index: number;
};
