import { Cmd, DEFAULTS } from '.';
import { Doc, Store } from '../crdt';
import { A, R, describe, expect, it, rx, type t } from '../test';

describe('crdt.cmd (Command)', () => {
  type C = C1 | C2;
  type C1 = t.CmdType<'Foo', { foo: number }>;
  type C2 = t.CmdType<'Bar', { msg?: string }>;

  describe('Cmd', () => {
    it('Cmd.DEFAULTS', () => {
      expect(Cmd.DEFAULTS).to.eql(DEFAULTS);
      expect(DEFAULTS.counter()).to.instanceOf(A.Counter);
    });

    it('create ← {paths} param variants', async () => {
      const { factory, dispose } = await testSetup();
      const paths: t.CmdPaths = {
        name: ['a'],
        params: ['x', 'p'],
        counter: ['x', 'n'],
        tx: ['x', 'tx'],
      };

      const doc1 = await factory();
      const doc2 = await factory();
      const doc3 = await factory();

      const cmd1 = Cmd.create<C>(doc1);
      const cmd2 = Cmd.create<C>(doc2, { paths });
      const cmd3 = Cmd.create<C>(doc3, paths);

      const tx = 'tx.foo';
      cmd1.invoke('Foo', { foo: 888 }, { tx });
      cmd2.invoke('Bar', {}, { tx });
      cmd3.invoke('Bar', { msg: '👋' }, { tx });

      expect(doc1.current).to.eql({ name: 'Foo', params: { foo: 888 }, counter: { value: 1 }, tx });
      expect(doc2.current).to.eql({ a: 'Bar', x: { p: {}, n: { value: 1 }, tx } });
      expect(doc3.current).to.eql({ a: 'Bar', x: { p: { msg: '👋' }, n: { value: 1 }, tx } });

      dispose();
    });

    it('has initial {cmd} structure upon creation', async () => {
      const { doc, dispose } = await testSetup();
      const lens = Doc.lens(doc, ['foo', 'bar'], (d) => (d.foo = { bar: {} }));

      expect(Cmd.Is.initialized(doc.current)).to.eql(false);
      expect(Cmd.Is.initialized(lens.current)).to.eql(false);

      Cmd.create(doc);
      expect(Cmd.Is.initialized(doc.current)).to.eql(true);
      expect(Cmd.Is.initialized(lens.current)).to.eql(false);

      Cmd.create(lens);
      expect(Cmd.Is.initialized(lens.current)).to.eql(true);
      expect(Cmd.Is.initialized((doc.current as any).foo.bar)).to.eql(true);

      dispose();
    });

    const length = 1000;
    it(`${length}x invocations - order retained`, async () => {
      const { doc, dispose, dispose$ } = await testSetup();
      const cmd = Cmd.create<C>(doc);

      const fired: t.CmdInvoked<C1>[] = [];
      cmd
        .events(dispose$)
        .name('Foo')
        .subscribe((e) => fired.push(e));

      Array.from({ length }).forEach((_, i) => cmd.invoke('Foo', { foo: i + 1 }));
      expect(fired.length).to.eql(length);
      expect(fired[length - 1].params.foo).to.eql(length);
      expect(fired.map((e) => e.count)).to.eql(Array.from({ length }, (_, i) => i + 1));

      dispose();
    });
  });

  describe('Cmd.Events', () => {
    describe('lifecycle', () => {
      it('Cmd.Events.create → dispose', () => {
        const life = rx.disposable();
        const { dispose$ } = life;
        const events1 = Cmd.Events.create(undefined, {});
        const events2 = Cmd.Events.create(undefined, { dispose$ });
        expect(events1.disposed).to.eql(false);
        expect(events2.disposed).to.eql(false);

        events1.dispose();
        life.dispose();
        expect(events1.disposed).to.eql(true);
        expect(events2.disposed).to.eql(true);
      });

      it('cmd.events() → dispose', async () => {
        const { doc, dispose } = await testSetup();
        const life = rx.disposable();

        const cmd = Cmd.create<C>(doc);
        const events1 = cmd.events();
        const events2 = cmd.events(life.dispose$);
        expect(events1.disposed).to.eql(false);
        expect(events2.disposed).to.eql(false);

        events1.dispose();
        expect(events1.disposed).to.eql(true);
        expect(events2.disposed).to.eql(false);

        life.dispose();
        expect(events1.disposed).to.eql(true);
        expect(events2.disposed).to.eql(true);

        dispose();
      });
    });

    const invoked: t.CmdInvokedEvent['type'] = 'crdt:cmd/Invoked';
    describe(`event: "${invoked}"`, () => {
      it('⚡️← on root {doc}', async () => {
        const { doc, dispose, dispose$ } = await testSetup();
        const cmd1 = Cmd.create<C>(doc);
        const cmd2 = Cmd.create<C2>(doc);
        const events = cmd1.events(dispose$);

        const fired: t.CmdEvent[] = [];
        const firedInvoked: t.CmdInvoked[] = [];
        events.$.subscribe((e) => fired.push(e));
        events.invoked$.subscribe((e) => firedInvoked.push(e));

        const tx = 'tx.foo';
        cmd1.invoke('Foo', { foo: 0 }, { tx });
        cmd1.invoke('Bar', {}, { tx });
        cmd2.invoke('Bar', { msg: 'hello' }, { tx }); // NB: narrow type scoped at creation (no "Foo" command).

        expect(fired.length).to.eql(3);
        expect(firedInvoked.length).to.eql(3);
        expect(fired.map((e) => e.payload)).to.eql(firedInvoked);

        const counts = firedInvoked.map((e) => e.count);
        expect(counts).to.eql([1, 2, 3]);
        expect(firedInvoked.map((e) => e.name)).to.eql(['Foo', 'Bar', 'Bar']);

        expect(firedInvoked[0].params).to.eql({ foo: 0 });
        expect(firedInvoked[1].params).to.eql({});
        expect(firedInvoked[2].params).to.eql({ msg: 'hello' });

        expect(doc.current).to.eql({
          name: 'Bar',
          params: { msg: 'hello' },
          counter: { value: counts[2] },
          tx,
        });
        dispose();
      });

      it('⚡️← on lens', async () => {
        const { doc, dispose, dispose$ } = await testSetup();
        const lens = Doc.lens(doc, ['foo'], (d) => (d.foo = {}));
        expect(doc.current).to.eql({ foo: {} });

        const cmd = Cmd.create<C>(lens);
        const fired: t.CmdInvoked[] = [];
        cmd.events(dispose$).invoked$.subscribe((e) => fired.push(e));

        const tx = 'tx.foo';
        cmd.invoke('Bar', { msg: 'hello' }, { tx });
        expect(fired.length).to.eql(1);

        expect(doc.current).to.eql({
          foo: {
            name: 'Bar',
            params: { msg: 'hello' },
            counter: { value: fired[0].count },
            tx,
          },
        });
        dispose();
      });

      it('⚡️← custom paths', async () => {
        const { doc, dispose, dispose$ } = await testSetup();

        const paths: t.CmdPaths = {
          name: ['a'],
          params: ['x', 'y', 'p'],
          counter: ['z', 'n'],
          tx: ['z', 'tx'],
        };

        const tx = 'tx.foo';
        const p = { msg: 'hello' };
        const cmd = Cmd.create<C>(doc, { paths });
        const fired: t.CmdInvoked[] = [];
        cmd.events(dispose$).invoked$.subscribe((e) => fired.push(e));
        cmd.invoke('Bar', p, { tx });
        expect(fired.length).to.eql(1);

        const count = fired[0].count;
        expect(doc.current).to.eql({ z: { n: { value: count }, tx }, a: 'Bar', x: { y: { p } } });
        dispose();
      });

      it('⚡️← unique tx (default)', async () => {
        const { doc, dispose, dispose$ } = await testSetup();
        const cmd = Cmd.create<C>(doc);

        const fired: t.CmdInvoked[] = [];
        cmd.events(dispose$).invoked$.subscribe((e) => fired.push(e));

        cmd.invoke('Foo', { foo: 0 });
        cmd.invoke('Bar', {});
        cmd.invoke('Bar', {}, { tx: '' }); // NB: empty string → tx IS generated.

        const txs = fired.map((e) => e.tx);

        expect(txs.length).to.eql(3);
        expect(txs.every((tx) => typeof tx === 'string')).to.eql(true);
        expect(txs.every((tx) => tx !== '')).to.eql(true);
        expect(R.uniq(txs).length).to.eql(txs.length);
        dispose();
      });

      it('⚡️← specified tx', async () => {
        const { doc, dispose, dispose$ } = await testSetup();
        const cmd = Cmd.create<C>(doc);

        const fired: t.CmdInvoked[] = [];
        cmd.events(dispose$).invoked$.subscribe((e) => fired.push(e));

        const tx = 'tx.foo';
        cmd.invoke('Foo', { foo: 0 }, { tx });
        cmd.invoke('Foo', { foo: 1 }, { tx });

        expect(fired.length).to.eql(2);
        expect(fired.every((e) => e.tx === tx)).to.eql(true);
        expect(fired[0].params).to.eql({ foo: 0 });
        expect(fired[1].params).to.eql({ foo: 1 });
        dispose();
      });

      it('⚡️← tx factory', async () => {
        const { doc, dispose, dispose$ } = await testSetup();

        let count = 0;
        const tx = () => {
          count++;
          return `👋.${count}`;
        };
        const cmd = Cmd.create<C>(doc, { tx });

        const fired: t.CmdInvoked[] = [];
        cmd.events(dispose$).invoked$.subscribe((e) => fired.push(e));

        cmd.invoke('Bar', {});
        cmd.invoke('Bar', {});

        expect(fired[0].tx).to.eql('👋.1');
        expect(fired[1].tx).to.eql('👋.2');
        dispose();
      });
    });

    describe('filter', () => {
      it('.name<T>( ⚡️) ', async () => {
        const { doc, dispose, dispose$ } = await testSetup();
        const cmd = Cmd.create<C>(doc);
        const events = cmd.events(dispose$);

        const fired: t.CmdInvoked[] = [];
        events.name('Foo').subscribe((e) => fired.push(e));

        cmd.invoke('Foo', { foo: 0 });
        cmd.invoke('Bar', {}); // NB: filtered out.

        expect(fired.length).to.eql(1);
        expect(fired[0].name).to.eql('Foo');
        expect(fired[0].params).to.eql({ foo: 0 });

        dispose();
      });
    });
  });

  describe('Cmd.Path', () => {
    const Path = Cmd.Path;

    describe('Path.resolver', () => {
      type P = { foo: number };
      type C = t.CmdType<'Foo', P>;
      const resolver = Path.resolver;

      it('default paths', () => {
        const resolve = resolver();
        expect(resolve.paths).to.eql(DEFAULTS.paths);

        const counter = DEFAULTS.counter();
        const count = counter.value;
        const name = 'foo.bar';
        const params: P = { foo: 0 };
        const tx = 'tx.foo';
        const obj: t.CmdLens = { name, params, counter, tx };
        expect(resolve.name(obj)).to.eql(name);
        expect(resolve.params(obj, {})).to.eql(params);
        expect(resolve.counter(obj)).to.eql(counter);
        expect(resolve.tx(obj)).to.eql(tx);
        expect(resolve.toObject(obj)).to.eql({ count, name, params, tx });
      });

      it('custom paths', () => {
        const resolve = resolver({
          name: ['a'],
          params: ['x', 'y', 'p'],
          counter: ['z', 'n'],
          tx: ['z', 'tx'],
        });
        const tx = 'tx.foo';
        const n = DEFAULTS.counter();
        const params: P = { foo: 123 };
        const name = 'foo.bar';
        const obj = {
          a: name,
          x: { y: { p: params } },
          z: { n, tx },
        };
        expect(resolve.name(obj)).to.eql(name);
        expect(resolve.params<P>(obj, { foo: 0 })).to.eql(params);
        expect(resolve.counter(obj)).to.eql(n);
        expect(resolve.tx(obj)).to.eql(tx);
        expect(resolve.toObject(obj)).to.eql({ count: n.value, name, params, tx });
      });

      it('.params: generates new object', () => {
        const resolve = resolver(DEFAULTS.paths);
        const params: P = { foo: 0 };
        const obj1: t.CmdLens<C> = {};
        const obj2: t.CmdLens<C> = { params: { foo: 123 } };
        expect(resolve.params(obj1, params).foo).to.eql(0);
        expect(resolve.params(obj2, params).foo).to.eql(123);
      });

      it('.count: generates new object', () => {
        const resolve = resolver(DEFAULTS.paths);
        const counter = DEFAULTS.counter(10);
        const obj1: t.CmdLens<C> = {};
        const obj2: t.CmdLens<C> = { counter };
        expect(resolve.counter(obj1).value).to.eql(0);
        expect(resolve.counter(obj2).value).to.eql(10);
      });
    });

    describe('Path.prepend', () => {
      it('defaults', () => {
        const res = Path.prepend(DEFAULTS.paths, ['foo', 'bar']);
        expect(res).to.eql({
          name: ['foo', 'bar', 'name'],
          params: ['foo', 'bar', 'params'],
          counter: ['foo', 'bar', 'counter'],
          tx: ['foo', 'bar', 'tx'],
        });
      });

      it('custom', () => {
        const input: t.CmdPaths = {
          name: ['a'],
          params: ['x', 'y', 'p'],
          counter: ['z', 'n'],
          tx: ['z', 'tx'],
        };
        const res = Path.prepend(input, ['foo']);
        expect(res).to.eql({
          name: ['foo', 'a'],
          params: ['foo', 'x', 'y', 'p'],
          counter: ['foo', 'z', 'n'],
          tx: ['foo', 'z', 'tx'],
        });
      });
    });

    describe('Path.is', () => {
      it('is.stringArray', () => {});

      it('is.commandPaths', () => {
        const NOT = [undefined, null, 123, true, {}, [], Symbol('foo'), BigInt(123), ''];
        NOT.forEach((value) => expect(Path.is.commandPaths(value)).to.eql(false));
        expect(Path.is.commandPaths({ counter: [123], name: ['hello'], params: [] })).to.eql(false);
        expect(Path.is.commandPaths(DEFAULTS.paths)).to.eql(true);
        expect(
          Path.is.commandPaths({
            name: ['a'],
            params: ['x', 'y', 'p'],
            counter: ['z', 'tx'],
            tx: ['abc', 'tx'],
          }),
        ).to.eql(true);
      });
    });
  });

  describe('Cmd.Is', () => {
    const Is = Cmd.Is;
    it('Is.initialized', () => {
      const NOT = [null, undefined, 123, 'abc', {}, [], Symbol('foo'), BigInt(0)];
      NOT.forEach((v) => expect(Is.initialized(v)).to.eql(false));
      expect(Is.initialized({ name: '', params: {}, counter: { value: 0 }, tx: '' })).to.eql(true);
    });
  });

  describe('Cmd: call → response', () => {
    type P = { a: number; b: number };
    type R = { sum: number };
    type C = C1 | C2;
    type C1 = t.CmdType<'add', P>;
    type C2 = t.CmdType<'add:res', R>;

    it('manual example (primitive)', async () => {
      const { doc, dispose, dispose$ } = await testSetup();
      const cmd = Cmd.create<C>(doc);
      const events = cmd.events(dispose$);

      const sum = (params: P): R => ({ sum: params.a + params.b });
      const responses: t.CmdInvoked<C2>[] = [];
      events.name('add').subscribe((e) => cmd.invoke('add:res', sum(e.params)));
      events.name('add:res').subscribe((e) => responses.push(e));

      cmd.invoke('add', { a: 2, b: 3 });
      expect(responses[0].params.sum).to.eql(5);
      dispose();
    });

    it.skip('handler → cmd.invoke.response<R>', async () => {
      // cmd.invoke.response<R>
      // cmd.invoke.listen<R> ← ??
    });
  });
});

/**
 * Helpers
 */
async function testSetup() {
  const store = Store.init();
  const { dispose$ } = store;
  const factory = store.doc.factory((d) => d);
  const doc = await factory();
  const dispose = () => store.dispose();
  return { store, doc, factory, dispose, dispose$ } as const;
}
