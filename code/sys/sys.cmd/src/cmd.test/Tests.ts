import { type t } from './common';

import { cmdTests } from './Tests.Cmd';
import { eventTests } from './Tests.Cmd.Events';
import { flagTests } from './Tests.Cmd.Is';
import { patchTests } from './Tests.Cmd.Patch';
import { pathTests } from './Tests.Cmd.Path';
import { responseTests } from './Tests.Cmd.Response';

/**
 * Unit test factory for the <Cmd> system allowing different
 * kinds of source <ImmutableRef> and <Patch> types to be tested
 * against the same standard test suite.
 */
export const Tests = {
  all(setup: t.CmdTestSetup, args: t.TestArgs) {
    Object.entries(Tests.index).forEach(([, test]) => test(setup, args));
  },
  index: {
    cmdTests,
    pathTests,
    eventTests,
    flagTests,
    patchTests,
    responseTests,
  },
} as const;
