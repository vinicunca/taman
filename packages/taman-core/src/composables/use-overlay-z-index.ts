import type { MaybeRefOrGetter } from 'vue';
import { onScopeDispose, ref, toValue, watch } from 'vue';
import { Z_INDEX_OVERLAY_BASE } from '../constants';

let openLayers = 0;
let currentZIndex = Z_INDEX_OVERLAY_BASE;

/**
 * Assign a z-index on each open so the most recently opened layer stacks on top,
 * regardless of where its teleport sits in the DOM.
 * The value is kept after closing so the leave animation stays in place.
 * @param isOpen
 */
export function useOverlayZIndex(isOpen: MaybeRefOrGetter<boolean | undefined>) {
  const zIndex = ref<number>();
  let holding = false;

  function release() {
    if (!holding) {
      return;
    }
    holding = false;
    openLayers--;
    // Restart once everything is closed so the stack never climbs into the popup layer
    if (openLayers === 0) {
      currentZIndex = Z_INDEX_OVERLAY_BASE;
    }
  }

  watch(
    () => toValue(isOpen),
    (open) => {
      if (open) {
        if (!holding) {
          holding = true;
          openLayers++;
        }
        zIndex.value = ++currentZIndex;
      } else {
        release();
      }
    },
    { immediate: true },
  );

  onScopeDispose(release);

  return zIndex;
}
