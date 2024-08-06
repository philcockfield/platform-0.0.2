import type { t } from './common';

type O = Record<string, unknown>;

/**
 * Commands for the syncer.
 */
export type SyncCmdType = Ping | PingR | Purge | PurgeR;

/**
 * Ping: report that the status of the identity.
 * NB: useful for determining if the editor is still alive (will timeout if dead).
 */
type Ping = t.CmdType<'Ping', { identity: t.IdString }>;
type PingR = t.CmdType<'Ping:R', { identity: t.IdString; ok: boolean }>;

type Purge = t.CmdType<'Purge', { identity: t.IdString }>;
type PurgeR = t.CmdType<'Purge:R', t.SyncPurgeResponse>;

export type SyncCmdMethods = {
  ping: t.CmdMethodResponder<Ping, PingR>;
  purge: t.CmdMethodResponder<Purge, PurgeR>;
};
