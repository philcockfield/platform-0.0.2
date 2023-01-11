import { describe, expect, it, t, TestSample, Time } from '../../test';
import { ValueHandler } from './ValueHandler.mjs';

describe('ValueHandler', () => {
  type S = { count: number };
  const initial: S = { count: 0 };

  it('init: value <undefined>', async () => {
    const { events } = await TestSample.controller();
    const value = ValueHandler<number, S>(events);
    expect(value.current).to.eql(undefined);
    events.dispose();
  });

  it('handler: (static) value', async () => {
    const { events } = await TestSample.controller();
    const value = ValueHandler<number, S>(events).handler(1234);

    expect(value.current).to.eql(undefined);
    await Time.wait(0);
    expect(value.current).to.eql(1234);

    events.dispose();
  });

  it('handler: function', async () => {
    const { events } = await TestSample.controller();
    const value = ValueHandler<number, S>(events);

    value.handler((e) => 1234);
    expect(value.current).to.eql(undefined);

    await Time.wait(0);
    expect(value.current).to.eql(1234);

    events.dispose();
  });

  it('derived value on {state} change', async () => {
    const { events } = await TestSample.controller();

    const fired: t.DevValueHandlerArgs<S>[] = [];
    const value = ValueHandler<string, S>(events, { debounce: 0 }).handler((e) => {
      fired.push(e);
      return `count-${e.state.count ?? 0}`;
    });

    await Time.wait(0);
    expect(value.current).to.eql('count-0');

    await events.state.change.fire(initial, { count: 1234 });
    await Time.wait(5);
    expect(value.current).to.eql(`count-1234`);

    events.dispose();
  });

  it('derived value on {prop} change', async () => {
    const { events } = await TestSample.controller();
    const ctx = await events.ctx.get();

    const value = ValueHandler<string, S>(events, { debounce: 0 }).handler((e) => {
      return `display-${e.dev.component.display ?? 'unknown'}`;
    });

    await Time.wait(0);
    expect(value.current).to.eql('display-unknown');

    ctx.component.display('grid');

    await Time.wait(30);
    expect(value.current).to.eql('display-grid');

    events.dispose();
  });

  it('replace handler', async () => {
    const { events } = await TestSample.controller();
    const value = ValueHandler<string, S>(events, { debounce: 0 });

    value.handler((e) => 'foo');
    value.handler((e) => `bar-${e.state.count ?? 0}`);
    expect(value.current).to.eql(undefined);

    await Time.wait(0);
    expect(value.current).to.eql('bar-0');

    await events.state.change.fire(initial, { count: 1234 });
    await Time.wait(5);
    expect(value.current).to.eql('bar-1234');

    events.dispose();
  });

  it('subscribe', async () => {
    const { events } = await TestSample.controller();
    const value = ValueHandler<string, S>(events, { debounce: 0 });
    value.handler((e) => `foo-${e.state.count ?? 0}`);

    const fired: { value: string }[] = [];
    value.subscribe((e) => fired.push(e));

    await Time.wait(0);
    expect(fired).to.eql([{ value: 'foo-0' }]);

    await events.state.change.fire(initial, { count: 1234 });
    await Time.wait(5);

    expect(fired.length).to.eql(2);
    expect(fired[1]).to.eql({ value: 'foo-1234' });

    events.dispose();
  });

  it('subscribe => unsubscribe', async () => {
    const { events } = await TestSample.controller();
    const value = ValueHandler<string, S>(events, { debounce: 0 });
    value.handler((e) => `foo-${e.state.count ?? 0}`);

    const fired: { value: string }[] = [];
    const subscriber = value.subscribe((e) => fired.push(e));

    await Time.wait(0);
    expect(fired).to.eql([{ value: 'foo-0' }]);

    subscriber();

    await events.state.change.fire(initial, { count: 1234 });
    await Time.wait(5);
    expect(fired.length).to.eql(1); // NB: no change

    events.dispose();
  });

  it('dispose', async () => {
    const { events } = await TestSample.controller();
    const value = ValueHandler<string, S>(events, { debounce: 0 }).handler(() => 'foo');

    expect(value.disposed).to.eql(false);
    value.dispose();
    expect(value.disposed).to.eql(true);

    await Time.wait(0);
    expect(value.current).to.eql(undefined);

    events.dispose();
  });
});
