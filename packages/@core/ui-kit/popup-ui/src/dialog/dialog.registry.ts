import type { Component } from 'vue';

import { markRaw, shallowReactive } from 'vue';

export interface DialogRegistryEntry {
  component: Component;
  id: symbol;
}

/**
 * Global registry of connector components rendered by <TamanDialogProvider />.
 * useTamanDialog registers here instead of returning a component for the
 * caller to mount in a template.
 */
export const dialogRegistry = shallowReactive<Array<DialogRegistryEntry>>([]);

export function registerDialog(id: symbol, component: Component) {
  if (dialogRegistry.some((entry) => entry.id === id)) {
    return;
  }
  dialogRegistry.push({ component: markRaw(component), id });
}

export function unregisterDialog(id: symbol) {
  const index = dialogRegistry.findIndex((entry) => entry.id === id);
  if (index !== -1) {
    dialogRegistry.splice(index, 1);
  }
}
