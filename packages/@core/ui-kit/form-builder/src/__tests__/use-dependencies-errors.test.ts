import { describe, expect, it, vi } from 'vitest';
import { effectScope, reactive } from 'vue';

import type { FieldDependencies } from '../types';

import { useDependencies } from '../use-dependencies';

/**
 * Standalone (no mount): useDependencies only needs an effect scope plus an
 * object exposing `values`/`setFieldRuntime`, so these run without pohon.
 */
function harness(
  dependencies: FieldDependencies,
  values: Record<string, any> = {},
) {
  const api = {
    setFieldRuntime: vi.fn(),
    values: reactive(values),
  } as any;
  const scope = effectScope();
  scope.run(() => {
    useDependencies({
      api,
      getDependencies: () => dependencies,
      name: () => 'headshotUrls',
    });
  });
  return { api, scope };
}

/** Two real macrotask turns: enough for Node's unhandled-rejection check. */
async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('useDependencies error handling', () => {
  it('fires trigger once immediately on mount, before any value change', async () => {
    const trigger = vi.fn();
    const { scope } = harness(
      { trigger, triggerFields: ['headshotUrls'] },
      { headshotUrls: [] },
    );

    await settle();
    expect(trigger).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  it('passes values through as-is — an unseeded field is undefined, not defaulted', async () => {
    let seen: unknown = 'not-called';
    const { scope } = harness(
      {
        trigger: (values) => {
          seen = values.headshotUrls;
        },
        triggerFields: ['headshotUrls'],
      },
      {}, // no initialValues for the field
    );

    await settle();
    expect(seen).toBeUndefined();
    scope.stop();
  });

  it('reports a throwing callback with the field name, with no unhandled rejection', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const rejections: Array<unknown> = [];
    const onUnhandled = (reason: unknown) => rejections.push(reason);
    process.on('unhandledRejection', onUnhandled);

    try {
      const { scope } = harness({
        trigger: () => {
          throw new TypeError('Cannot read properties of undefined');
        },
        triggerFields: ['headshotUrls'],
      });

      await settle();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('headshotUrls'),
        expect.any(TypeError),
      );
      expect(rejections).toEqual([]);
      scope.stop();
    } finally {
      process.off('unhandledRejection', onUnhandled);
      errorSpy.mockRestore();
    }
  });

  it('a failing state callback does not abort later fields (error is contained per field)', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const { api, scope } = harness({
        if: () => {
          throw new Error('if exploded');
        },
        triggerFields: ['headshotUrls'],
      });

      await settle();
      // Threw before any runtime write, so nothing was half-applied.
      expect(api.setFieldRuntime).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
      scope.stop();
    } finally {
      errorSpy.mockRestore();
    }
  });
});
