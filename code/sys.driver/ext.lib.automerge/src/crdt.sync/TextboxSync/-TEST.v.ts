import { TextboxSync } from '.';
import { describe, expect, it, type t } from '../../test';

describe('TextboxSync', () => {
  describe('Calc.diff', () => {
    const Calc = TextboxSync.Calc;

    const assertDiff = (diff: t.TextDiff, index: number, delCount: number, newText?: string) => {
      expect(diff.index).to.eql(index);
      expect(diff.delCount).to.eql(delCount);
      expect(diff.newText).to.eql(newText);
    };

    it('no change', () => {
      const diff = Calc.diff('foo', 'foo', 3);
      assertDiff(diff, 3, 0, '');
    });

    it('insert (single char)', () => {
      const diff1 = Calc.diff('', 'a', 1);
      const diff2 = Calc.diff('a', 'ab', 2);
      const diff3 = Calc.diff('ab', 'acb', 2);
      assertDiff(diff1, 0, 0, 'a');
      assertDiff(diff2, 1, 0, 'b');
      assertDiff(diff3, 1, 0, 'c');
    });

    it('delete', () => {
      const diff1 = Calc.diff('', 'abcd', 4);
      const diff2 = Calc.diff('abcd', 'acd', 1);
      const diff3 = Calc.diff('abc', 'a', 1);
      assertDiff(diff1, 0, 0, 'abcd');
      assertDiff(diff2, 1, 1, '');
      assertDiff(diff3, 1, 2, '');
    });

    it('replace all', () => {
      const diff1 = Calc.diff('a', 'z', 1);
      const diff2 = Calc.diff('abcd', 'z', 1);
      assertDiff(diff1, 0, 1, 'z');
      assertDiff(diff2, 0, 4, 'z');
    });
  });
});