import { Cmd } from '..';
import { Time, type t } from './common';

import type { C, C1 } from './t';
const DEFAULTS = Cmd.DEFAULTS;

export function cmdTests(setup: t.CmdTestSetup, args: t.TestArgs) {
  const { describe, it, expect } = args;
  const total = Cmd.DEFAULTS.total();

  describe('Cmd', () => {
    it('Cmd.DEFAULTS', () => {
      expect(Cmd.DEFAULTS).to.eql(DEFAULTS);
    });

    it('Cmd.DEFAULTS.error', () => {
      const error: t.Error = { message: '🍌' };
      expect(DEFAULTS.error('🍌')).to.eql(error);
    });

    it('create ← {paths} param {object} variant', async () => {
      const { factory, dispose } = await setup();
      const paths: t.CmdPaths = {
        queue: ['x', 'q'],
        total: ['t', 'a'],
      };

      const doc1 = await factory();
      const doc2 = await factory();
      const doc3 = await factory();

      const cmd1 = Cmd.create<C>(doc1);
      const cmd2 = Cmd.create<C>(doc2, { paths });
      const cmd3 = Cmd.create<C>(doc3, paths);

      const tx = 'tx.foo';
      const e = DEFAULTS.error('404');
      cmd1.invoke('Foo', { foo: 888 }, tx);
      cmd2.invoke('Bar', {}, { tx, error: e }); // NB: as full {options} object.
      cmd3.invoke('Bar', { msg: '👋' }, tx);
      await Time.wait(0);

      expect(doc1.current).to.eql({
        total,
        queue: [{ name: 'Foo', params: { foo: 888 }, tx }],
      });

      expect(doc2.current).to.eql({
        x: { q: [{ name: 'Bar', params: {}, tx, error: e }] },
        t: { a: total },
      });

      expect(doc3.current).to.eql({
        x: { q: [{ name: 'Bar', params: { msg: '👋' }, tx }] },
        t: { a: total },
      });

      dispose();
    });

    it('create ← {paths} as [path] prefix', async () => {
      const { factory, dispose } = await setup();

      const doc = await factory();
      const paths = ['foo'];
      const cmd = Cmd.create<C>(doc, { paths });
      const tx = 'tx.foo';

      cmd.invoke('Foo', { foo: 888 }, tx);
      await Time.wait(0);

      expect(doc.current).to.eql({
        foo: {
          total,
          queue: [{ name: 'Foo', params: { foo: 888 }, tx }],
        },
      });

      dispose();
    });

    it('has initial {cmd} structure upon creation', async () => {
      const { doc, dispose } = await setup();
      expect(Cmd.Is.state.cmd(doc.current)).to.eql(false);

      Cmd.create(doc);
      expect(Cmd.Is.state.cmd(doc.current)).to.eql(true);

      dispose();
    });

    const length = 100;
    it(`${length}x invocations - order retained`, async () => {
      const { doc, dispose, dispose$ } = await setup();
      const cmd = Cmd.create<C>(doc);

      const fired: t.CmdTx<C1>[] = [];
      cmd
        .events(dispose$)
        .on('Foo')
        .subscribe((e) => fired.push(e));

      Array.from({ length }).forEach((_, i) => cmd.invoke('Foo', { foo: i + 1 }));

      await Time.wait(0);
      expect(fired.length).to.eql(length);
      expect(fired[length - 1].params.foo).to.eql(length);
      dispose();
    });

    describe('Hidden fields', () => {
      const NON = [null, undefined, {}, [], true, 123, Symbol('foo'), BigInt(0)];

      describe('Cmd.transport', () => {
        it('success', async () => {
          const { doc, dispose } = await setup();
          const cmd = Cmd.create<C>(doc);
          expect(Cmd.transport(cmd)).to.eql(doc);
          dispose();
        });

        it('throws', () => {
          NON.forEach((input: any) => {
            expect(() => Cmd.transport(input)).to.throw(/Input not a <Cmd>/);
          });
        });
      });

      describe('Cmd.paths', () => {
        it('success', async () => {
          const { doc, dispose } = await setup();

          const test = (paths: t.CmdPaths | undefined, expected: t.CmdPaths) => {
            const cmd = Cmd.create<C>(doc, { paths });
            const res = Cmd.paths(cmd);
            expect(res).to.eql(expected);
          };

          const paths: t.CmdPaths = {
            queue: ['x', 'q'],
            total: ['t', 'a'],
          };

          test(paths, paths);
          test(undefined, DEFAULTS.paths);

          dispose();
        });

        it('throws', () => {
          NON.forEach((input: any) => {
            expect(() => Cmd.paths(input)).to.throw(/Input not a <Cmd>/);
          });
        });
      });
    });
  });
}
