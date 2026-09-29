import type { App, Ref } from 'vue';

import { afterEach, describe, expect, it } from 'vitest';
import { createApp, nextTick, ref } from 'vue';
import { Z_INDEX_OVERLAY_BASE } from '../../constants';
import { useOverlayZIndex } from '../use-overlay-z-index';

const activeApps: Array<App> = [];

function mountLayer(initialOpen = false) {
  const isOpen = ref(initialOpen);
  let zIndex: Ref<number | undefined> | undefined;
  const host = document.createElement('div');

  const app = createApp({
    setup() {
      zIndex = useOverlayZIndex(isOpen);
      return () => null;
    },
  });
  app.mount(host);
  activeApps.push(app);

  if (!zIndex) {
    throw new Error('useOverlayZIndex was not initialized');
  }
  return { app, isOpen, zIndex };
}

afterEach(() => {
  for (const app of activeApps.splice(0)) {
    app.unmount();
  }
});

describe('useOverlayZIndex', () => {
  it('has no z-index before the layer is opened', () => {
    const { zIndex } = mountLayer();
    expect(zIndex.value).toBeUndefined();
  });

  it('stacks layers by open order, not mount order', async () => {
    const first = mountLayer();
    const second = mountLayer();

    second.isOpen.value = true;
    await nextTick();
    first.isOpen.value = true;
    await nextTick();

    expect(second.zIndex.value).toBe(Z_INDEX_OVERLAY_BASE + 1);
    expect(first.zIndex.value).toBe(Z_INDEX_OVERLAY_BASE + 2);
  });

  it('puts a re-opened layer on top of the others', async () => {
    const first = mountLayer(true);
    const second = mountLayer(true);
    await nextTick();

    first.isOpen.value = false;
    await nextTick();
    first.isOpen.value = true;
    await nextTick();

    expect(first.zIndex.value!).toBeGreaterThan(second.zIndex.value!);
  });

  it('keeps the z-index while closing so the leave animation stays on top', async () => {
    const layer = mountLayer(true);
    await nextTick();
    const opened = layer.zIndex.value;

    layer.isOpen.value = false;
    await nextTick();

    expect(layer.zIndex.value).toBe(opened);
  });

  it('restarts from the base once every layer is closed', async () => {
    const first = mountLayer(true);
    const second = mountLayer(true);
    await nextTick();

    first.isOpen.value = false;
    second.isOpen.value = false;
    await nextTick();
    first.isOpen.value = true;
    await nextTick();

    expect(first.zIndex.value).toBe(Z_INDEX_OVERLAY_BASE + 1);
  });

  it('releases an open layer when it unmounts', async () => {
    const first = mountLayer(true);
    await nextTick();
    first.app.unmount();
    activeApps.splice(activeApps.indexOf(first.app), 1);

    const second = mountLayer(true);
    await nextTick();

    expect(second.zIndex.value).toBe(Z_INDEX_OVERLAY_BASE + 1);
  });

  it('stays below the popup layer so tooltips and popovers render above', async () => {
    const layer = mountLayer(true);
    await nextTick();
    // --taman-z-popup (tooltips, popovers, selects) is 2000
    expect(layer.zIndex.value!).toBeLessThan(2000);
  });
});
