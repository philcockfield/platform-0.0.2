import { COLORS, Color, CrdtInfo, Dev, Monaco, Pkg, TestDb, css } from '../../test.ui';
import { setupStore, type D } from './-SPEC.store';
import { Doc, type t } from './common';

type T = {
  reload?: boolean;
  theme?: t.CommonTheme;
  strategy?: t.UpdateTextStrategy;
};
const initial: T = {};

/**
 * Spec
 */
const name = `${Pkg.name}.syncer`;
export default Dev.describe(name, async (e) => {
  type LocalStore = Pick<T, 'strategy' | 'theme'>;
  const localstore = Dev.LocalStorage<LocalStore>(`dev:${Pkg.name}.${name}`);
  const local = localstore.object({
    theme: 'Dark',
    strategy: 'Splice',
  });

  const { db, store, index, doc } = await setupStore(`spec:${name}`);
  const lens = Doc.lens<D, t.SampleDoc>(doc, ['sample'], (d) => (d.sample = {}));

  console.group('🌳 state (syncer sample)');
  console.info(`db: "${db.name}"`);
  console.info('store', store);
  console.info('index', index);
  console.groupEnd();

  e.it('ui:init', async (e) => {
    const ctx = Dev.ctx(e);
    const dev = Dev.tools<T>(e, initial);

    const state = await ctx.state<T>(initial);
    await state.change((d) => {
      d.theme = local.theme;
      d.strategy = local.strategy;
    });

    doc.events().changed$.subscribe(() => dev.redraw('debug'));

    const handleReady = (debugLabel: string, monaco: t.Monaco, editor: t.MonacoCodeEditor) => {
      console.info(`⚡️ MonacoEditor.onReady (${debugLabel})`);
      const Syncer = Monaco.Crdt.Syncer;
      Syncer.listen<t.SampleDoc>(monaco, editor, lens, ['code'], {
        debugLabel,
        strategy: () => state.current.strategy,
      });
    };

    ctx.debug.width(330);
    ctx.subject
      .size('fill')
      .display('grid')
      .render<T>((e) => {
        const theme = Color.theme(e.state.theme);

        Dev.Theme.background(ctx, theme, 1);

        if (e.state.reload) {
          return <TestDb.DevReload onCloseClick={() => state.change((d) => (d.reload = false))} />;
        } else {
          const border = `solid 1px ${Color.alpha(theme.fg, 0.1)}`;
          const styles = {
            base: css({ display: 'grid', gridTemplateRows: '1fr 1fr', rowGap: '30px' }),
            top: css({ borderBottom: border }),
            bottom: css({ borderTop: border }),
          };
          return (
            <div {...styles.base}>
              <Monaco.Editor
                focusOnLoad={true}
                theme={theme.name}
                style={styles.top}
                onReady={(e) => handleReady('top', e.monaco, e.editor)}
              />
              <Monaco.Editor
                theme={theme.name}
                style={styles.bottom}
                onReady={(e) => handleReady('bottom', e.monaco, e.editor)}
              />
            </div>
          );
        }
      });
  });

  e.it('ui:debug', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();

    dev.row((e) => {
      return (
        <CrdtInfo
          fields={['Module', 'Component', 'Repo', 'Doc', 'Doc.URI']}
          data={{
            component: { name, label: 'Syncer: UI ↔︎ CRDT' },
            repo: { store, index },
            document: {
              ref: doc,
              uri: { head: true },
              object: { expand: { level: 3 } },
            },
          }}
        />
      );
    });

    dev.hr(5, 20);

    dev.section((dev) => {
      Dev.Theme.switch(dev, ['theme'], (next) => (local.theme = next));
      dev.hr(-1, 5);
      const strategy = (strategy: t.UpdateTextStrategy) => {
        dev.button((btn) => {
          btn
            .label(`strategy: "${strategy}"`)
            .right((e) => (e.state.strategy === strategy ? '←' : ''))
            .onClick((e) => e.change((d) => (local.strategy = d.strategy = strategy)));
        });
      };
      strategy('Splice');
      strategy('Overwrite');
    });

    dev.TODO('"Splice" replacement not stable');

    dev.hr(5, 20);

    dev.section('Debug', (dev) => {
      dev.button('redraw', (e) => dev.redraw());
      dev.button('reload', (e) => location.reload());
      dev.hr(-1, 5);

      dev.button('change: sample.code', (e) => {
        const count = doc.current.count;
        const text = `const msg = "hello world 👋";\nconst count = ${count};\n`;
        lens.change((d) => (d.code = text));
      });

      dev.button('change: sample.name', (e) => {
        doc.change((d) => d.count++);
        const count = doc.current.count;
        lens.change((d) => (d.name = `name.${count}`));
      });

      dev.hr(-1, 5);

      dev.button((btn) => {
        btn
          .label(`change: increment count`)
          .right((e) => `${doc.current.count} + 1`)
          .onClick((e) => doc.change((d) => d.count++));
      });

      dev.hr(-1, 5);

      dev.button([`delete db: "${db.name}"`, '💥'], async (e) => {
        await e.change((d) => (d.reload = true));
        await TestDb.Spec.deleteDatabase();
      });
    });
  });

  e.it('ui:footer', async (e) => {
    const dev = Dev.tools<T>(e, initial);
    const state = await dev.state();
    dev.footer.border(-0.1).render<T>((e) => {
      const data = {
        ['crdt.doc']: doc.toObject(),
      };
      return <Dev.Object name={name} data={data} expand={1} />;
    });
  });
});
