import type { App } from 'vue';
import type { NavigationGuard, NavigationHookAfter, Router } from 'vue-router';

import { describe, expect, it, vi } from 'vitest';
import { createApp, nextTick } from 'vue';

import { useContentSpinner } from '../use-content-spinner';

// `preferences` is a module-level singleton; in tests, a mutable mock is used to control the toggle.
const mockPreferences = vi.hoisted(() => ({ transition: { loading: true } }));

vi.mock('@taman/preferences', () => ({
  preferences: mockPreferences,
}));

// `useRouter` injects the router instance, and tests use a holder to provide it directly.
const routerHolder = vi.hoisted(() => ({
  current: undefined as undefined | { afterEach: unknown; beforeEach: unknown },
}));

vi.mock('vue-router', () => ({
  useRouter: () => routerHolder.current,
}));

const SHOW_DELAY = 200;
const MIN_SHOW_TIME = 500;

function createRouterMock() {
  let afterHook: NavigationHookAfter | undefined;
  let beforeGuard: NavigationGuard | undefined;
  const router = {
    afterEach: vi.fn((hook: NavigationHookAfter) => {
      afterHook = hook;
    }),
    beforeEach: vi.fn((guard: NavigationGuard) => {
      beforeGuard = guard;
    }),
  } as unknown as Router;

  function getHooks() {
    if (!afterHook || !beforeGuard) {
      throw new Error('Router hooks were not registered');
    }
    return { afterHook, beforeGuard };
  }

  return { getHooks, router };
}

let activeApp: App | undefined;

/** Mounts the composition function and returns a real-time read of `spinning`. */
function mountSpinner(router: Router) {
  routerHolder.current = router as never;
  const host = document.createElement('div');
  document.body.append(host);
  let spinningRef: undefined | { value: boolean };
  activeApp = createApp({
    setup() {
      const { spinning } = useContentSpinner();
      spinningRef = spinning;
      return () => null;
    },
  });
  activeApp.mount(host);
  return () => spinningRef?.value ?? false;
}

function makeRoute(meta: Record<string, unknown> = {}) {
  return { meta } as never;
}

function runBefore(guard: NavigationGuard, route = makeRoute()) {
  return guard(route, makeRoute(), vi.fn());
}

function runAfter(hook: NavigationHookAfter, route = makeRoute()) {
  return hook(route, makeRoute(), undefined);
}

function cleanup() {
  activeApp?.unmount();
  activeApp = undefined;
  document.body.innerHTML = '';
  routerHolder.current = undefined;
}

