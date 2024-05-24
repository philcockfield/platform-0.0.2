import { DEFAULTS, ObjectPath, type t } from './common';

type O = Record<string, unknown>;

/**
 * Helpers for resolving and mutating paths.
 */
export const Path = {
  /**
   * Factory for a resolver that reads path locations from the given abstract document.
   * This might be the root document OR a lens within a document.
   */
  resolver(paths: t.CmdPaths = DEFAULTS.paths) {
    const resolve = ObjectPath.resolve;
    const api = {
      paths,

      tx(d: O) {
        return resolve<string>(d, paths.tx) || '';
      },

      cmd(d: O) {
        return resolve<string>(d, paths.cmd) || '';
      },

      params<P extends O = O>(d: O, defaultParams: P) {
        const get = () => resolve<P>(d, paths.params);
        if (!get()) ObjectPath.mutate(d, paths.params, defaultParams);
        return get()!;
      },

      toDoc<P extends O = O>(d: O, options: { defaultParams?: P } = {}): t.CmdLensObject<P> {
        return {
          tx: api.tx(d),
          cmd: api.cmd(d),
          params: api.params<P>(d, (options.defaultParams ?? {}) as P),
        };
      },
    } as const;
    return api;
  },
} as const;
