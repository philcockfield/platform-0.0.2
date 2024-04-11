import { DEFAULTS, TestRunner, type t } from './common';

export function moduleVerify(data: t.InfoData, theme?: t.CommonTheme) {
  const ctx = {};
  return TestRunner.PropList.runner({
    ctx,
    theme,

    infoUrl() {
      const url = new URL(location.origin);
      url.searchParams.set(DEFAULTS.query.dev, 'ext.lib.privy.tests');
      return url.href;
    },

    async modules() {
      const { TESTS } = await import('../../test.ui/-TestRunner.TESTS');
      return TESTS.all;
    },
  });
}
