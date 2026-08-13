import type { MaybeRefOrGetter } from 'vue';

import { createPinia } from 'pinia';
import { createApp, defineComponent, h, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';

import { ACCESS_ROLES_KEY } from './directive';
import { useAccess } from './use-access';

function withAccess<T>(
  composable: () => T,
  roles?: MaybeRefOrGetter<string[]>,
): { result: T; unmount: () => void } {
  let result!: T;
  const app = createApp(
    defineComponent({
      setup() {
        result = composable();
        return () => h('div');
      },
    }),
  );
  app.use(createPinia());
  if (roles !== undefined) {
    app.provide(ACCESS_ROLES_KEY, roles);
  }
  app.mount(document.createElement('div'));
  return { result, unmount: () => app.unmount() };
}

let unmount: (() => void) | undefined;
afterEach(() => {
  unmount?.();
  unmount = undefined;
});

describe('useAccess', () => {
  it('hasAccessByRoles reads from an injected Ref', () => {
    const harness = withAccess(() => useAccess(), ref(['admin']));
    unmount = harness.unmount;

    expect(harness.result.hasAccessByRoles(['admin'])).toBe(true);
    expect(harness.result.hasAccessByRoles(['editor'])).toBe(false);
  });

  it('hasAccessByRoles reads from an injected getter function', () => {
    const harness = withAccess(() => useAccess(), () => ['viewer']);
    unmount = harness.unmount;

    expect(harness.result.hasAccessByRoles(['viewer'])).toBe(true);
    expect(harness.result.hasAccessByRoles(['admin'])).toBe(false);
  });

  it('throws when ACCESS_ROLES_KEY was never provided', () => {
    expect(() => withAccess(() => useAccess())).toThrow(
      /registerAccessDirective/,
    );
  });

  it('hasAccessByCodes reads from useAccessStore, unaffected by the roles change', () => {
    const harness = withAccess(() => useAccess(), () => ['admin']);
    unmount = harness.unmount;

    // useAccessStore's accessCodes defaults to [], so no code ever matches
    expect(harness.result.hasAccessByCodes(['anything'])).toBe(false);
  });
});
