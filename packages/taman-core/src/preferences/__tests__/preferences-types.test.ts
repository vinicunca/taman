import type { DeepPartial } from '../../utils';

import { describe, expectTypeOf, it } from 'vitest';

import { updateCustomPreferences } from '..';

interface ProjectPreferences {
  defaultTableSize: number;
  tenantMode: 'multi' | 'single';
}

describe('custom preferences types', () => {
  it('accepts a typed partial update', () => {
    const updateProjectPreferences
      = updateCustomPreferences<ProjectPreferences>;

    expectTypeOf(updateProjectPreferences)
      .parameter(0)
      .toEqualTypeOf<DeepPartial<ProjectPreferences>>();
  });
});
