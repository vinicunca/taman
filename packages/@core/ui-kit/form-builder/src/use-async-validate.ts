import type { Ref } from 'vue';

import { ref, watch } from 'vue';

import type { FormApi } from './form-api';
import type { FieldConfig } from './types';

import { getPath } from './paths';

export interface UseAsyncValidateOptions {
  api: FormApi;
  field: () => FieldConfig;
}

export function useAsyncValidate(opts: UseAsyncValidateOptions): {
  onBlur: () => void;
  validating: Ref<boolean>;
} {
  const validating = ref(false);
  let runToken = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function schedule(): void {
    const field = opts.field();
    const asyncValidate = field.asyncValidate;
    if (!asyncValidate || !field.name) {
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      void run();
    }, asyncValidate.debounce ?? 300);
  }

  async function run(): Promise<void> {
    const field = opts.field();
    const asyncValidate = field.asyncValidate;
    const name = field.name;
    if (!asyncValidate || !name) {
      return;
    }
    const token = ++runToken;
    validating.value = true;
    if (name) {
      opts.api.setFieldRuntime(name, { validating: true });
    }
    const promise = asyncValidate.handler(
      getPath(opts.api.values, name),
      opts.api.values,
    );
    opts.api.trackAsyncValidation(promise);
    let message: string | undefined;
    try {
      message = await promise;
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    if (token !== runToken) {
      return; // stale run: a newer one owns the result
    }
    validating.value = false;
    opts.api.setFieldRuntime(name, { validating: false });
    await opts.api.setAsyncError(name, message);
  }

  watch(
    () => {
      const field = opts.field();
      return field.name ? getPath(opts.api.values, field.name) : undefined;
    },
    () => {
      const field = opts.field();
      if (!field.name || !field.asyncValidate) {
        return;
      }
      // Spec: an async error clears on the next change to the field,
      // regardless of on:'blur'/'input' mode. Clear first, then (re)schedule.
      // Scoped to async-validated fields only — an unguarded clear would
      // wipe displayed SYNC errors on plain fields. The .catch guards the
      // unmount-before-mount edge where getForm() rejects.
      void opts.api.setAsyncError(field.name, undefined).catch(() => {});
      if (field.asyncValidate.on === 'input') {
        schedule();
      }
    },
  );

  function onBlur(): void {
    const mode = opts.field().asyncValidate?.on ?? 'blur';
    if (mode === 'blur') {
      schedule();
    }
  }

  return { onBlur, validating };
}
