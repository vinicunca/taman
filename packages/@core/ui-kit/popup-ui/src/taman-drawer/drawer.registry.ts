import type { Component } from 'vue';

import { markRaw, shallowReactive } from 'vue';

export interface DrawerRegistryEntry {
  component: Component;
  id: symbol;
}

/**
 * Global registry of connector components rendered by <TamanDrawerProvider />.
 * Callers may also render the returned <Drawer> binder to forward
 * attrs/listeners/slots onto the connected component.
 */
export const drawerRegistry = shallowReactive<Array<DrawerRegistryEntry>>([]);

export function registerDrawer(id: symbol, component: Component) {
  if (drawerRegistry.some((entry) => entry.id === id)) {
    return;
  }
  drawerRegistry.push({ component: markRaw(component), id });
}

export function unregisterDrawer(id: symbol) {
  const index = drawerRegistry.findIndex((entry) => entry.id === id);
  if (index !== -1) {
    drawerRegistry.splice(index, 1);
  }
}
