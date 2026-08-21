import { CSS_VARIABLE_LAYOUT_VIEWPORT_HEIGHT } from '@taman-core/shared/constants';
import { useCssVar, useEventListener } from '@vueuse/core';
import { onMounted, onUnmounted } from 'vue';

function supportsDynamicViewportHeight() {
  return (
    globalThis.CSS !== undefined
    && typeof globalThis.CSS.supports === 'function'
    && globalThis.CSS.supports('height', '1dvh')
  );
}

function readViewportHeight() {
  return Math.round(window.visualViewport?.height ?? window.innerHeight);
}

/**
 * Only when dvh is not supported, write --taman-viewport-height as a pixel value.
 * When dvh is supported, keep the CSS 100vh → 100dvh cascading, avoiding useCssVar freezing the unit to px.
 */
export function useLayoutViewportHeight() {
  if (typeof window === 'undefined' || supportsDynamicViewportHeight()) {
    return;
  }

  const viewportHeight = useCssVar(
    CSS_VARIABLE_LAYOUT_VIEWPORT_HEIGHT,
    document.documentElement,
    { observe: false },
  );

  let frameId = 0;

  function applyViewportHeight() {
    viewportHeight.value = `${readViewportHeight()}px`;
  }

  function scheduleApplyViewportHeight() {
    if (frameId) {
      return;
    }

    frameId = window.requestAnimationFrame(() => {
      frameId = 0;
      applyViewportHeight();
    });
  }

  applyViewportHeight();
  onMounted(applyViewportHeight);
  useEventListener(window, 'resize', scheduleApplyViewportHeight);

  if (window.visualViewport) {
    useEventListener(
      window.visualViewport,
      'resize',
      scheduleApplyViewportHeight,
    );
  }

  onUnmounted(() => {
    if (!frameId) {
      return;
    }

    window.cancelAnimationFrame(frameId);
    frameId = 0;
  });
}
