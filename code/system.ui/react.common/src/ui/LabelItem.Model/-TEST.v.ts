import { Model } from '.';
import { describe, expect, it, slug, type t } from '../../test';

describe('LabelItem.Model', () => {
  describe('Model.Item.state', () => {
    describe('init', () => {
      it('defaults', () => {
        const state = Model.Item.state();
        expect(state.current).to.eql({});

        state.change((d) => (d.label = 'hello'));
        expect(state.current.label).to.eql('hello'); // NB: initial value.
      });

      it('{initial}', () => {
        const state = Model.Item.state({ label: 'foo' });
        expect(state.current.label).to.eql('foo'); // NB: initial value.
      });
    });

    describe('events', () => {
      it('init', () => {
        const state = Model.Item.state({ label: 'foo' });
        const events = state.events();
        expect(state.current.label).to.eql('foo'); // NB: initial value.

        const fired: t.PatchChange<t.LabelItem>[] = [];
        events.$.subscribe((e) => fired.push(e));

        state.change((d) => (d.label = 'hello'));
        expect(fired.length).to.eql(1);
        expect(fired[0].from.label).to.eql('foo');
        expect(fired[0].to.label).to.eql('hello');

        events.dispose();
        state.change((d) => (d.label = 'foobar'));
        expect(fired.length).to.eql(1); // NB: no change because disposed.
      });

      it('events.cmd.$ (command stream)', () => {
        const state = Model.Item.state({ label: 'foo' });
        const dispatch = Model.Item.commands(state);
        const events = state.events();

        const fired: t.LabelItemCmd[] = [];
        events.cmd.$.subscribe((e) => fired.push(e));

        const tx = slug();
        state.change((d) => (d.cmd = { type: 'Item:Clipboard', payload: { action: 'Copy', tx } }));
        expect(fired.length).to.eql(1);
        expect(state.current.cmd).to.eql({
          type: 'Item:Clipboard',
          payload: { action: 'Copy', tx },
        });

        dispatch.clipboard('Paste');
        expect(fired.length).to.eql(2);
        expect((state.current.cmd?.payload as t.LabelItemClipboard).action).to.eql('Paste');

        events.dispose();
      });
    });
  });

  describe('Model.List.state', () => {
    const { List } = Model;

    function getItemsSample() {
      const items: t.LabelItemState[] = [];
      const getItem: t.GetLabelListItem = (index) => {
        return items[index] ?? (items[index] = Model.Item.state());
      };
      return { items, getItem };
    }

    describe('init', () => {
      it('defaults', () => {
        const state = Model.List.state();
        expect(state.current).to.eql({ total: 0 });
      });

      it('{initial}', () => {
        const getItem: t.GetLabelListItem = (index) => undefined;
        const state = Model.List.state({ total: 123, getItem });
        expect(state.current).to.eql({ total: 123, getItem });
      });
    });

    describe('items (fn)', () => {
      it('returns nothing when no getter function', () => {
        const state = Model.List.state();
        expect(state.current.getItem).to.eql(undefined);
        expect(List.item(state, 0)).to.eql(undefined);
        expect(List.item(state.current, 0)).to.eql(undefined);
      });

      it('returns item from getter function', () => {
        const { items, getItem } = getItemsSample();
        const state = Model.List.state({ total: 2, getItem });

        const item1 = List.item(state, 0);
        const item2 = List.item(state.current, 1);

        expect(item1).to.eql(items[0]);
        expect(item2).to.eql(items[1]);

        expect(List.item(state.current, 0)).to.eql(item1);
        expect(List.item(state, 1)).to.eql(item2);
      });

      it('out of bounds', () => {
        const { items, getItem } = getItemsSample();
        const state = Model.List.state({ total: 1, getItem });
        expect(List.item(state, 2)).to.eql(undefined);
        expect(items).to.eql([]);
      });
    });

    describe('events', () => {
      it('init', () => {
        const state = Model.List.state();
        const events = state.events();

        const fired: t.PatchChange<t.LabelList>[] = [];
        events.$.subscribe((e) => fired.push(e));

        state.change((d) => (d.selected = 'abc'));
        expect(fired.length).to.eql(1);
        expect(fired[0].from.selected).to.eql(undefined);
        expect(fired[0].to.selected).to.eql('abc');

        events.dispose();
        state.change((d) => (d.selected = '...def'));
        expect(fired.length).to.eql(1); // NB: no change because disposed.
      });

      it('events.cmd.$ (command stream)', () => {
        const state = Model.List.state();
        const dispatch = Model.List.commands(state);
        const events = state.events();

        const fired: t.LabelListCmd[] = [];
        events.cmd.$.subscribe((e) => fired.push(e));

        const payload = { focus: true, tx: slug() };
        state.change((d) => (d.cmd = { type: 'List:Focus', payload }));
        expect(fired.length).to.eql(1);
        expect(state.current.cmd).to.eql({ type: 'List:Focus', payload });

        dispatch.focus();
        expect(fired.length).to.eql(2);

        events.dispose();
      });
    });
  });

  describe('Model.data', () => {
    type StateRef = t.ImmutableRef<any, any>;

    it('field undefined (by default)', () => {
      const item = Model.Item.state();
      const list = Model.List.state();
      expect(item.current.data).to.eql(undefined);
      expect(list.current.data).to.eql(undefined);
    });

    it('no mutation ← read a non-proxy', () => {
      const test = (state: StateRef) => {
        type T = { count?: number };
        const res1 = Model.data<T>(state.current);
        const res2 = Model.data<T>(state.current, { count: 123 });
        const res3 = Model.data<T>(state, { count: 123 });
        expect(state.current.data).to.eql(undefined); // NB: no chance to underlying object.
        expect(res1).to.eql({});
        expect(res2).to.eql({ count: 123 });
        expect(res3).to.eql({ count: 123 });
      };

      test(Model.Item.state());
      test(Model.List.state());
    });

    it('no mutation ← convert from [ItemState] → [Item]', () => {
      const test = (state: StateRef) => {
        type T = { count?: number };
        state.change((d) => (d.data = { count: 123 }));
        expect(state.current.data).to.eql({ count: 123 });
        expect(Model.data<T>(state)).to.eql({ count: 123 });
      };

      test(Model.Item.state());
      test(Model.List.state());
    });

    it('mutates: State.data', () => {
      const test = (state: StateRef) => {
        type T = { count?: number };
        state.change((d) => Model.data<T>(d));
        expect(state.current.data).to.eql({});

        state.change((d) => (Model.data<T>(d).count = 123));
        expect(state.current.data?.count).to.eql(123);
      };

      test(Model.Item.state());
      test(Model.List.state());
    });

    it('mutates: State.data → default {object}', () => {
      const test = (state1: StateRef, state2: StateRef) => {
        type T = { count: number };
        const initial: T = { count: 0 };

        state1.change((d) => Model.data<T>(d, initial));
        state2.change((d) => (Model.data<T>(d, initial).count = 123));

        expect(state1.current.data?.count).to.eql(0);
        expect(state2.current.data?.count).to.eql(123);
      };

      test(Model.Item.state(), Model.Item.state());
      test(Model.List.state(), Model.List.state());
    });

    it('throw: input not object', () => {
      const inputs = [null, undefined, '', 123, false, []];
      inputs.forEach((value) => {
        const fn = () => Model.data(value as any);
        expect(fn).to.throw(/Not an object/);
      });
    });
  });
});
