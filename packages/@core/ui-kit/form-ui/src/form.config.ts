import type { Component } from 'vue';

import type {
  FormBaseComponentType,
  FormCommonConfig,
  TamanFormAdapterOptions,
} from './form.types';

import { globalShareState } from '@taman-core/shared/global-state';
import { BUILT_IN_COMPONENT_MAP } from './form.built-ins';
import { warnDeprecatedOnce } from './form.deprecation';
import { registerFormRules } from './form.rule-registry';

const DEFAULT_MODEL_PROP_NAME = 'modelValue';

export const DEFAULT_FORM_COMMON_CONFIG: FormCommonConfig = {};

const BUILT_IN_COMPONENT_BIND_EVENT_MAP: Partial<
  Record<FormBaseComponentType, string>
> = {
};

export const COMPONENT_MAP: Record<FormBaseComponentType, Component> = {
  ...BUILT_IN_COMPONENT_MAP,
};

export const COMPONENT_BIND_EVENT_MAP: Partial<
  Record<FormBaseComponentType, string>
> = {
  ...BUILT_IN_COMPONENT_BIND_EVENT_MAP,
};

function replaceRecord<T extends object>(target: T, source: T) {
  for (const key of Object.keys(target)) {
    Reflect.deleteProperty(target, key);
  }
  Object.assign(target, source);
}

let lastAdapterOptions: TamanFormAdapterOptions | undefined;

/** Rebuild COMPONENT_MAP from globalShareState after this module is HMR'd. */
export function rehydrateFormComponentMaps(
  options: TamanFormAdapterOptions = {},
) {
  const { config } = options;
  const baseModelPropName = config?.baseModelPropName ?? DEFAULT_MODEL_PROP_NAME;
  const modelPropNameMap = config?.modelPropNameMap as
    | Record<FormBaseComponentType, string>
    | undefined;

  const components = globalShareState.getComponents();
  const nextComponentMap = {
    ...BUILT_IN_COMPONENT_MAP,
    ...components,
  } as Record<FormBaseComponentType, Component>;
  const nextBindEventMap = {
    ...BUILT_IN_COMPONENT_BIND_EVENT_MAP,
  } as Partial<Record<FormBaseComponentType, string>>;

  for (const component of Object.keys(components)) {
    const key = component as FormBaseComponentType;

    if (baseModelPropName !== DEFAULT_MODEL_PROP_NAME) {
      nextBindEventMap[key] = baseModelPropName;
    }

    if (modelPropNameMap && modelPropNameMap[key]) {
      nextBindEventMap[key] = modelPropNameMap[key];
    }
  }

  replaceRecord(COMPONENT_MAP, nextComponentMap);
  replaceRecord(COMPONENT_BIND_EVENT_MAP, nextBindEventMap);
}

export function getFormComponentMap() {
  return {
    ...BUILT_IN_COMPONENT_MAP,
    ...globalShareState.getComponents(),
  } as Record<FormBaseComponentType, Component>;
}

export function setupTamanForm<
  T extends FormBaseComponentType = FormBaseComponentType,
>(options: TamanFormAdapterOptions<T>) {
  lastAdapterOptions = options;
  const { config, defineRules, rules } = options;

  const { changeEventFallback = false, emptyStateValue = undefined }
    = (config || {}) as FormCommonConfig;

  Object.assign(DEFAULT_FORM_COMMON_CONFIG, {
    changeEventFallback,
    emptyStateValue,
  });

  if (defineRules) {
    warnDeprecatedOnce(
      'setup-taman-form-define-rules',
      '[Taman Form] `setupTamanForm({ defineRules })` is deprecated. Use `setupTamanForm({ rules })` instead.',
    );
    registerFormRules(defineRules);
  }
  if (rules) {
    registerFormRules(rules);
  }

  rehydrateFormComponentMaps(options);
}

const hot = import.meta.hot;
if (hot) {
  hot.dispose((data) => {
    data.lastAdapterOptions = lastAdapterOptions;
  });
  const resumed = hot.data.lastAdapterOptions as
    | TamanFormAdapterOptions
    | undefined;
  if (resumed) {
    setupTamanForm(resumed);
  } else {
    rehydrateFormComponentMaps();
  }
}
