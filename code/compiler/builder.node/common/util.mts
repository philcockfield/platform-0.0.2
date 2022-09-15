import { FindUtil } from './util.Find.mjs';
import { JsonUtil, PackageJsonUtil } from './util.Json.mjs';

import type * as t from '../types.mjs';

/**
 * Common helpers.
 */
export const Util = {
  Json: JsonUtil,
  PackageJson: PackageJsonUtil,
  Find: FindUtil,

  stripRelativeRoot(input: t.PathString) {
    return (input || '').replace(/^\.\//, '');
  },

  ensureRelativeRoot(input: t.PathString) {
    return `./${Util.stripRelativeRoot(input)}`;
  },

  objectHasKeys(input: any) {
    if (typeof input !== 'object') return false;
    return Object.keys(input).length > 0;
  },

  trimVersionAdornments(version: string) {
    return (version || '').trim().replace(/^\^/, '').replace(/^\~/, '');
  },

  async asyncFilter<T>(list: T[], predicate: (value: T) => Promise<boolean>) {
    const results = await Promise.all(list.map(predicate));
    return list.filter((_, index) => results[index]);
  },
};
