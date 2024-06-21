import { Cmd } from '..';
import { Time, type t } from './common';

export function responseTests(setup: t.CmdTestSetup, args: t.TestArgs) {
  const { describe, it, expect } = args;

  type P = { a: number; b: number };
  type R = { sum: number };
  type E = t.Error & { code: number; type: 'bounds' };
  type C = C1 | C2 | C3;
  type C1 = t.CmdType<'add', P, C2, E>;
  type C2 = t.CmdType<'add:res', R>;
  type C3 = t.CmdType<'foo', { msg?: string }>;
  const sum = ({ a, b }: P): R => ({ sum: a + b });

  describe('examples', () => {
    /**
     * This manual example shows the basics of call and response
     * using nothing but the {Cmd} primitives.
     *
     * The {Response} and {Listener} helpers are simply wrappers
     * around the observable pattern below to provide some strongly
     * typed developer ergonomics.
     */
    it('via manual event hookup', async () => {
      const { doc, dispose, dispose$ } = await setup();
      const cmd = Cmd.create<C>(doc);
      const events = cmd.events(dispose$);

      const responses: t.CmdTx<C2>[] = [];
      events.on('add').subscribe((e) => cmd.invoke('add:res', sum(e.params)));
      events.on('add:res').subscribe((e) => responses.push(e));

      cmd.invoke('add', { a: 2, b: 3 });
      await Time.wait(20);

      expect(responses[0].params.sum).to.eql(5);
      dispose();
    });
  });

  it('Response {object} → "tx" passing', async () => {
    const { doc, dispose } = await setup();
    const cmd = Cmd.create<C>(doc);

    const tx = 'tx.abc';
    const res1 = cmd.invoke('foo', {}, { tx });
    const res2 = cmd.invoke('add', 'add:res', { a: 1, b: 2 }, { tx });

    expect(typeof res1 === 'object').to.be.true;
    expect((res1 as any).listen).to.be.undefined;
    expect(typeof res2 === 'object').to.be.true;

    expect(res1.tx).to.eql(tx);
    expect(res2.tx).to.eql(tx);

    expect(res1.req.name === 'foo').to.be.true;
    expect(res1.req.params).to.eql({});

    expect(res2.req.name === 'add').to.be.true;
    expect(res2.req.params).to.eql({ a: 1, b: 2 });

    dispose();
  });

  describe('Response (listen)', () => {
    it('listen', async () => {
      const { doc, dispose, dispose$ } = await setup();
      const cmd = Cmd.create<C>(doc);
      const events = cmd.events(dispose$);
      events.on('add').subscribe((e) => cmd.invoke('add:res', sum(e.params), e.tx));

      const res = cmd.invoke('add', 'add:res', { a: 1, b: 2 });

      expect(res.tx).to.be.a.string;
      expect(res.req.name).to.eql('add');
      expect(res.req.params.a).to.eql(1);
      expect(res.req.params.b).to.eql(2);

      expect(res.status).to.eql('Pending');
      expect(res.result).to.eql(undefined);
      expect(res.disposed).to.eql(false);

      await Time.wait(10);

      expect(res.ok).to.eql(true);
      expect(res.status).to.eql('Complete');
      expect(res.result?.sum).to.eql(3);
      expect(res.disposed).to.eql(true);

      dispose();
    });

    it('listen → events.on("name", fn:<callback>)', async () => {
      const { doc, dispose, dispose$ } = await setup();
      const cmd = Cmd.create<C>(doc);
      cmd.events(dispose$).on('add', function (e) {
        cmd.invoke('add:res', sum(e.params), e.tx);
      });

      const res = cmd.invoke('add', 'add:res', { a: 2, b: 3 });
      await Time.wait(10);

      expect(res.result?.sum).to.eql(5);
      dispose();
    });

    it('listen → {promise}', async () => {
      const { doc, dispose, dispose$ } = await setup();
      const cmd = Cmd.create<C>(doc);
      cmd.events(dispose$).on('add', (e) => cmd.invoke('add:res', sum(e.params), e.tx));

      const res = cmd.invoke('add', 'add:res', { a: 2, b: 3 });
      expect(res.result).to.eql(undefined);

      const promise = await res.promise();
      expect(res.result?.sum).to.eql(5);
      expect(promise.result?.sum).to.eql(5);

      dispose();
    });

    it('listen ← timeout', async () => {
      const { doc, dispose, dispose$ } = await setup();
      const cmd = Cmd.create<C>(doc);
      cmd.events(dispose$).on('add', async (e) => {
        await Time.wait(20); // NB: response is issued after invokation has timed-out.
        cmd.invoke('add:res', sum(e.params), e.tx);
      });

      const timeout = 10;
      const res = cmd.invoke('add', 'add:res', { a: 1, b: 2 }, { timeout });
      expect(res.ok).to.eql(true);
      expect(res.status).to.eql('Pending');
      expect(res.disposed).to.eql(false);

      await Time.wait(50);

      expect(res.ok).to.eql(false);
      expect(res.status === 'Timeout').to.eql(true);
      expect(res.result).to.eql(undefined);
      expect(res.disposed).to.eql(true);

      dispose();
    });

    it('listen(ƒ) ← register callback: onComplete', async () => {
      const { doc, dispose, dispose$ } = await setup();
      const cmd = Cmd.create<C>(doc);

      const fired: t.CmdResponseHandlerArgs<C1>[] = [];
      const events = cmd.events(dispose$);
      events.on('add', (e) => cmd.invoke('add:res', sum(e.params), e.tx));

      // Handler passed to listener constructor.
      await cmd.invoke('add', 'add:res', { a: 1, b: 2 }, (e) => fired.push(e)).promise();

      expect(fired[0].result?.sum).to.eql(3);
      expect(fired[0].cmd).to.equal(cmd);

      // Handler added to {listener} object.
      await cmd
        .invoke('add', 'add:res', { a: 2, b: 3 })
        .onComplete((e) => {
          fired.push(e);
          expect(e.result?.sum).to.eql(5); // NB: result strongly typed.
        })
        .promise();

      expect(fired[1].result?.sum).to.eql(5);
      dispose();
    });

    it('listen(ƒ) ← register callback: onError', async () => {
      const { doc, dispose, dispose$ } = await setup();
      const cmd = Cmd.create<C>(doc);
      const events = cmd.events(dispose$);

      const error: E = { message: 'boo', code: 123, type: 'bounds' };
      const fired: t.CmdResponseHandlerArgs<C1>[] = [];
      events
        .on('add')
        .subscribe(({ tx, params }) => cmd.invoke('add:res', sum(params), { tx, error }));

      // Handler passed to listener constructor.
      await cmd
        .invoke('add', 'add:res', { a: 1, b: 2 })
        .onError((e) => fired.push(e))
        .promise();

      expect(fired.length).to.eql(1);
      expect(fired[0].error).to.eql(error);
      expect(fired[0].cmd).to.equal(cmd);

      await cmd
        .invoke('add', 'add:res', { a: 1, b: 2 }, { onError: (e) => fired.push(e) })
        .promise();

      expect(fired.length).to.eql(2);
      expect(fired[1].error).to.eql(error);

      // Example.
      cmd.invoke('add', 'add:res', { a: 1, b: 2 }, (e) => {
        e.error; /*  handle error */
        e.result; /* do something with result */
      });

      dispose();
    });

    it('listen ← dispose', async () => {
      const { doc, dispose, dispose$ } = await setup();
      const cmd = Cmd.create<C>(doc);

      const events = cmd.events(dispose$);
      events.on('add').subscribe(async (e) => {
        await Time.wait(10); // NB: response is issued after listener has disposed.
        cmd.invoke('add:res', sum(e.params), res1.tx);
        cmd.invoke('add:res', sum(e.params), res2.tx);
      });

      const params: P = { a: 1, b: 2 };
      const res1 = cmd.invoke('add', 'add:res', params);
      const res2 = cmd.invoke('add', 'add:res', params, { dispose$ });
      expect(res1.disposed).to.eql(false);
      expect(res2.disposed).to.eql(false);

      res1.dispose();
      dispose();
      expect(res1.disposed).to.eql(true);
      expect(res2.disposed).to.eql(true);

      expect(res1.ok).to.eql(true);
      expect(res2.ok).to.eql(true);

      expect(res1.result).to.eql(undefined);
      expect(res2.result).to.eql(undefined);
    });
  });

  describe('Response → Error', () => {
    it('with error (default)', async () => {
      const { doc, dispose, dispose$ } = await setup();
      const cmd = Cmd.create<C>(doc);
      const events = cmd.events(dispose$);

      const error = Cmd.DEFAULTS.error('lulz');
      events.on('add').subscribe(({ tx, params }) => {
        cmd.invoke('add:res', sum(params), { tx, error });
      });

      const res = cmd.invoke('add', 'add:res', { a: 1, b: 2 });
      await res.promise();

      expect(doc.current.error).to.eql(error);
      expect(res.error).to.eql(error);
      expect(res.ok).to.eql(false);
      expect(res.status === 'Error').to.eql(true);

      dispose();
    });

    it('with custom error', async () => {
      const { doc, dispose, dispose$ } = await setup();
      const cmd = Cmd.create<C>(doc);
      const events = cmd.events(dispose$);

      const error = { code: 123, type: 'bounds', message: 'boo' };
      events.on('add').subscribe(({ tx, params }) => {
        cmd.invoke('add:res', sum(params), { tx, error });
      });

      const res = cmd.invoke('add', 'add:res', { a: 1, b: 2 });
      await res.promise();

      expect(res.error?.code).to.eql(123);
      expect(res.error?.type).to.eql('bounds');
      expect(res.error?.message).to.eql('boo');
      expect(res.status === 'Error').to.eql(true);

      dispose();
    });
  });
}
