<script lang="ts" setup>
import type { AppFetchComponentOptionsItem, AppFetchComponentProps } from './app-fetch-component.types';

import {
  clone,
  isDeepEqual,
  isFunctionType,
  omit,
  prop,
} from '@taman-core/shared/utils';
import PIcon from 'pohon-ui/runtime/vue/components/Icon.vue';
import { computed, nextTick, ref, unref, useAttrs, watch } from 'vue';

defineOptions({
  name: 'AppFetchComponent',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<AppFetchComponentProps>(),
  {
    labelField: 'label',
    valueField: 'value',
    labelFn: undefined,
    disabledField: 'disabled',
    childrenField: '',
    optionsPropName: 'options',
    resultField: '',
    visibleEvent: '',
    numberToString: false,
    params: () => ({}),
    immediate: true,
    alwaysLoad: false,
    loadingSlot: '',
    beforeFetch: undefined,
    shouldFetch: undefined,
    afterFetch: undefined,
    modelPropName: 'modelValue',
    api: undefined,
    autoSelect: false,
    options: () => [],
  },
);

const emits = defineEmits<{
  optionsChange: [Array<AppFetchComponentOptionsItem>];
}>();

const modelValue = defineModel<any>({ default: undefined });
const attrs = useAttrs();

const usesDefaultModelValue = computed(() => {
  return ['model-value', 'modelValue'].includes(props.modelPropName);
});
const currentModelValue = computed(() => {
  return usesDefaultModelValue.value
    ? modelValue.value
    : attrs[props.modelPropName];
});

const innerParams = ref({});
const isLoading = ref(false);
const refOptions = ref<Array<AppFetchComponentOptionsItem>>([]);
const isFirstLoaded = ref(false);
const hasPendingRequest = ref(false);

const getOptions = computed(() => {
  const {
    labelField,
    labelFn,
    valueField,
    disabledField,
    childrenField,
    numberToString,
  } = props;

  function transformData(data: Array<AppFetchComponentOptionsItem> = []): Array<AppFetchComponentOptionsItem> {
    return data.map((item) => {
      const value = prop(item, valueField);
      const children = childrenField ? prop(item, childrenField) : item.children;
      return {
        ...omit(item, [
          labelField,
          valueField,
          disabledField,
          ...(childrenField ? [childrenField] : []),
        ]),
        label: labelFn ? labelFn(item) : prop(item, labelField),
        value: numberToString ? `${value}` : value,
        disabled: prop(item, disabledField),
        ...(Array.isArray(children) && children.length > 0
          ? { children: transformData(children) }
          : {}),
      };
    });
  }

  const data = transformData(unref(refOptions));

  return data.length > 0 ? data : transformData(props.options);
});

const bindProps = computed(() => {
  const updateEvent = `onUpdate:${props.modelPropName}`;

  return {
    [props.modelPropName]: unref(currentModelValue),
    [props.optionsPropName]: unref(getOptions),
    [updateEvent]: (val: string) => {
      updateModelValue(val);
    },
    ...omit(attrs, [props.modelPropName, updateEvent]),
    ...(props.visibleEvent
      ? {
          [props.visibleEvent]: handleFetchForVisible,
        }
      : {}),
  };
});

function updateModelValue(value: any) {
  if (usesDefaultModelValue.value) {
    modelValue.value = value;
    return;
  }
  const updateHandler = attrs[`onUpdate:${props.modelPropName}`];
  if (isFunctionType(updateHandler)) {
    updateHandler(value);
  }
}

async function handleFetchForVisible(visible: boolean) {
  if (visible) {
    if (props.alwaysLoad) {
      await fetchApi();
    } else if (!props.immediate && !unref(isFirstLoaded)) {
      await fetchApi();
    }
  }
}

const mergedParams = computed(() => {
  return {
    ...props.params,
    ...unref(innerParams),
  };
});

async function fetchApi() {
  const { api, beforeFetch, shouldFetch, afterFetch, resultField } = props;
  if (!api || !isFunctionType(api)) {
    return;
  }

  // If loading is in progress, mark the request as pending and return.
  if (isLoading.value) {
    hasPendingRequest.value = true;
    return;
  }

  refOptions.value = [];
  try {
    isLoading.value = true;
    let finalParams = unref(mergedParams);
    if (beforeFetch && isFunctionType(beforeFetch)) {
      finalParams = (await beforeFetch(clone(finalParams))) || finalParams;
    }
    // If the request should be aborted, return.
    if (
      shouldFetch
      && isFunctionType(shouldFetch)
      && !(await shouldFetch(finalParams))
    ) {
      return;
    }

    let res = await api(finalParams);
    if (afterFetch && isFunctionType(afterFetch)) {
      res = (await afterFetch(res)) || res;
    }

    isFirstLoaded.value = true;
    if (Array.isArray(res)) {
      refOptions.value = res;
      emitChange();
      return;
    }
    if (resultField) {
      refOptions.value = prop(res, resultField) || [];
    }
    emitChange();
  } catch (error) {
    console.warn(error);
    // reset status
    isFirstLoaded.value = false;
  } finally {
    isLoading.value = false;
    // If there are pending requests, trigger a new request immediately.
    if (hasPendingRequest.value) {
      hasPendingRequest.value = false;
      // Use nextTick to ensure that state updates are complete before triggering a new request.
      await nextTick();
      fetchApi();
    }
  }
}

function emitChange() {
  if (
    currentModelValue.value === undefined
    && props.autoSelect
    && unref(getOptions).length > 0
  ) {
    let firstOption;
    if (isFunctionType(props.autoSelect)) {
      firstOption = props.autoSelect(unref(getOptions));
    } else {
      switch (props.autoSelect) {
        case 'first': {
          firstOption = unref(getOptions)[0];
          break;
        }
        case 'last': {
          firstOption = unref(getOptions)[unref(getOptions).length - 1];
          break;
        }
        case 'one': {
          if (unref(getOptions).length === 1) {
            firstOption = unref(getOptions)[0];
          }
          break;
        }
      }
    }

    if (firstOption) {
      updateModelValue(firstOption.value);
    }
  }

  emits('optionsChange', unref(getOptions));
}

watch(
  mergedParams,
  (value, oldValue) => {
    if (isDeepEqual(value, oldValue)) {
      return;
    }
    fetchApi();
  },
  { deep: true, immediate: props.immediate },
);

const componentRef = ref();

defineExpose({
  /** Retrieve options data */
  getOptions: () => unref(getOptions),
  /** Get the current value */
  getValue: () => unref(currentModelValue),
  /** Get the wrapped component instance */
  getComponentRef: <T = any>() => componentRef.value as T,
  /** Update the API parameters */
  updateParam(newParams: Record<string, any>) {
    innerParams.value = newParams;
  },
});
</script>

<template>
  <component
    :is="component"
    v-bind="bindProps"
    ref="componentRef"
    :placeholder="$attrs.placeholder"
  >
    <template
      v-for="item in Object.keys($slots)"
      #[item]="data"
    >
      <slot
        :name="item"
        v-bind="data || {}"
      />
    </template>

    <template
      v-if="loadingSlot && isLoading"
      #[loadingSlot]
    >
      <PIcon
        name="lucide:loader-circle"
        class="animate-spin"
      />
    </template>
  </component>
</template>
