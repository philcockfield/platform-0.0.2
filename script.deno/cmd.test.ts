import { Cmd, Log, type CmdResult } from './u.ts';

/**
 * Run all tests across the mono-repo.
 */
const results: CmdResult[] = [];
const run = async (path: string, args = '') => {
  const output = await Cmd.sh({ silent: true, path }).run(`deno test ${args}`);
  results.push({ output, path });
};

// Std Libs.
await run('code/deno/std.lib/std', '-RWN');
await run('code/deno/std.lib/std.s', '-RWN --allow-run');

// Drivers.
await run('code/deno/driver/driver.deno.cloud', '-RWN');

/**
 * Output.
 */
const success = Log.output(results, { title: 'Test Results', pad: true });
if (!success) Deno.exit(1);
