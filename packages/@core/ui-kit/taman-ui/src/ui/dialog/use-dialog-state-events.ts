import type { Ref } from 'vue';

import { onScopeDispose, watch } from 'vue';

/**
 * The `closed`/`opened` events for the popup are determined by the content element's own exit animation (`animationend`).
 * If the animation is skipped or cancelled (e.g., due to reduced motion settings, interruption, or class changes during closure),
 * the events would otherwise never fire—leaving the popup visible, the `hidden` class unapplied,
 * and pending operations like re-mounting (for `destroy-on-close`) or `onClosed` listeners stalled.
 * This implementation aligns with akar's Presence behavior (treating `animationcancel` as completion)
 * and adds a fallback trigger after the animation window closes, ensuring the closure sequence
 * always completes exactly once.
 */

/** The exit animation duration of the popup in this repository is 150ms; 300ms can safely cover it. */
const CLOSED_EVENT_FALLBACK_MS = 300;

export function useDialogStateEvents(
  { contentRef, isOpen, onClosed, onOpened }: {
    contentRef: Ref<null | { $el: Element | null }>;
    isOpen: () => boolean;
    onClosed: () => void;
    onOpened: () => void;
  },
) {
  let closeFallbackTimer: null | ReturnType<typeof setTimeout> = null;
  let closeAcknowledged = false;

  function emitOpenStateChange() {
    if (closeFallbackTimer !== null) {
      clearTimeout(closeFallbackTimer);
      closeFallbackTimer = null;
    }
    if (isOpen()) {
      onOpened();
      return;
    }
    // The closure has been confirmed by the animation event or fallback; `closed` is only triggered once within the same closure cycle.
    if (closeAcknowledged) {
      return;
    }
    closeAcknowledged = true;
    onClosed();
  }

  /**
   * Listen to the `animationend` and `animationcancel` events of the content element simultaneously —— the cancelled animation is also considered as complete (akar's Presence also handles this way),
   * the closure sequence will not wait indefinitely.
   */
  function handleAnimationEvent(event: AnimationEvent) {
    if (event.target === contentRef.value?.$el) {
      emitOpenStateChange();
    }
  }

  watch(isOpen, (open) => {
    if (open) {
      closeAcknowledged = false;
      if (closeFallbackTimer !== null) {
        clearTimeout(closeFallbackTimer);
        closeFallbackTimer = null;
      }
      return;
    }
    // Start the fallback timer: if there is no animation event to confirm the closure (the exit animation is skipped/cancelled),
    // trigger `closed` after the animation window ends.
    if (closeFallbackTimer === null) {
      closeFallbackTimer = setTimeout(() => {
        closeFallbackTimer = null;
        if (!isOpen()) {
          emitOpenStateChange();
        }
      }, CLOSED_EVENT_FALLBACK_MS);
    }
  });

  onScopeDispose(() => {
    if (closeFallbackTimer !== null) {
      clearTimeout(closeFallbackTimer);
      closeFallbackTimer = null;
    }
  });

  return { handleAnimationEvent };
}
