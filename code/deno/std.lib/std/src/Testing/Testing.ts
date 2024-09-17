import { describe, it } from '@std/testing/bdd';
import { expect } from 'npm:chai';

import type { t } from '../common/mod.ts';
import { TestServer } from './Test.Http.Server.ts';

export { describe, expect, it };

/**
 * Testing helpers.
 */
export const Testing: t.Testing = {
  /**
   * HTTP test helpers.
   */
  Http: {
    /**
     * Factory: create and start an HTTP test server.
     */
    server: TestServer.create,
  },
};
