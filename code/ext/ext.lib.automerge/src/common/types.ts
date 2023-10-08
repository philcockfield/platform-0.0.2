/**
 * @external
 */
export type { next as A, Patch, PatchInfo } from '@automerge/automerge';
export type {
  AutomergeUrl,
  DocHandle,
  NetworkAdapter,
  Repo,
  StorageAdapter,
} from '@automerge/automerge-repo';
export type { Observable } from 'rxjs';

/**
 * @system
 */
export type { SpecImport, TestSuiteRunResponse } from 'sys.test.spec/src/types.mjs';
export type {
  Disposable,
  EventBus,
  Immutable,
  ImmutableNext,
  Lifecycle,
  UntilObservable,
} from 'sys.types/src/types';

/**
 * @local
 */
export type * from '../types';
