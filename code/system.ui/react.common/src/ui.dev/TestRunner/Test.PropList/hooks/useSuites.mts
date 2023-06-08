import { useEffect, useState } from 'react';
import { Util } from '../Util.mjs';
import { rx, type t } from '../common';

/**
 * Handles turning an import promise into an initialized spec.
 */
export function useSuites(data: t.TestPropListData) {
  const modules = (data.run ?? {}).modules ?? [];

  const [loaded, setLoaded] = useState(false);
  const [groups, setGroups] = useState<t.TestSuiteGroup[]>([]);
  const hash = Wrangle.groupsHash(groups);

  /**
   * Lifecycle.
   */
  useEffect(() => {
    const lifecycle = rx.lifecycle();

    Util.importAndInitialize(data).then((groups) => {
      if (lifecycle.disposed) return;

      const total = Util.groupsToSuites(groups).length;
      const totalReady = Wrangle.totalReady(groups);

      setGroups(groups);
      setLoaded(totalReady === total);
    });

    return lifecycle.dispose;
  }, [hash, loaded, modules.length]);

  /**
   * API
   */
  return { groups };
}

/**
 * Helpers
 */
const Wrangle = {
  groupsHash(groups: t.TestSuiteGroup[]) {
    const hashes: string[] = [];
    Wrangle.eachSuite(groups, (suite) => hashes.push(suite.hash()));
    return hashes.join(',');
  },

  totalReady(groups: t.TestSuiteGroup[]) {
    let total = 0;
    Wrangle.eachSuite(groups, (suite) => (total += suite.ready ? 1 : 0));
    return total;
  },

  eachSuite(groups: t.TestSuiteGroup[], fn: (suite: t.TestSuiteModel) => void) {
    groups.forEach(({ suites }) => suites.forEach(fn));
  },
};
