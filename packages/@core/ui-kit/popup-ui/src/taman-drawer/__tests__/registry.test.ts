import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';

import { drawerRegistry, registerDrawer, unregisterDrawer } from '../drawer.registry';

const Stub = defineComponent({ name: 'StubDrawer', render: () => null });

describe('drawer registry', () => {
  it('registers a component under an id', () => {
    const id = Symbol('a');
    registerDrawer(id, Stub);
    expect(drawerRegistry.some((entry) => entry.id === id)).toBe(true);
    unregisterDrawer(id);
  });

  it('ignores duplicate registrations for the same id', () => {
    const id = Symbol('b');
    registerDrawer(id, Stub);
    registerDrawer(id, Stub);
    expect(drawerRegistry.filter((entry) => entry.id === id)).toHaveLength(1);
    unregisterDrawer(id);
  });

  it('unregisters only the matching entry', () => {
    const idA = Symbol('c');
    const idB = Symbol('d');
    registerDrawer(idA, Stub);
    registerDrawer(idB, Stub);
    unregisterDrawer(idA);
    expect(drawerRegistry.some((entry) => entry.id === idA)).toBe(false);
    expect(drawerRegistry.some((entry) => entry.id === idB)).toBe(true);
    unregisterDrawer(idB);
  });

  it('is a no-op when unregistering an unknown id', () => {
    const before = drawerRegistry.length;
    unregisterDrawer(Symbol('unknown'));
    expect(drawerRegistry.length).toBe(before);
  });
});
