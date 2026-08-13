/* eslint-disable sonar/no-invariant-returns */
import { preferences } from '@taman/preferences';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

function useContentSpinner() {
  const spinning = ref(false);
  const startTime = ref(0);
  const router = useRouter();
  const minShowTime = 500; // Minimum spinner display time (ms)
  const enableLoading = computed(() => preferences.transition.loading);

  // End loading spinner (respecting minimum display time)
  function onEnd() {
    if (!enableLoading.value) {
      return;
    }
    const processTime = performance.now() - startTime.value;
    if (processTime < minShowTime) {
      setTimeout(() => {
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
    startTime.value = performance.now();
    spinning.value = true;
    return true;
  });

  // Route afterEach: end spinner
  router.afterEach((to) => {
    if (to.meta.loaded || !enableLoading.value || to.meta.iframeSrc) {
      return true;
    }
    onEnd();
    return true;
  });

  return { spinning };
}

export { useContentSpinner };
