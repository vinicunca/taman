import { describe, expect, it } from 'vitest';

describe('drawer.vue', () => {
  it('compiles and exposes a component', async () => {
    const mod = await import('../drawer.vue');
    expect(mod.default).toBeDefined();
  });
});
