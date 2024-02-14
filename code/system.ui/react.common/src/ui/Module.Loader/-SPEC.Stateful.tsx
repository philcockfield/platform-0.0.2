import { DEFAULTS, ModuleLoader } from '.';
import { Dev, Pkg, Time, type t } from '../../test.ui';
import { factory, type N } from './-SPEC.factory';
import { WrangleSpec } from './-SPEC.wrangle';

type T = {
  props: t.ModuleLoaderStatefulProps;
  debug: { debugBg?: boolean; debugFill?: boolean; debugClearErrorButton?: boolean };
};
const initial: T = { props: {}, debug: {} };

/**
 * Spec: ModuleLoader.Stateful
 */
const name = `${DEFAULTS.displayName}.Stateful`;
export default Dev.describe(name, (e) => {
  type LocalStore = T['debug'] & Pick<t.ModuleLoaderStatefulProps, 'flipped' | 'theme'>;

  const localstore = Dev.LocalStorage<LocalStore>(`dev:${Pkg.name}.${name}`);
  const local = localstore.object({
    theme: DEFAULTS.theme,
    flipped: DEFAULTS.flipped,
    debugBg: true,
    debugFill: true,
    debugClearErrorButton: true,
  });

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const dev = Dev.tools<T>(e, initial);

    const state = await ctx.state<T>(initial);
    await state.change((d) => {
      d.props.flipped = local.flipped;
      d.props.theme = local.theme;
      d.props.spinner = { bodyOpacity: 0.3, bodyBlur: 6 };
      d.props.factory = factory;

      d.debug.debugBg = local.debugBg;
      d.debug.debugFill = local.debugFill;
      d.debug.debugClearErrorButton = local.debugClearErrorButton;
    });

    ctx.debug.width(330);
    ctx.subject
      .backgroundColor(1)
      .size([250, null])
      .display('grid')
      .render<T>((e) => {
        const { props, debug } = e.state;
        WrangleSpec.mutateSubject(dev, e.state);

        type E = t.ModuleLoaderErrorHandler;
        const handleErrorThenClear: E = async (e) => {
          console.info('⚡️ onError', e);
          await Time.wait(2500);
          e.clear();
        };

        return (
          <ModuleLoader.Stateful
            {...props}
            onError={debug.debugClearErrorButton ? undefined : handleErrorThenClear}
            onErrorCleared={(e) => console.info('⚡️ onErrorCleared', e)}
          />
        );
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();

    dev.section('', (dev) => {
      const link = WrangleSpec.link;
      link(dev, 'see: ModuleLoader (stateless)', 'Module.Loader');
      link(dev, 'see: ModuleLoader.Namespace', 'Module.Namespace');
      dev.hr(-1, 5);
      link(dev, 'see: unit tests', 'tests');
    });

    dev.hr(5, 20);

    dev.section('Properties', (dev) => {
      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.flipped);
        btn
          .label((e) => `flipped`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.flipped = Dev.toggle(d.props, 'flipped'))));
      });

      dev.hr(-1, 5);

      const buttonTheme = (theme: t.ModuleLoaderTheme) => {
        dev.button((btn) => {
          const value = (state: T) => state.props.theme;
          const isCurrent = (state: T) => value(state) === theme;
          btn
            .label(`theme: "${theme}"`)
            .right((e) => (isCurrent(e.state) ? `←` : ''))
            .onClick((e) => e.change((d) => (local.theme = d.props.theme = theme)));
        });
      };
      buttonTheme('Light');
      buttonTheme('Dark');
    });

    dev.hr(5, 20);

    dev.section('Factory', (dev) => {
      const btn = (name: N) => {
        dev.button(`factory: "${name}"`, (e) => {
          e.change((d) => (d.props.name = name));
        });
      };

      btn('foo.instant');
      btn('foo.delayed');
      dev.hr(-1, 5);
      dev.button('unload', (e) => e.change((d) => (d.props.name = undefined)));
    });

    dev.hr(5, 20);

    dev.section('Debug', (dev) => {
      dev.button('redraw', (e) => dev.redraw());
      dev.hr(-1, 5);
      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.debug.debugBg);
        btn
          .label((e) => `background: ${value(e.state) ? 'white' : '(none)'}`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.debugBg = Dev.toggle(d.debug, 'debugBg'))));
      });

      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.debug.debugFill);
        btn
          .label((e) => `size: ${value(e.state) ? 'filling screen' : 'specific contraint'}`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.debugFill = Dev.toggle(d.debug, 'debugFill'))));
      });

      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.debug.debugClearErrorButton);
        btn
          .label((e) => `error clearable`)
          .value((e) => value(e.state))
          .onClick((e) => {
            e.change((d) => {
              local.debugClearErrorButton = Dev.toggle(d.debug, 'debugClearErrorButton');
            });
          });
      });
    });
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    dev.footer.border(-0.1).render<T>((e) => {
      const data = e.state;
      return <Dev.Object name={name} data={data} expand={1} />;
    });
  });
});
