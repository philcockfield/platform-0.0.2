import { type t } from './common';

export type DownloadFileProps = {
  kind: 'pdf';
  url: string;
  filename: string;
  onClick?: (e: { url: string; mimetype: string }) => void;
};

/**
 * Component
 */
export type PlayBarProps__ = {
  slug?: t.SlugListItem;
  download?: t.DownloadFileProps;
  style?: t.CssValue;
  onPlayToggle?: PlayBarHandler__;
  onPlayComplete?: PlayBarHandler__;
};

/**
 * Events
 */
export type PlayBarHandler__ = (e: PlayBarHandlerArgs__) => void;
export type PlayBarHandlerArgs__ = {
  status: t.VimeoStatus;
};
