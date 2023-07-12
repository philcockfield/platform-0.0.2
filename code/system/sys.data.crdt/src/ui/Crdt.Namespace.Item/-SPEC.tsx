import { CrdtNamespaceItem, DEFAULTS } from '.';
import { Dev, Time, type t } from '../../test.ui';

type TRoot = { ns?: t.CrdtNsMap };
type TFoo = { count: number };

type T = {
  ref?: t.CrdtNamespaceItemRef;
  props: t.CrdtNamespaceItemProps;
  debug: { devBg?: boolean };
};
const initial: T = {
  props: { focusOnReady: true },
  debug: {},
};

export default Dev.describe('Namespace.Item', (e) => {
  type LocalStore = T['debug'] &
    Pick<
      t.CrdtNamespaceItemProps,
      'text' | 'enabled' | 'selected' | 'indent' | 'padding' | 'editing'
    >;
  const localstore = Dev.LocalStorage<LocalStore>('dev:sys.data.crdt.Namespace.Item');
  const local = localstore.object({
    text: '',
    enabled: DEFAULTS.enabled,
    selected: DEFAULTS.selected,
    indent: DEFAULTS.indent,
    padding: DEFAULTS.padding,
    editing: DEFAULTS.editing,
    devBg: true,
  });

  const State = {
    toDisplayProps(state: t.DevCtxState<T>): t.CrdtNamespaceItemProps {
      return {
        ...state.current.props,
        onReady(e) {
          console.info('⚡️ onReady', e);
        },
        onChange(e) {
          console.info('⚡️ onChange', e);
          state.change((d) => (local.text = d.props.text = e.text));
        },
        onClick(e) {
          console.info('⚡️ onClick', e);
        },
        onEnter() {
          console.info('⚡️ onEnter', e);
        },
      };
    },
  };

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const state = await ctx.state<T>(initial);

    state.change((d) => {
      d.props.text = local.text;
      d.props.enabled = local.enabled;
      d.props.selected = local.selected;
      d.props.indent = local.indent;
      d.props.padding = local.padding;
      d.props.editing = local.editing;
      d.debug.devBg = local.devBg;
    });

    ctx.debug.width(300);
    ctx.subject
      .size([280, null])
      .display('grid')
      .render<T>((e) => {
        const { debug } = e.state;
        ctx.subject.backgroundColor(debug.devBg ? 1 : 0);
        return (
          <CrdtNamespaceItem
            {...State.toDisplayProps(state)}
            onReady={(e) => {
              console.log('⚡️ onReady:', e);
              state.change((d) => (d.ref = e.ref));
            }}
          />
        );
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();

    const focus = () => {
      const ref = state.current.ref;
      Time.delay(0, () => ref?.focus());
    };

    dev.section('Properties', (dev) => {
      dev.textbox((txt) =>
        txt
          .placeholder('label text')
          .value((e) => e.state.props.text)
          .margin([0, 0, 10, 0])
          .onChange((e) => {
            state.change((d) => (local.text = d.props.text = e.to.value));
          }),
      );

      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.enabled);
        btn
          .label((e) => `enabled`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.enabled = Dev.toggle(d.props, 'enabled'))));
      });

      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.selected);
        btn
          .label((e) => `selected`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.selected = Dev.toggle(d.props, 'selected'))));
      });

      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.props.editing);
        btn
          .label((e) => `editing`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.editing = Dev.toggle(d.props, 'editing'))));
      });

      dev.hr(-1, 5);

      dev.boolean((btn) => {
        const defaultValue = DEFAULTS.indent;
        const value = (state: T) => state.props.indent ?? defaultValue;
        btn
          .label((e) => `indent = ${value(e.state)}`)
          .value((e) => value(e.state) !== defaultValue)
          .onClick((e) => {
            e.change((d) => {
              const current = d.props.indent ?? defaultValue;
              const next = current === defaultValue ? 15 : defaultValue;
              local.indent = d.props.indent = next;
            });
          });
      });

      dev.boolean((btn) => {
        const defaultValue = DEFAULTS.padding;
        const value = (state: T) => state.props.padding ?? defaultValue;
        btn
          .label((e) => `padding = ${value(e.state)}`)
          .value((e) => value(e.state) === defaultValue)
          .onClick((e) => {
            e.change((d) => {
              const current = d.props.padding ?? defaultValue;
              const next = current === defaultValue ? 0 : defaultValue;
              local.padding = d.props.padding = next;
            });
          });
      });
    });

    dev.hr(5, 20);

    dev.section(['States', '(update) ↑'], (dev) => {
      const updateLocalStorage = () => {
        const data = state.current;
        local.enabled = data.props.enabled;
        local.selected = data.props.selected;
        local.editing = data.props.editing;
        local.padding = data.props.padding;
        local.indent = data.props.indent;
        local.devBg = data.debug.devBg;
      };

      dev.button('default', async (e) => {
        await e.change((d) => {
          d.props.enabled = DEFAULTS.enabled;
          d.props.selected = DEFAULTS.selected;
          d.props.editing = DEFAULTS.editing;
          d.props.padding = DEFAULTS.padding;
          d.props.indent = DEFAULTS.indent;
        });
        updateLocalStorage();
      });

      dev.button('editing', async (e) => {
        await e.change((d) => {
          d.props.selected = false;
          d.props.editing = true;
        });
        updateLocalStorage();
        focus();
      });

      dev.hr(-1, 5);

      dev.button('selected', async (e) => {
        await e.change((d) => {
          d.props.selected = true;
          d.props.editing = false;
        });
        updateLocalStorage();
      });

      dev.button('editing → selected', async (e) => {
        await e.change((d) => {
          d.props.selected = true;
          d.props.editing = true;
        });
        updateLocalStorage();
        focus();
      });

      dev.hr(-1, 5);

      dev.button('clear (text)', async (e) => {
        await e.change((d) => (d.props.text = undefined));
        updateLocalStorage();
        focus();
      });
    });

    dev.hr(5, 20);

    dev.section('Debug', (dev) => {
      dev.boolean((btn) => {
        const value = (state: T) => Boolean(state.debug.devBg);
        btn
          .label((e) => `background`)
          .value((e) => value(e.state))
          .onClick((e) => e.change((d) => (local.devBg = Dev.toggle(d.debug, 'devBg'))));
      });
    });

    dev.hr(5, 20);

    dev.section(['Methods', 'ref={ ƒ }'], (dev) => {
      type F = (ref: t.CrdtNamespaceItemRef) => void;
      const focusThen = (msecs: number, ref: t.CrdtNamespaceItemRef, fn: F) => {
        ref.focus();
        Time.delay(msecs, () => fn(ref));
      };
      const action = (label: string, fn: F) => {
        dev.button(label, (e) => {
          const ref = e.state.current.ref;
          if (ref) fn(ref);
        });
      };
      action('focus', (ref) => ref.focus());
      action('focus → blur', (ref) => focusThen(500, ref, () => ref.blur()));
      dev.hr(-1, 5);
      action('selectAll', (ref) => focusThen(0, ref, () => ref.selectAll()));
      dev.hr(-1, 5);
      action('cursorToStart', (ref) => focusThen(0, ref, () => ref.cursorToStart()));
      action('cursorToEnd', (ref) => focusThen(0, ref, () => ref.cursorToEnd()));
    });
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();

    dev.footer.border(-0.1).render<T>((e) => {
      const props = State.toDisplayProps(state);
      const data = { props };
      return <Dev.Object name={'<Namespace.Item>'} data={data} expand={1} />;
    });
  });
});
