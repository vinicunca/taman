<script lang="ts" setup>
import type {
  ApiComponentProps,
  ApiComponentOptionsItem as OptionsItem,
} from './types';

import { computed, nextTick, ref, unref, useAttrs, watch } from 'vue';

import { LoaderCircle } from '@vben/icons';

import { clone, get, isEqual, isFunction } from '@taman-core/shared/utils';

import { objectOmit } from '@vueuse/core';

defineOptions({ name: 'ApiComponent', inheritAttrs: false });

const props = withDefaults(defineProps<ApiComponentProps>(), {
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
});

const emit = defineEmits<{
  optionsChange: [OptionsItem[]];
}>();

const modelValue = defineModel<any>({ default: undefined });

const attrs = useAttrs();
const innerParams = ref({});
const refOptions = ref<OptionsItem[]>([]);
const loading = ref(false);
// Whether the first load has completed
const isFirstLoaded = ref(false);
// Whether a request is queued while another is in flight
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

  function transformData(data: OptionsItem[] = []): OptionsItem[] {
    return data.map((item) => {
      const value = get(item, valueField);
      const children = childrenField ? get(item, childrenField) : item.children;
      return {
        ...objectOmit(item, [
          labelField,
          valueField,
          disabledField,
          ...(childrenField ? [childrenField] : []),
        ]),
        label: labelFn ? labelFn(item) : get(item, labelField),
        value: numberToString ? `${value}` : value,
        disabled: get(item, disabledField),
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
  return {
    [props.modelPropName]: unref(modelValue),
    [props.optionsPropName]: unref(getOptions),
    [`onUpdate:${props.modelPropName}`]: (val: string) => {
      modelValue.value = val;
    },
    ...objectOmit(attrs, [`onUpdate:${props.modelPropName}`]),
    ...(props.visibleEvent
      ? {
          [props.visibleEvent]: handleFetchForVisible,
        }
      : {}),
  };
});

async function fetchApi() {
  const { api, beforeFetch, shouldFetch, afterFetch, resultField } = props;

  if (!api || !isFunction(api)) {
    return;
  }

  // If already loading, queue another fetch and return
  if (loading.value) {
    hasPendingRequest.value = true;
    return;
  }

  refOptions.value = [];
  try {
    loading.value = true;
    let finalParams = unref(mergedParams);
    if (beforeFetch && isFunction(beforeFetch)) {
      finalParams = (await beforeFetch(clone(finalParams))) || finalParams;
    }
    // Allow shouldFetch to abort the request
    if (
      shouldFetch &&
      isFunction(shouldFetch) &&
      !(await shouldFetch(finalParams))
    ) {
      return;
    }
    let res = await api(finalParams);
    if (afterFetch && isFunction(afterFetch)) {
      res = (await afterFetch(res)) || res;
    }
    isFirstLoaded.value = true;
    if (Array.isArray(res)) {
      refOptions.value = res;
      emitChange();
      return;
    }
    if (resultField) {
      refOptions.value = get(res, resultField) || [];
    }
    emitChange();
  } catch (error) {
    console.warn(error);
    // reset status
    isFirstLoaded.value = false;
  } finally {
    loading.value = false;
    // Run a queued fetch after the current one finishes
    if (hasPendingRequest.value) {
      hasPendingRequest.value = false;
      // Wait for state to settle before refetching
      await nextTick();
      fetchApi();
    }
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

watch(
  mergedParams,
  (value, oldValue) => {
    if (isEqual(value, oldValue)) {
      return;
    }
    fetchApi();
  },
  { deep: true, immediate: props.immediate },
);

function emitChange() {
  if (
    modelValue.value === undefined &&
    props.autoSelect &&
    unref(getOptions).length > 0
  ) {
    let firstOption;
    if (isFunction(props.autoSelect)) {
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

    if (firstOption) modelValue.value = firstOption.value;
  }
  emit('optionsChange', unref(getOptions));
}
const componentRef = ref();
defineExpose({
  /** Get options data */
  getOptions: () => unref(getOptions),
  /** Get current value */
  getValue: () => unref(modelValue),
  /** Get wrapped component instance */
  getComponentRef: <T = any>() => componentRef.value as T,
  /** Update API params */
  updateParam(newParams: Record<string, any>) {
    innerParams.value = newParams;
  },
});
</script>
<template>
  <component
    :is="component"
    v-bind="bindProps"
    :placeholder="$attrs.placeholder"
    ref="componentRef"
  >
    <template v-for="item in Object.keys($slots)" #[item]="data">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
    <template v-if="loadingSlot && loading" #[loadingSlot]>
      <LoaderCircle class="animate-spin" />
    </template>
  </component>
</template>
