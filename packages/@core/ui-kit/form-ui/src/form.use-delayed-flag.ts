import type { ComputedRef } from 'vue';

import { computed, onScopeDispose, ref, watch } from 'vue';

/**
 * Mirrors `source`, but only flips to `true` once it has stayed truthy for
 * `delayMs`. Falls back to `false` immediately.
 *
 * Used to keep fast async validators from flashing a spinner. Unlike the
 * previous inline implementation this never mutates reactive state during
 * render, so it is safe to read from a computed or a template.
 */
export function useDelayedFlag(
  source: () => boolean,
  delayMs: number,
): ComputedRef<boolean> {
  const settled = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function clear() {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  watch(
    source,
    (active) => {
      clear();
      if (!active) {
        settled.value = false;
        return;
      }
      timer = setTimeout(() => {
        settled.value = true;
        timer = undefined;
      }, delayMs);
    },
    { immediate: true },
  );

  onScopeDispose(clear);

  return computed(() => settled.value);
}