describe('useContentSpinner', () => {
  it('does not show spinner when navigation finishes within showDelay', async () => {
    vi.useFakeTimers();
    try {
      const routerMock = createRouterMock();
      const isSpinning = mountSpinner(routerMock.router);
      const timerBaseline = vi.getTimerCount();
      const { afterHook, beforeGuard } = routerMock.getHooks();
      const route = makeRoute();

      await runBefore(beforeGuard, route);
      // Complete navigation before `showDelay`.
      vi.advanceTimersByTime(SHOW_DELAY - 50);
      await runAfter(afterHook, route);
      vi.advanceTimersByTime(SHOW_DELAY * 2);
      await nextTick();

      expect(isSpinning()).toBe(false);
      // Rapid navigation should not leave any net new timers (above the environment baseline).
      expect(vi.getTimerCount()).toBe(timerBaseline);
    } finally {
      vi.useRealTimers();
      cleanup();
    }
  });

  it('shows spinner after showDelay and hides it after navigation ends', async () => {
    vi.useFakeTimers();
    try {
      const routerMock = createRouterMock();
      const isSpinning = mountSpinner(routerMock.router);
      const { afterHook, beforeGuard } = routerMock.getHooks();
      const route = makeRoute();

      await runBefore(beforeGuard, route);
      vi.advanceTimersByTime(SHOW_DELAY);
      await nextTick();
      expect(isSpinning()).toBe(true);

      // Navigation takes 800ms > `minShowTime`, hidden immediately after `afterEach`.
      vi.advanceTimersByTime(800 - SHOW_DELAY);
      await runAfter(afterHook, route);
      await nextTick();
      expect(isSpinning()).toBe(false);
    } finally {
      vi.useRealTimers();
      cleanup();
    }
  });

  it('keeps spinner for minShowTime when navigation is slightly slow', async () => {
    vi.useFakeTimers();
    try {
      const routerMock = createRouterMock();
      const isSpinning = mountSpinner(routerMock.router);
      const { afterHook, beforeGuard } = routerMock.getHooks();
      const route = makeRoute();

      await runBefore(beforeGuard, route);
      vi.advanceTimersByTime(SHOW_DELAY);
      await nextTick();
      expect(isSpinning()).toBe(true);

      // Navigation takes 300ms, spinner starts showing at 200ms, should remain until 700ms.
      vi.advanceTimersByTime(300 - SHOW_DELAY);
      await runAfter(afterHook, route);
      await nextTick();
      expect(isSpinning()).toBe(true);

      vi.advanceTimersByTime(MIN_SHOW_TIME - (300 - SHOW_DELAY) - 1);
      await nextTick();
      expect(isSpinning()).toBe(true);

      vi.advanceTimersByTime(1);
      await nextTick();
      expect(isSpinning()).toBe(false);
    } finally {
      vi.useRealTimers();
      cleanup();
    }
  });

  it('does not let an older navigation cancel the current show timer', async () => {
    vi.useFakeTimers();
    try {
      const routerMock = createRouterMock();
      const isSpinning = mountSpinner(routerMock.router);
      const { afterHook, beforeGuard } = routerMock.getHooks();
      const from = makeRoute();
      const firstRoute = makeRoute();
      const secondRoute = makeRoute();

      await beforeGuard(firstRoute, from, vi.fn());
      vi.advanceTimersByTime(SHOW_DELAY / 2);
      await beforeGuard(secondRoute, firstRoute, vi.fn());

      // Vue Router can complete the cancelled navigation after the newer
      // navigation has already installed its own show timer.
      await afterHook(firstRoute, from, undefined);
      vi.advanceTimersByTime(SHOW_DELAY);
      await nextTick();

      expect(isSpinning()).toBe(true);
    } finally {
      vi.useRealTimers();
      cleanup();
    }
  });

  it('never shows spinner for rapid consecutive navigations', async () => {
    vi.useFakeTimers();
    try {
      const routerMock = createRouterMock();
      const isSpinning = mountSpinner(routerMock.router);
      const { afterHook, beforeGuard } = routerMock.getHooks();

      // Three consecutive rapid navigations, no spinner should be displayed at any time.
      let route = makeRoute();
      await runBefore(beforeGuard, route);
      vi.advanceTimersByTime(100);
      await runAfter(afterHook, route);
      route = makeRoute();
      await runBefore(beforeGuard, route);
      vi.advanceTimersByTime(150);
      await runAfter(afterHook, route);
      route = makeRoute();
      await runBefore(beforeGuard, route);
      vi.advanceTimersByTime(180);
      await runAfter(afterHook, route);
      vi.advanceTimersByTime(1000);
      await nextTick();

      expect(isSpinning()).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
      cleanup();
    }
  });

  it('skips spinner entirely for routes marked as loaded', async () => {
    vi.useFakeTimers();
    try {
      const routerMock = createRouterMock();
      const isSpinning = mountSpinner(routerMock.router);
      const { afterHook, beforeGuard } = routerMock.getHooks();
      const route = makeRoute({ loaded: true });

      await runBefore(beforeGuard, route);
      vi.advanceTimersByTime(SHOW_DELAY * 2);
      await runAfter(afterHook, route);
      await nextTick();

      expect(isSpinning()).toBe(false);
    } finally {
      vi.useRealTimers();
      cleanup();
    }
  });

  it('skips spinner when transition loading is disabled', async () => {
    vi.useFakeTimers();
    try {
      mockPreferences.transition.loading = false;
      const routerMock = createRouterMock();
      const isSpinning = mountSpinner(routerMock.router);
      const { afterHook, beforeGuard } = routerMock.getHooks();
      const route = makeRoute();

      await runBefore(beforeGuard, route);
      vi.advanceTimersByTime(SHOW_DELAY * 2);
      await runAfter(afterHook, route);
      await nextTick();

      expect(isSpinning()).toBe(false);
    } finally {
      mockPreferences.transition.loading = true;
      vi.useRealTimers();
      cleanup();
    }
  });
});
