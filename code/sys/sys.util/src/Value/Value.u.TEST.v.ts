import { Value } from '.';
import { describe, expect, it } from '../test';

describe('plural', () => {
  it('singular', () => {
    expect(Value.plural(1, 'item')).to.eql('item');
    expect(Value.plural(-1, 'item')).to.eql('item');
    expect(Value.plural(1, 'item', 'items')).to.eql('item');
    expect(Value.plural(-1, 'item', 'items')).to.eql('item');
  });

  it('plural', () => {
    expect(Value.plural(0, 'item', 'items')).to.eql('items');
    expect(Value.plural(2, 'item', 'items')).to.eql('items');
    expect(Value.plural(-2, 'item', 'items')).to.eql('items');
    expect(Value.plural(999, 'item', 'items')).to.eql('items');
  });

  it('inferred "s"', () => {
    expect(Value.plural(0, 'item')).to.eql('items');
    expect(Value.plural(2, 'item')).to.eql('items');
    expect(Value.plural(-2, 'item')).to.eql('items');
    expect(Value.plural(999, 'item')).to.eql('items');
  });
});

describe('toggle', () => {
  it('toggle: {object}', () => {
    const obj = { foo: true };
    const res = Value.toggle(obj, 'foo');
    expect(obj.foo).to.eql(false);
    expect(res).to.eql(false);

    const res3 = Value.toggle(obj, 'foo');
    expect(obj.foo).to.eql(true);
    expect(res3).to.eql(true);
  });

  it('toggle: [array]', () => {
    const list = [true, false];

    const res1 = Value.toggle(list, 0);
    const res2 = Value.toggle(list, 1);
    const res3 = Value.toggle(list, 999);
    const res4 = Value.toggle(list, 999);

    expect(res1).to.eql(false);
    expect(res2).to.eql(true);
    expect(res3).to.eql(true);
    expect(res4).to.eql(false);

    expect(list[0]).to.eql(false);
    expect(list[1]).to.eql(true);
    expect(list[999]).to.eql(false);
  });

  it('toggle ← (default value)', () => {
    const res1 = Value.toggle({ foo: undefined }, 'foo');
    const res2 = Value.toggle({ foo: undefined }, 'foo', true);
    const res3 = Value.toggle({ foo: undefined }, 'foo', false);
    expect(res1).to.eql(true);
    expect(res2).to.eql(true);
    expect(res3).to.eql(false);

    const res4 = Value.toggle([], 0);
    const res5 = Value.toggle([], 0, true);
    const res6 = Value.toggle([], 0, false);
    expect(res4).to.eql(true);
    expect(res5).to.eql(true);
    expect(res6).to.eql(false);
  });

  it('throw: invalid input', () => {
    [null, undefined, 123, '', true, Symbol('sym')].forEach((value: any) => {
      const fn = () => Value.toggle(value, 'foo');
      expect(fn).to.throw(/Object or Array required/);
    });
  });

  it('throw: invalid key value type ← {object}', () => {
    const test = (obj: { foo: any }) => {
      const fn = () => Value.toggle(obj, 'foo');
      expect(fn).to.throw(/is not a boolean/);
    };
    test({ foo: null });
    test({ foo: 123 });
    test({ foo: {} });
    test({ foo: [] });
    test({ foo: Symbol('hello') });
    test({ foo: BigInt(1234) });
  });

  it('throw: invalid key value type ← [array]', () => {
    const test = (obj: any[]) => {
      const fn = () => Value.toggle(obj, 0);
      expect(fn).to.throw(/is not a boolean/);
    };
    test([null]);
    test([123]);
    test(['hello']);
    test([BigInt(1234)]);
    test([Symbol('hello')]);
    test([{}]);
    test([[]]);
  });
});
