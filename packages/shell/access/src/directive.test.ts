import { createPinia } from 'pinia';
import {
  createApp,
  defineComponent,
  h,
  ref,
  resolveDirective,
  withDirectives,
} from 'vue';
import { afterEach, describe, expect, it } from 'vitest';

import { registerAccessDirective } from './directive';

function mountWithAccessDirective(roles: string[]) {
  const app = createApp(
    defineComponent({
      render() {
        const accessDirective = resolveDirective('access')!;
        return withDirectives(h('button', 'secret'), [
          [accessDirective, 'admin', 'role'],
        ]);
      },
    }),
  );
  app.use(createPinia());
  registerAccessDirective(app, ref(roles));
  const container = document.createElement('div');
  app.mount(container);
  return { container, unmount: () => app.unmount() };
}

let unmount: (() => void) | undefined;
afterEach(() => {
  unmount?.();
  unmount = undefined;
});

describe('registerAccessDirective / v-access', () => {
  it('keeps the element when the role matches (default frontend accessMode)', () => {
    const harness = mountWithAccessDirective(['admin']);
    unmount = harness.unmount;

    expect(harness.container.querySelector('button')).not.toBeNull();
  });

  it('removes the element when the role does not match', () => {
    const harness = mountWithAccessDirective(['viewer']);
    unmount = harness.unmount;

    expect(harness.container.querySelector('button')).toBeNull();
  });
});
