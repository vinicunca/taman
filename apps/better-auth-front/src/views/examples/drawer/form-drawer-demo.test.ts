import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h } from 'vue';

const mocks = vi.hoisted(() => {
  const formState = {
    error: undefined as string | undefined,
    values: {} as Record<string, unknown>,
  };
  const drawerApi = {
    close: vi.fn(),
    getData: vi.fn(),
  };
  const formApi = {
    reset: vi.fn((state?: { values?: Record<string, unknown> }) => {
      formState.error = undefined;
      formState.values = state?.values ?? {};
    }),
    setValues: vi.fn((values: Record<string, unknown>) => {
      formState.values = { ...formState.values, ...values };
    }),
    validateAndSubmit: vi.fn(),
  };

  return {
    drawerApi,
    drawerOptions: undefined as undefined | {
      onOpenChange: (isOpen: boolean) => void;
    },
    formApi,
    formState,
  };
});

vi.mock('@taman/app-ui', () => ({
  useTamanDrawer: (options: { onOpenChange: (isOpen: boolean) => void }) => {
    mocks.drawerOptions = options;
    return [defineComponent(() => () => h('div')), mocks.drawerApi];
  },
}));

vi.mock('#/adapter/form', () => ({
  useTamanForm: () => [defineComponent(() => () => h('form')), mocks.formApi],
}));

import FormDrawerDemo from './form-drawer-demo.vue';

describe('FormDrawerDemo', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.formState.error = 'Field 1 is required';
    mocks.formState.values = { field1: '' };
    mocks.drawerApi.getData.mockReturnValue({
      values: { field1: 'abc', field2: '123' },
    });
    app = createApp(FormDrawerDemo);
    app.mount(document.createElement('div'));
  });

  afterEach(() => {
    app.unmount();
  });

  it('starts each populated drawer session with fresh validation state', () => {
    mocks.drawerOptions?.onOpenChange(true);

    expect(mocks.formState.values).toEqual({ field1: 'abc', field2: '123' });
    expect(mocks.formState.error).toBeUndefined();
  });
});
