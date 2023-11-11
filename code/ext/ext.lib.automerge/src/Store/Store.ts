import { Repo } from '@automerge/automerge-repo';
import { Doc } from './Store.Doc';
import { StoreIndex as Index } from './Store.Index';
import { DEFAULTS, Is, Time, DocUri as Uri, rx, type t } from './common';

type Uri = t.DocUri | string;
type Options = { timeout?: t.Msecs };

/**
 * Manage an Automerge repo.
 */
export const Store = {
  Uri,
  Index,

  /**
   * Initialize a new instance of a CRDT repo.
   */
  init(options: { repo?: t.Repo; dispose$?: t.UntilObservable } = {}) {
    const life = rx.lifecycle(options.dispose$);
    const { dispose$, dispose } = life;
    const repo = options.repo ?? new Repo({ network: [] });

    const api: t.Store = {
      get repo() {
        return repo;
      },

      doc: {
        /**
         * Create an "initial constructor" factory for typed docs.
         */
        factory<T>(initial: t.ImmutableNext<T>) {
          return (uri?: Uri) => api.doc.getOrCreate<T>(initial, uri);
        },

        /**
         * Find or create a new CRDT document from the repo.
         */
        async getOrCreate<T>(initial: t.ImmutableNext<T>, uri?: Uri) {
          const res = Doc.getOrCreate<T>(api.repo, { initial, uri, dispose$ });
          await res.handle.whenReady();
          return res;
        },

        /**
         * Find the existing CRDT document in the repo (or return nothing).
         */
        async get<T>(uri?: Uri, options: Options = {}) {
          if (!Is.automergeUrl(uri)) return undefined;

          type R = t.DocRefHandle<T> | undefined;
          return new Promise<R>((resolve) => {
            const { timeout = DEFAULTS.timeout.find } = options;
            const ref = Doc.get<T>(api.repo, uri, dispose$);
            if (!ref) return resolve(undefined);

            const done$ = rx.subject();
            const done = (res: R) => {
              rx.done(done$);
              resolve(res);
            };

            Time.until(done$).delay(timeout, () => done(undefined));
            ref.handle.whenReady().then(() => done(ref));
          });
        },

        /**
         * Determine if the given document exists within the repo.
         */
        async exists(uri?: Uri, options: Options = {}) {
          const res = await api.doc.get(uri, options);
          return Boolean(res);
        },
      },

      /**
       * Lifecycle
       */
      dispose,
      dispose$,
      get disposed() {
        return life.disposed;
      },
    } as const;

    return api;
  },
} as const;
