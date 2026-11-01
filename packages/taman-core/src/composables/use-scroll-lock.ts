import {
  useScrollLock as _useScrollLock,
  tryOnBeforeUnmount,
  tryOnMounted,
} from '@vueuse/core';
import { computed, effectScope, nextTick, shallowRef } from 'vue';
import { getLayoutScrollElement, getScrollbarWidth, needsScrollbar } from '../utils';

export const SCROLL_FIXED_CLASS = '_scroll__fixed_';

interface ScrollLockOptions {
  immediate?: boolean;
}

let lockCount = 0;
let releaseLock: (() => void) | undefined;
const pendingTransitionRestores = new WeakMap<HTMLElement, { frame: number; restore: () => void }>();

function getScrollLockTarget() {
  return getLayoutScrollElement() ?? document.body;
}

function captureStyle(element: HTMLElement, property: string) {
  const value = element.style.getPropertyValue(property);
  const priority = element.style.getPropertyPriority(property);
  return () => {
    if (value) {
      element.style.setProperty(property, value, priority);
    } else {
      element.style.removeProperty(property);
    }
  };
}

function disableTransition(node: HTMLElement) {
  const pending = pendingTransitionRestores.get(node);
  if (pending) {
    cancelAnimationFrame(pending.frame);
    pendingTransitionRestores.delete(node);
  }
  const restore = pending?.restore ?? captureStyle(node, 'transition');
  node.style.transition = 'none';
  return () => {
    const frame = requestAnimationFrame(() => {
      pendingTransitionRestores.delete(node);
      restore();
    });
    pendingTransitionRestores.set(node, { frame, restore });
  };
}

function applyScrollbarStyles(target: HTMLElement): Array<() => void> {
  if (!needsScrollbar(target)) {
    return [];
  }
  if (target !== document.body) {
    const restore = captureStyle(target, 'scrollbar-gutter');
    target.style.setProperty('scrollbar-gutter', 'stable');
    return [restore];
  }
  if (!needsScrollbar()) {
    return [];
  }
  const width = `${getScrollbarWidth()}px`;
  const restore = [captureStyle(target, 'padding-right')];
  target.style.paddingRight = width;
  document.querySelectorAll<HTMLElement>(`.${SCROLL_FIXED_CLASS}`).forEach((node) => {
    restore.push(captureStyle(node, 'padding-right'), disableTransition(node));
    node.style.paddingRight = width;
  });
  return restore;
}

function acquireLock(target: HTMLElement) {
  const restore = applyScrollbarStyles(target);
  // The shared lock must outlive whichever overlay acquired it first.
  const scope = effectScope(true);
  scope.run(() => {
    const locked = _useScrollLock(target);
    locked.value = true;
  });
  return () => {
    scope.stop();
    restore.forEach((reset) => {
      reset();
    });
  };
}

export function useScrollLock(options: ScrollLockOptions = {}) {
  const { immediate = true } = options;
  const ownsLock = shallowRef(false);
  let disposed = false;

  const isLocked = computed({
    get: () => ownsLock.value,
    set(value: boolean) {
      if (value === ownsLock.value || (value && disposed)) {
        return;
      }
      if (value) {
        releaseLock ??= acquireLock(getScrollLockTarget());
        lockCount += 1;
      } else if (--lockCount === 0) {
        releaseLock?.();
        releaseLock = undefined;
      }
      ownsLock.value = value;
    },
  });

  tryOnMounted(async () => {
    await nextTick();
    if (disposed) {
      return;
    }
    // Join existing owners even when overflow:hidden hides the scrollbar.
    if (immediate && (lockCount > 0 || needsScrollbar(getScrollLockTarget()))) {
      isLocked.value = true;
    }
  });

  tryOnBeforeUnmount(() => {
    disposed = true;
    isLocked.value = false;
  });

  return isLocked;
}
