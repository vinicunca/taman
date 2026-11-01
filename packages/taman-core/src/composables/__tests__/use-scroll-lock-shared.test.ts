import type { App, WritableComputedRef } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, nextTick } from 'vue';
import { ELEMENT_ID_LAYOUT_SCROLL } from '../../constants';
import { SCROLL_FIXED_CLASS, useScrollLock } from '../use-scroll-lock';

const apps = new Set<App>();
function mountLock(immediate = true) {
  let lock!: WritableComputedRef<boolean>;
  const app = createApp({
    setup() {
      lock = useScrollLock({ immediate });
      return () => null;
    },
  });
  const host = document.createElement('div');
  document.body.append(host);
  apps.add(app);
  app.mount(host);
  return {
    lock,
    unmount() {
      app.unmount();
      apps.delete(app);
    },
  };
}

function scrollTarget() {
  const target = document.createElement('div');
  target.id = ELEMENT_ID_LAYOUT_SCROLL;
  target.style.overflow = 'auto';
  target.style.setProperty('scrollbar-gutter', 'auto', 'important');
  Object.defineProperties(target, { clientHeight: { value: 100 }, scrollHeight: { value: 200 } });
  document.body.append(target);
  return target;
}

afterEach(() => {
  apps.forEach((app) => {
    app.unmount();
  });
  apps.clear();
  document.body.innerHTML = '';
  document.body.style.cssText = '';
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('shared overlay scroll locks', () => {
  it.each([0, 1])('keeps the target locked until owner %i closes last', async (last) => {
    const target = scrollTarget();
    const owners = [mountLock(), mountLock()];
    await nextTick();
    await nextTick();
    expect(owners.every((owner) => owner.lock.value)).toBe(true);
    owners[1 - last]!.unmount();
    expect(target.style.overflow).toBe('hidden');
    expect(target.style.getPropertyValue('scrollbar-gutter')).toBe('stable');
    owners[last]!.unmount();
    expect(target.style.overflow).toBe('auto');
    expect(target.style.getPropertyValue('scrollbar-gutter')).toBe('auto');
    expect(target.style.getPropertyPriority('scrollbar-gutter')).toBe('important');
  });

  it('counts each owner once and ignores unlocking an unused owner', () => {
    const target = scrollTarget();
    const first = mountLock(false);
    const second = mountLock(false);
    const unused = mountLock(false);
    first.lock.value = true;
    first.lock.value = true;
    second.lock.value = true;
    unused.unmount();
    first.lock.value = false;
    first.lock.value = false;
    expect(target.style.overflow).toBe('hidden');
    second.lock.value = false;
    expect(target.style.overflow).toBe('auto');
  });

  it('joins a lock after overflow is already hidden', async () => {
    const target = scrollTarget();
    const first = mountLock();
    await nextTick();
    const second = mountLock();
    await nextTick();
    expect(second.lock.value).toBe(true);
    first.unmount();
    expect(target.style.overflow).toBe('hidden');
    second.unmount();
    expect(target.style.overflow).toBe('auto');
  });

  it('does not acquire a lock after unmounting before nextTick', async () => {
    const target = scrollTarget();
    const owner = mountLock();
    owner.unmount();
    await nextTick();
    expect(target.style.overflow).toBe('auto');
  });

  it('restores original body and fixed-node styles across rapid reopen', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    Object.defineProperties(document.body, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 200 },
    });
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(200);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(100);
    document.body.style.overflow = 'auto';
    document.body.style.setProperty('padding-right', '7px', 'important');
    const fixed = document.createElement('div');
    fixed.className = SCROLL_FIXED_CLASS;
    fixed.style.setProperty('padding-right', '3px', 'important');
    fixed.style.setProperty('transition', 'opacity 200ms', 'important');
    document.body.append(fixed);
    const owner = mountLock(false);
    owner.lock.value = true;
    owner.lock.value = false;
    owner.lock.value = true;
    expect(fixed.style.transition).toBe('none');
    owner.lock.value = false;
    await vi.advanceTimersByTimeAsync(20);
    expect(document.body.style.paddingRight).toBe('7px');
    expect(document.body.style.getPropertyPriority('padding-right')).toBe('important');
    expect(fixed.style.paddingRight).toBe('3px');
    expect(fixed.style.transition).toBe('opacity 200ms');
    expect(fixed.style.getPropertyPriority('transition')).toBe('important');
  });
});
