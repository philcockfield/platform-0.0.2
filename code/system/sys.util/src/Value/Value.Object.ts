import { R } from '../common';
export * from './Value.Object.keyPath';

type WalkCallback = (e: WalkCallbackArgs) => void;
type WalkCallbackArgs = {
  readonly parent: object | any[];
  readonly key: string | number;
  readonly value: any;
  stop(): void;
};

/**
 * Walks an object tree (recursive descent) implementing
 * a visitor callback for each item.
 */
export function walk<T extends object | any[]>(parent: T, fn: WalkCallback) {
  /**
   * Inner implementation
   */
  const walked = new Map<any, boolean>(); // NB: protect against circular-references.

  const walk = <T extends object | any[]>(parent: T, fn: WalkCallback) => {
    let _stopped = false;
    const stop = () => (_stopped = true);

    const process = (key: string | number, value: any) => {
      if (_stopped || walked.has(value)) return; // Skip if stopped or already walked.

      fn({ parent, key, value, stop });
      if (_stopped) return;

      const isObject = typeof parent === 'object' && parent !== null;
      const isArray = Array.isArray(value);
      if (isObject || isArray) {
        walked.set(value, true);
        walk(value, fn); // <== RECURSION 🌳
      }
    };

    if (Array.isArray(parent)) {
      parent.forEach((item, i) => process(i, item));
    } else if (typeof parent === 'object' && parent !== null) {
      Object.entries(parent).forEach(([key, value]) => process(key, value));
    }
  };

  // Start.
  walk<T>(parent, fn);
}

/**
 * Converts an object into an array of {key,value} pairs.
 */
export function toArray<T = Record<string, unknown>, K = keyof T>(
  obj: Record<string, any>,
): { key: K; value: T[keyof T] }[] {
  return Object.keys(obj).map((key) => ({ key: key as unknown as K, value: obj[key] }));
}

/**
 * Walk the tree and ensure all strings are less than the given max-length.
 */
export function trimStringsDeep<T extends Record<string, any>>(
  obj: T,
  options: { maxLength?: number; ellipsis?: boolean; immutable?: boolean } = {},
) {
  // NB: This is a recursive function ← via Object.walk(🌳)
  const { ellipsis = true, immutable = true } = options;
  const MAX = options.maxLength ?? 35;

  const adjust = (obj: Record<string, string>) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > MAX) {
        let text = value.slice(0, MAX);
        if (ellipsis) text += '...';
        (obj as any)[key] = text;
      }
    });
  };

  const clone = immutable ? R.clone(obj) : obj;
  adjust(clone);
  walk(clone, (e) => {
    const value = e.value;
    if (typeof value === 'object' && value !== null) adjust(value);
  });

  return clone;
}
