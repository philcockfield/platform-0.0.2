/**
 * @external
 */
import { descend, equals, mergeDeepRight, prop, reverse, sortBy, sortWith, uniqBy } from 'ramda';
export const R = {
  descend,
  equals,
  prop,
  reverse,
  sortBy,
  sortWith,
  uniqBy,
  merge: mergeDeepRight,
} as const;

export { Crdt } from 'ext.lib.automerge';

/**
 * @system
 */
export { Delete, Hash, Immutable, Path, rx, slug } from 'sys.util';