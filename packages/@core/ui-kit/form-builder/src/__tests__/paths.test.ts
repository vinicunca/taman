import { describe, expect, it } from 'vitest';
import { reactive } from 'vue';

import { deepAssign, deletePath, getPath, setPath } from '../paths';

describe('paths', () => {
  it('getPath reads dot and index paths', () => {
    const obj = { a: { b: [{ c: 1 }] } };
    expect(getPath(obj, 'a.b.0.c')).toBe(1);
    expect(getPath(obj, 'a.missing')).toBeUndefined();
  });

  it('setPath creates intermediate objects and arrays', () => {
    const obj: Record<string, any> = {};
    setPath(obj, 'a.b', 2);
    expect(obj.a.b).toBe(2);
    setPath(obj, 'list.0.name', 'x');
    expect(Array.isArray(obj.list)).toBe(true);
    expect(obj.list[0].name).toBe('x');
  });

  it('deletePath removes object keys and splices arrays', () => {
    const obj: Record<string, any> = { a: { b: 1, keep: 2 }, list: [1, 2, 3] };
    deletePath(obj, 'a.b');
    expect(obj.a).toEqual({ keep: 2 });
    deletePath(obj, 'list.1');
    expect(obj.list).toEqual([1, 3]);
    deletePath(obj, 'nope.deep'); // no throw
  });

  it('deepAssign merges nested values without replacing the target object', () => {
    const target = reactive<Record<string, any>>({ a: { b: 1 }, keep: true });
    const inner = target.a;
    deepAssign(target, { a: { c: 2 }, extra: [1] });
    expect(target.a).toEqual({ b: 1, c: 2 });
    expect(target.a).toBe(inner);
    expect(target.keep).toBe(true);
    expect(target.extra).toEqual([1]);
  });

  it('deepAssign overwrites arrays wholesale', () => {
    const target: Record<string, any> = { list: [1, 2, 3] };
    deepAssign(target, { list: [9] });
    expect(target.list).toEqual([9]);
  });
});
