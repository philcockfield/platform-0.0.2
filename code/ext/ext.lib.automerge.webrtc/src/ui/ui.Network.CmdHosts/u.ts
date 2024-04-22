import { DEFAULTS, ObjectPath, type t } from './common';

type O = Record<string, unknown>;

export const resolver = (path: t.CmdHostPaths = DEFAULTS.paths) => {
  const resolve = ObjectPath.resolve;
  return {
    cmd: (doc: O) => resolve<string>(doc, path.cmd),
    address: (doc: O) => resolve<string>(doc, path.uri),
    selected: (doc: O) => resolve<t.Index>(doc, path.selected),
  } as const;
};