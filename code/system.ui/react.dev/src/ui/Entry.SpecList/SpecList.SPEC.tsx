import { SpecList } from '.';
import { css, Pkg, Spec } from '../../test.ui';

const ci = {
  image: 'https://github.com/cellplatform/platform-0.2.0/actions/workflows/node.esm.yml/badge.svg',
  href: 'https://github.com/cellplatform/platform-0.2.0/actions/workflows/node.esm.yml',
};

export default Spec.describe('SpecList', (e) => {
  e.it('init', async (e) => {
    const ctx = Spec.ctx(e);

    ctx.component
      .size('fill')
      .backgroundColor(1)
      .render(async (e) => {
        const { SampleSpecs, ModuleSpecs } = await import('../../test.ui/entry.Specs.mjs');

        const specs = {
          ...SampleSpecs,
          ...ModuleSpecs,
        };

        return (
          <div {...css({ Absolute: 0, Scroll: true })}>
            <SpecList title={Pkg.name} version={Pkg.version} imports={specs} badge={ci} />
          </div>
        );
      });
  });
});
