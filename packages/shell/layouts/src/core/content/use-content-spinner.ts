/* eslint-disable sonar/no-invariant-returns */
import { preferences } from '@taman/preferences';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

/**
 * Content switching loading:
 * - Delayed display: The spinner is not rendered if navigation completes within `showDelay`,
 *   preventing the stuttering sensation caused by a flickering semi-transparent overlay during rapid transitions;
 * - Minimum display duration: Once shown, the spinner remains visible for at least `minShowTime` to avoid a fleeting flash.
 */
export function useContentSpinner() {
  const spinning = ref(false);
  const startTime = ref(0);
  const router = useRouter();
  const showDelay = 200; // Delay display time: faster navigation does not show loading
  const minShowTime = 500; // Minimum display time
  const enableLoading = computed(() => preferences.transition.loading);

  let hideTimer: null | ReturnType<typeof setTimeout> = null;
  let navSeq = 0;
  const routeSeq = new WeakMap<object, number>();
  let showTimer: null | {
    id: ReturnType<typeof setTimeout>;
    seq: number;
  } = null;

  function clearTimers() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    if (showTimer) {
      clearTimeout(showTimer.id);
      showTimer = null;
    }
  }

  // End loading spinner (respecting minimum display time)
  function onEnd(seq?: number) {
    if (!enableLoading.value || seq !== navSeq) {
      return;
    }
    if (showTimer?.seq === seq) {
      clearTimeout(showTimer.id);
      showTimer = null;
    }
    // spinner has not been shown yet (rapid navigation): end immediately, no flash
    if (!spinning.value) {
      return;
    }
    const processTime = performance.now() - startTime.value;
    if (processTime < minShowTime) {
      hideTimer = setTimeout(() => {
        hideTimer = null;
        spinning.value = false;
      }, minShowTime - processTime);
    } else {
      spinning.value = false;
    }
  }

  // Route beforeEach: start spinner
  router.beforeEach((to) => {
    if (to.meta.loaded || !enableLoading.value || to.meta.iframeSrc) {
      return true;
    }
    clearTimers();
    navSeq += 1;
    const seq = navSeq;
    routeSeq.set(to, seq);
    const id = setTimeout(() => {
      if (showTimer?.seq === seq) {
        showTimer = null;
      }
      // Only show if it's still the current navigation, avoiding stale timer flash.
      if (seq === navSeq && !spinning.value) {
        startTime.value = performance.now();
        spinning.value = true;
      }
    }, showDelay);
    showTimer = { id, seq };
    return true;
  });

  // Route afterEach: end spinner
  router.afterEach((to) => {
    if (to.meta.loaded || !enableLoading.value || to.meta.iframeSrc) {
      return true;
    }
    onEnd(routeSeq.get(to));
    return true;
  });

  return {
    spinning,
  };
}
