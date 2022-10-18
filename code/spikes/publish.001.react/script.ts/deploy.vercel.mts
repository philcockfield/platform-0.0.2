import { Vercel } from 'cloud.vercel';
import { rx } from 'sys.util';

import { t } from '../src/common/index.mjs';
import pc from 'picocolors';

export async function pushToVercel(args: {
  fs: t.Fs;
  token: string;
  version: string;
  source: string;
  bus?: t.EventBus<any>;
}) {
  const { fs, token, version, source } = args;
  const bus = args.bus ?? rx.bus();

  const vercel = Vercel.client({ bus, token, fs });
  const res = await vercel.deploy({
    team: 'tdb',
    name: `tdb.undp.v${version}`,
    project: 'tdb-undp',
    source,
    alias: 'undp.db.team',
    ensureProject: true,
    regions: ['sfo1'],
    target: 'production', // NB: required to be "production" for the DNS alias to be applied.
    silent: false, // Standard BEFORE and AFTER deploy logging to console.
    timeout: 30000,
  });

  console.info(pc.bold(pc.green(`version: ${pc.white(version)}`)));

  return res;
}
