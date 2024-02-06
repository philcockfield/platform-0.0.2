import { SpecList, DEFAULTS } from '.';
import { Pkg, Spec, type t } from '../../test.ui';

export default Spec.describe('SpecList', (e) => {
  e.it('init', async (e) => {
    const ctx = Spec.ctx(e);

    ctx.subject
      .size('fill')
      .backgroundColor(1)
      .render(async (e) => {
        const { SampleSpecs, ModuleSpecs } = await import('../../test.ui/entry.Specs.mjs');

        const fn = () => import('../../test.ui/sample.specs/-SPEC.MySample');
        const specs = {
          ...SampleSpecs,
          ...ModuleSpecs,
          foo: fn,
        };

        const NUMBERS = ['one', 'two', 'three', 'four'];
        const add = (key: string) => ((specs as t.SpecImports)[key] = fn);
        const addSamples = (prefix: string) => NUMBERS.forEach((num) => add(`${prefix}.${num}`));

        addSamples('foo.bar');
        addSamples('foo.baz');
        add('zoo');

        return (
          <SpecList
            title={Pkg.name}
            version={Pkg.version}
            specs={specs}
            hrDepth={2}
            scroll={true}
            // filter={'foo'}
            selectedIndex={0}
            badge={DEFAULTS.badge}
            onChildVisibility={(e) => {
              console.info('⚡️ onChildVisibility', e);
            }}
          />
        );
      });
  });
});
