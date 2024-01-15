import { Lens, rx, toObject, type t } from './common';

export const Namespace = {
  /**
   * Create a [Lens] namespace manager for (or within) the a root document.
   *
   * [Context]:
   *      This allows multiple lens to be created on a {map}
   *      object within the single document.
   */
  init<R extends {}, N extends string = string>(
    root: t.DocRef<R>,
    getMap?: t.NamespaceMapGetLens<R>,
    options?: { dispose$: t.UntilObservable },
  ): t.NamespaceManager<R, N> {
    const events = root.events(options?.dispose$);
    const { dispose, dispose$ } = events;
    const container = wrangle.containerLens<R, N>(root, getMap, dispose$);
    const cache = new Map<N, t.Lens<R, {}>>();
    dispose$.subscribe(() => cache.clear());

    /**
     * API
     */
    const api: t.NamespaceManager<R, N> = {
      kind: 'crdt:namespace',

      get $() {
        return container.$;
      },

      get container() {
        type T = t.NamespaceMap<N>;
        if (api.disposed) return {} as T;

        const res = {} as T;
        Array.from(cache).forEach(([key, value]) => (res[key] = toObject(value.current)));
        return res;
      },

      list<L extends {}>() {
        return Array.from(cache).map((item) => {
          const namespace = item[0] as N;
          const lens = item[1] as t.Lens<R, L>;
          return { namespace, lens };
        });
      },

      lens<L extends {}>(namespace: N, initial: L) {
        if (cache.has(namespace)) return cache.get(namespace) as t.Lens<R, L>;

        const lens = Lens<R, L>(
          root,
          (draft) => {
            const container = wrangle.container<R, N>(draft, getMap);
            const subject = container[namespace] || (container[namespace] = initial ?? {});
            return subject as L;
          },
          { dispose$ },
        );

        cache.set(namespace, lens);
        lens.dispose$.pipe(rx.take(1)).subscribe(() => cache.delete(namespace));
        return lens;
      },

      /**
       * Lifecycle
       */
      dispose$,
      dispose,
      get disposed() {
        return events.disposed;
      },
    };

    return api;
  },
} as const;

/**
 * Helpers
 */
const wrangle = {
  container<R extends {}, N extends string = string>(root: R, getMap?: t.NamespaceMapGetLens<R>) {
    return (getMap ? getMap(root) : root) as t.NamespaceMap<N>;
  },

  containerLens<R extends {}, N extends string = string>(
    root: t.DocRef<R>,
    getMap?: t.NamespaceMapGetLens<R>,
    dispose$?: t.Observable<any>,
  ) {
    return Lens<R, t.NamespaceMap<N>>(
      root,
      (draft) => wrangle.container<R, N>(draft, getMap),
      { dispose$ },
      //
    );
  },
};