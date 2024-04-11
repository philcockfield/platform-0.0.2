import { Value } from '.';
import { describe, expect, it } from '../test';

describe('Value.Object', () => {
  describe('Value.Object.walk', () => {
    type T = { key: string | number; value: any };

    it('processes object', () => {
      const walked: T[] = [];
      const input = {
        name: 'foo',
        count: 123,
        child: { enabled: true, list: [1, 2] },
      };

      Value.Object.walk(input, ({ key, value }) => walked.push({ key, value }));

      expect(walked).to.eql([
        { key: 'name', value: 'foo' },
        { key: 'count', value: 123 },
        { key: 'child', value: { enabled: true, list: [1, 2] } },
        { key: 'enabled', value: true },
        { key: 'list', value: [1, 2] },
        { key: 0, value: 1 },
        { key: 1, value: 2 },
      ]);
    });

    it('passes parent in callback', () => {
      const root = { child: { enabled: true, list: [1, 2] } };
      const parents: any[] = [];
      Value.Object.walk(root, (e) => parents.push(e.parent));
      expect(parents.length).to.eql(5);
      expect(parents[0]).to.eql(root);
      expect(parents[1]).to.eql(root.child);
      expect(parents[2]).to.eql(root.child);
      expect(parents[3]).to.eql(root.child.list);
      expect(parents[4]).to.eql(root.child.list);
    });

    it('processes array', () => {
      const walked: T[] = [];
      const input = ['foo', 123, { enabled: true, list: [1, 2] }];

      Value.Object.walk(input, ({ key, value }) => walked.push({ key, value }));

      expect(walked).to.eql([
        { key: 0, value: 'foo' },
        { key: 1, value: 123 },
        { key: 2, value: { enabled: true, list: [1, 2] } },
        { key: 'enabled', value: true },
        { key: 'list', value: [1, 2] },
        { key: 0, value: 1 },
        { key: 1, value: 2 },
      ]);
    });

    it('processes nothing (non-object / array)', () => {
      const test = (input: any) => {
        const walked: any[] = [];
        Value.Object.walk(input, (e) => walked.push(e));
        expect(walked).to.eql([]); // NB: nothing walked.
      };
      [0, true, '', null, undefined].forEach((input) => test(input));
    });

    it('stops midway', () => {
      const walked: T[] = [];
      const input = {
        name: 'foo',
        child: { enabled: true, list: [1, 2] },
      };

      Value.Object.walk(input, (e) => {
        const { key, value } = e;
        if (value === true) return e.stop();
        walked.push({ key, value });
      });

      expect(walked).to.eql([
        { key: 'name', value: 'foo' },
        { key: 'child', value: { enabled: true, list: [1, 2] } },
      ]);
    });

    it('circular reference', () => {
      let count = 0;

      const a = { b: null as any };
      const b = { a, child: [1, { msg: 'hello' }] };
      a.b = b; // Setup ciruclar reference.

      Value.Object.walk(a, (e) => count++);
      expect(count).to.eql(6); // NB: with no infinite loop.
    });
  });

  describe('Value.Object.build', () => {
    it('return default root object (no keyPath)', () => {
      expect(Value.Object.build('', {})).to.eql({});
      expect(Value.Object.build('  ', {})).to.eql({});
    });

    it('returns clone of the given root object', () => {
      const obj = {};
      expect(Value.Object.build('', obj)).to.not.equal(obj);
    });

    it('adds single level', () => {
      expect(Value.Object.build('foo', {})).to.eql({ foo: {} });
      expect(Value.Object.build(' foo  ', {})).to.eql({ foo: {} });
    });

    it('adds multi-levels (path)', () => {
      const res = Value.Object.build('foo.bar', {});
      expect(res).to.eql({ foo: { bar: {} } });
    });

    it('adds multi-levels with custom value', () => {
      const test = (value: any) => {
        const res = Value.Object.build<any>('foo.bar.baz', {}, value);
        expect(res.foo.bar.baz).to.eql(value);
      };
      test(0);
      test(123);
      test('hello');
      test('');
      test(' ');
      test({});
    });

    it('does not replace existing object/value (cloned, single-level)', () => {
      const obj = { foo: { bar: 123 } };
      const res = Value.Object.build<any>('foo', obj);
      expect(res).to.eql(obj);
      expect(res).to.not.equal(obj);
      expect(res.foo).to.not.equal(obj.foo);
    });

    it('throws if path overwrites value', () => {
      const test = (keyPath: string, obj: Record<string, unknown>) => {
        const fn = () => Value.Object.build(keyPath, obj);
        expect(fn).to.throw();
      };
      test('foo.bar', { foo: { bar: 123 } });
      test('foo.bar', { foo: { bar: 0 } });
      test('foo.bar', { foo: { bar: null } });
      test('foo.bar', { foo: { bar: '' } });
    });

    it('throws if starts/ends with period (.)', () => {
      const test = (keyPath: string) => {
        const fn = () => Value.Object.build(keyPath, {});
        expect(fn).to.throw();
      };
      test('foo.bar.');
      test('foo.bar. ');
      test('.foo.bar');
      test(' .foo.bar  ');
      test('.foo.bar.');
    });

    it('appends existing object', () => {
      const obj = { foo: { bar: 123 } };
      const res = Value.Object.build('foo.baz', obj);
      expect(res).to.eql({ foo: { bar: 123, baz: {} } });
    });
  });

  describe('Value.Object.pluck', () => {
    it('returns [undefined] when no match', () => {
      expect(Value.Object.pluck('foo', {})).to.eql(undefined);
      expect(Value.Object.pluck('foo.bar', {})).to.eql(undefined);
      expect(Value.Object.pluck('foo.bar', { baz: 123 })).to.eql(undefined);
    });

    it('gets value', () => {
      const test = (keyPath: string, root: any, value: any) => {
        const res = Value.Object.pluck(keyPath, root);
        expect(res).to.eql(value, `The key-path "${keyPath}" should be [${value}]`);
      };
      test('foo', { foo: 123 }, 123);
      test('foo.bar', { foo: { bar: 123 } }, 123);
      test(' foo.bar ', { foo: { bar: 123 } }, 123);
      test(' foo. bar ', { foo: { bar: 123 } }, 123);
    });

    it('throws if starts/ends with period (.)', () => {
      const test = (key: string) => {
        const fn = () => Value.Object.pluck(key, {});
        expect(fn).to.throw();
      };
      test('foo.bar.');
      test('foo.bar. ');
      test('.foo.bar');
      test(' .foo.bar  ');
      test('.foo.bar.');
    });
  });

  describe('Value.Object.remove', () => {
    const test = (keyPath: string, root: any, expected: any) => {
      const result = Value.Object.remove(keyPath, root);
      const msg = `keyPath: "${keyPath}"`;
      expect(result).to.eql(expected, msg);
      expect(result).to.not.equal(root, msg);
    };

    it('removes nothing (no match)', () => {
      test('', {}, {});
      test('', { foo: 123 }, { foo: 123 });
      test('foo', {}, {});
      test('foo', { bar: 456 }, { bar: 456 });
      test('foo.bar', {}, {});
      test('foo.bar', { foo: 123 }, { foo: 123 });
      test('foo.bar.baz', { foo: 123 }, { foo: 123 });
    });

    it('removes shallow path', () => {
      test('foo', { foo: 123 }, {});
      test('foo', { foo: 123, bar: 'hi' }, { bar: 'hi' });
    });

    it('removes deep path', () => {
      test('foo.bar', { foo: { bar: 123 } }, { foo: {} });
      test('foo.bar.baz', { foo: { bar: { baz: 456 } } }, { foo: { bar: {} } });
      test('foo.bar', { foo: { bar: 123, baz: 456 } }, { foo: { baz: 456 } });
      test('foo.bar', { foo: { bar: 123 }, baz: 456 }, { baz: 456, foo: {} });
    });

    it('removes wildcard (*)', () => {
      test('foo.*', { foo: { bar: 123 } }, { foo: {} });
      test('foo.*', { foo: { bar: 123 }, baz: 456 }, { baz: 456, foo: {} });
      test('*', { foo: { bar: 123 }, baz: 456 }, {});
    });
  });

  describe('Value.Object.prune', () => {
    const test = (keyPath: string, root: any, expected: any) => {
      const result = Value.Object.prune(keyPath, root);
      const msg = `keyPath: "${keyPath}"`;
      expect(result).to.eql(expected, msg);
      expect(result).to.not.equal(root, msg);
    };

    it('prunes nothing (no match)', () => {
      test('', {}, {});
      test('', { foo: 123 }, { foo: 123 });
      test('foo', {}, {});
      test('foo', { bar: 456 }, { bar: 456 });
      test('foo.bar', {}, {});
      test('foo.bar', { foo: 123 }, { foo: 123 });
      test('foo.bar.baz', { foo: 123 }, { foo: 123 });
    });

    it('prunes nothing (child not empty)', () => {
      test('foo', { foo: { bar: {} } }, { foo: { bar: {} } });
    });

    it('throws if wild card not at end of path', () => {
      const fn = () => Value.Object.prune('*.bar', {});
      expect(fn).to.throw();
    });

    it('prunes wildcard (*)', () => {
      test('foo.*', { foo: { bar: {}, baz: 123 } }, {});
      test('foo.*', { foo: 123 }, {});
      test('foo.*', {}, {});
      test('*', {}, {});
      test('*', { foo: 123, bar: {} }, {});
    });

    it('prunes shallow path', () => {
      test('foo', { foo: 123 }, {});
      test('foo', { foo: 123, bar: 'hi' }, { bar: 'hi' });
    });

    it('prunes deep path', () => {
      test('foo.bar', { foo: { bar: 123 } }, {});
      test('foo.bar.baz', { foo: { bar: { baz: 456 } } }, {});
      test('foo.bar', { foo: { bar: 123, baz: 456 } }, { foo: { baz: 456 } });
      test('foo.bar', { foo: { bar: 123 }, baz: 456 }, { baz: 456 });
    });
  });

  describe('Value.Object.toArray', () => {
    type IFoo = { count: number };
    type IFoos = {
      one: IFoo;
      two: IFoo;
    };
    const foos: IFoos = { one: { count: 1 }, two: { count: 2 } };

    it('empty', () => {
      expect(Value.Object.toArray({})).to.eql([]);
    });

    it('converts to array (untyped)', () => {
      const res = Value.Object.toArray(foos);
      expect(res.length).to.eql(2);
    });

    it('converts to array (typed object)', () => {
      const res = Value.Object.toArray<IFoos>(foos);
      expect(res.length).to.eql(2);

      expect(res[0].key).to.eql('one');
      expect(res[1].key).to.eql('two');

      expect(res[0].value).to.eql({ count: 1 });
      expect(res[1].value).to.eql({ count: 2 });
    });

    it('converts to array (typed key)', () => {
      type K = 'foo' | 'bar';
      const res = Value.Object.toArray<IFoos, K>(foos);
      expect(res.length).to.eql(2);
    });
  });

  describe('Value.Object.trimStringsDeep', () => {
    it('shallow', () => {
      const name = 'foo'.repeat(100);
      const obj = {
        name,
        count: 123,
        obj: {},
        list: [],
        bool: true,
        undef: undefined,
        nil: null,
      };

      const res1 = Value.Object.trimStringsDeep(obj);
      const res2 = Value.Object.trimStringsDeep(obj, { immutable: false });

      const expected = {
        ...obj,
        name: `${name.substring(0, 35)}...`, // NB: default max-length
      };

      expect(res1).to.eql(expected);
      expect(res2).to.eql(expected);

      expect(res1).to.not.equal(obj); // NB: default: immutable clone.
      expect(res2).to.equal(obj);
    });

    it('deep', () => {
      const name = 'foo'.repeat(50);
      const obj = {
        name,
        child: {
          child: {
            name,
            count: 123,
            obj: {},
            list: [],
            bool: true,
            undef: undefined,
            nil: null,
          },
        },
      };

      const res = Value.Object.trimStringsDeep(obj);

      expect(res).to.eql({
        name: `${name.substring(0, 35)}...`,
        child: {
          child: {
            ...obj.child.child,
            name: `${name.substring(0, 35)}...`,
          },
        },
      });
    });

    it('options: no ellipsis, maxLength', () => {
      const name = 'foo'.repeat(100);
      const obj = { name };

      const res1 = Value.Object.trimStringsDeep(obj, {});
      const res2 = Value.Object.trimStringsDeep(obj, {
        ellipsis: false,
        maxLength: 10,
      });

      expect(res1.name).to.eql(`${name.substring(0, 35)}...`); // NB: default
      expect(res2.name).to.eql(name.substring(0, 10));
    });
  });
});
