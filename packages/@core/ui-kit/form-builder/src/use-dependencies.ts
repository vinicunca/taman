import { computed, markRaw, watch } from 'vue';

import type { FormApi } from './form-api';
import type { FieldDependencies, FieldRuntimeState } from './types';

import { getPath } from './paths';
import { createFieldRuntime } from './types';

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function';
}

export interface UseDependenciesOptions {
  api: FormApi;
  getDependencies: () => FieldDependencies | undefined;
  name: () => string | undefined;
}

/**
 * The runtime keys this engine owns. `validating` is deliberately absent:
 * it belongs to the async-validation pipeline (Task 10), and
 * FormApi.setFieldRuntime merges partials over the current runtime, so
 * omitting the key preserves it without a read-then-write race window.
 */
type EngineRuntime = Pick<
  FieldRuntimeState,
  'disabled' | 'dynamicProps' | 'dynamicRules' | 'if' | 'required' | 'show'
>;

function createEngineDefaults(): EngineRuntime {
  const { validating: _validating, ...defaults } = createFieldRuntime();
  return defaults;
}

/**
 * Salvaged from form-ui's useDependencies with two changes:
 * callbacks receive (values, api) instead of vee-validate contexts, and
 * results are written into api.runtime[name] instead of local refs.
 * Evaluation order preserved: if -> (stop when false) -> show -> props
 * -> rules -> disabled -> required -> trigger.
 */
export function useDependencies(opts: UseDependenciesOptions): void {
  const triggerFieldValues = computed(() =>
    (opts.getDependencies()?.triggerFields ?? []).map((field) =>
      getPath(opts.api.values, field),
    ),
  );

  // Guards overlapping async evaluations: rapid successive trigger changes
  // start concurrent runs, and without this the last run to RESOLVE would
  // win even when it computed from an older value. Only the newest run
  // (holding the current token) may write or fire the trigger callback.
  let runToken = 0;

  /**
   * One evaluation pass. Extracted from the watcher so a single rejection
   * handler can cover the whole chain: every dependency callback below is
   * user code that may throw, and from an async watcher callback an
   * escaping rejection surfaces only as a bare "Uncaught (in promise)"
   * naming neither the field nor the phase that failed.
   */
  async function evaluate(
    name: string,
    dependencies: FieldDependencies,
  ): Promise<void> {
    const token = ++runToken;
    const next = createEngineDefaults();
    const values = opts.api.values;
    const api = opts.api as any;

    const {
      disabled,
      if: whenIf,
      props: propsFn,
      required,
      rules,
      show,
      trigger,
    } = dependencies;

    if (isFunction(whenIf)) {
      next.if = !!(await whenIf(values, api));
    } else if (isBoolean(whenIf)) {
      next.if = whenIf;
    }
    if (!next.if) {
      if (token === runToken) {
        opts.api.setFieldRuntime(name, next);
      }
      return;
    }

    if (isFunction(show)) {
      next.show = !!(await show(values, api));
    } else if (isBoolean(show)) {
      next.show = show;
    }

    if (isFunction(propsFn)) {
      next.dynamicProps = (await propsFn(values, api)) ?? {};
    }

    if (isFunction(rules)) {
      // api.runtime is reactive(); a Zod schema's non-configurable lazy
      // `_zod` getter violates Proxy invariants once Vue wraps it (same
      // hazard markFieldsRaw guards against for static field.rules in
      // form-api.ts). Mark it raw before it enters the reactive map.
      const result = await rules(values, api);
      next.dynamicRules = result ? markRaw(result) : result;
    }

    if (isFunction(disabled)) {
      next.disabled = !!(await disabled(values, api));
    } else if (isBoolean(disabled)) {
      next.disabled = disabled;
    }

    if (isFunction(required)) {
      next.required = !!(await required(values, api));
    }

    if (token !== runToken) {
      return;
    }
    opts.api.setFieldRuntime(name, next);

    if (isFunction(trigger)) {
      await trigger(values, api);
    }
  }

  watch(
    [triggerFieldValues, opts.getDependencies],
    ([, dependencies]) => {
      const name = opts.name();
      if (!name || !dependencies || !dependencies.triggerFields?.length) {
        return;
      }
      evaluate(name, dependencies).catch((error: unknown) => {
        console.error(
          `[form-builder] dependency evaluation failed for field "${name}"`,
          error,
        );
      });
    },
    // `immediate` is required, not incidental: if/show/disabled/props/rules
    // must resolve BEFORE first paint or a field gated by `if` would flash
    // in and then vanish. `trigger` rides the same pass, so it also fires
    // once on mount — before the user has touched anything.
    { deep: true, immediate: true },
  );
}
