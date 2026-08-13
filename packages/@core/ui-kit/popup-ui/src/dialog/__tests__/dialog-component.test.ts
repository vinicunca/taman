import { describe, expect, it } from 'vitest';

describe('dialog.vue', () => {
  it('compiles and exposes a component', async () => {
    const mod = await import('../dialog.vue');
    expect(mod.default).toBeDefined();
  });
});
