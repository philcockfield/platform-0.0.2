/**
 * @external
 */
import { clone, equals } from 'ramda';
export const R = { clone, equals } as const;

export { next as A } from '@automerge/automerge';

/**
 * @system
 */
export { Time, rx } from 'sys.util';
