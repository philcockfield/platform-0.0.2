import { A, DEFAULTS, R, Time, slug, type t } from './common';

import { get } from './Doc.u.get';
import { Handle } from './u.Handle';

type Uri = t.DocUri | string;

/**
 * Find or initialize a new document from the repo.
 */
export async function getOrCreate<T>(args: {
  repo: t.Repo;
  initial: t.ImmutableNext<T>;
  uri?: Uri;
  dispose$?: t.UntilObservable;
  timeout?: t.Msecs;
}): Promise<t.DocRefHandle<T>> {
  const { repo, uri, timeout, dispose$ } = args;

  /**
   * Lookup existing URI requested.
   */
  if (uri) {
    const res = await get({ repo, uri, timeout, dispose$, throw: true });
    return res as t.DocRefHandle<T>;
  }

  /**
   * New document initialization.
   */
  const handle = repo.create<T>();
  await handle.whenReady();

  const message = DEFAULTS.message.initial;
  const time = Time.now.timestamp;
  const options: A.ChangeOptions<T> = { message, time };

  handle.change((d: any) => {
    args.initial(d);

    // Ensure the initializer function caused a change such that the
    // initial genesis timestamp is written into the commit history.
    if (R.equals(d, {})) mutate.emptyChange(d);
  }, options);

  // Finish up.
  return Handle.wrap<T>(handle, { dispose$ });
}

/**
 * Helpers
 */
const mutate = {
  emptyChange(d: any) {
    const key = `__tmp:${slug()}`;
    d[key] = 0;
    delete d[key]; // Clean up.
  },
} as const;