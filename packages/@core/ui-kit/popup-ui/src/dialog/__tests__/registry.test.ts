import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';

import { dialogRegistry, registerDialog, unregisterDialog } from '../dialog.registry';

const Stub = defineComponent({ name: 'StubDialog', render: () => null });

describe('dialog registry', () => {
  it('registers a component under an id', () => {
    const id = Symbol('a');
    registerDialog(id, Stub);
    expect(dialogRegistry.some((entry) => entry.id === id)).toBe(true);
    unregisterDialog(id);
  });

  it('ignores duplicate registrations for the same id', () => {
    const id = Symbol('b');
    registerDialog(id, Stub);
    registerDialog(id, Stub);
    expect(dialogRegistry.filter((entry) => entry.id === id)).toHaveLength(1);
    unregisterDialog(id);
  });

  it('unregisters only the matching entry', () => {
    const idA = Symbol('c');
    const idB = Symbol('d');
    registerDialog(idA, Stub);
    registerDialog(idB, Stub);
    unregisterDialog(idA);
    expect(dialogRegistry.some((entry) => entry.id === idA)).toBe(false);
    expect(dialogRegistry.some((entry) => entry.id === idB)).toBe(true);
    unregisterDialog(idB);
  });

  it('is a no-op when unregistering an unknown id', () => {
    const before = dialogRegistry.length;
    unregisterDialog(Symbol('unknown'));
    expect(dialogRegistry).toHaveLength(before);
  });
});
