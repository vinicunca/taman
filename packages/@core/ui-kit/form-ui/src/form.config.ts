import type { Component } from 'vue';

import type {
  FormBaseComponentType,
  FormCommonConfig,
  TamanFormAdapterOptions,
} from './form.types';

import { globalShareState } from '@taman-core/shared/global-state';
import { BUILT_IN_COMPONENT_MAP } from './form.built-ins';
import { registerFormRules } from './form.rule-registry';

export const DEFAULT_FORM_COMMON_CONFIG: FormCommonConfig = {};

export const COMPONENT_MAP: Record<FormBaseComponentType, Component> = {
  ...BUILT_IN_COMPONENT_MAP,
};

function replaceRecord<T extends object>(target: T, source: T) {
  for (const key of Object.keys(target)) {
    Reflect.deleteProperty(target, key);
  }
  Object.assign(target, source);
}

let lastAdapterOptions: TamanFormAdapterOptions | undefined;

/** Rebuild COMPONENT_MAP from globalShareState after this module is HMR'd. */
export function rehydrateFormComponentMaps() {
  const components = globalShareState.getComponents();
  const nextComponentMap = {
    ...BUILT_IN_COMPONENT_MAP,
    ...components,
  } as Record<FormBaseComponentType, Component>;

  replaceRecord(COMPONENT_MAP, nextComponentMap);
}

export function getFormComponentMap() {
  return {
    ...BUILT_IN_COMPONENT_MAP,
    ...globalShareState.getComponents(),
  } as Record<FormBaseComponentType, Component>;
}

export function setupTamanForm(options: TamanFormAdapterOptions) {
  lastAdapterOptions = options;
  const { rules } = options;

  if (rules) {
    registerFormRules(rules);
  }

  rehydrateFormComponentMaps();
}

const hot = import.meta.hot;
if (hot) {
  hot.dispose((data) => {
    data.lastAdapterOptions = lastAdapterOptions;
  });
  const resumed = hot.data?.lastAdapterOptions as
    | TamanFormAdapterOptions
    | undefined;
  if (resumed) {
    setupTamanForm(resumed);
  } else {
    rehydrateFormComponentMaps();
  }
}
