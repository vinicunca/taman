<script setup lang="ts">
import type { CollapsibleParamSchema } from './type';

import { globalShareState } from '@taman-core/shared/global-state';
import { computed } from 'vue';

interface Props {
  data: CollapsibleParamSchema;
}
const props = defineProps<Props>();

const modelValue = defineModel('value');

const finalOption = computed(() => {
  const { type, ...otherOption } = props.data.option;

  if (type === 'number' || type === 'exponential') {
    return {
      step: props.data.option.step ?? 1,
      min: props.data.option.min,
      max: props.data.option.max,
      precision: props.data.option.precision,
      ...otherOption,
    };
  }

  return otherOption;
});

const components = globalShareState.getComponents();

const FieldComponent = computed(() => {
  switch (props.data.option.type) {
    case 'exponential':
    case 'number': {
      return components.InputNumber;
    }
    case 'select': {
      return components.Select;
    }
    case 'string': {
      return components.Input;
    }

    default: {
      return components.InputNumber;
    }
  }
});

const limitDisplay = computed(() => {
  if (
    props.data.option.min !== null
    && props.data.option.min !== undefined
    && props.data.option.max !== null
    && props.data.option.max !== undefined
  ) {
    return `[${props.data.option.min},${props.data.option.max}]`;
  }

  if (props.data.option.min !== null && props.data.option.min !== undefined) {
    return `min:${props.data.option.min}`;
  }

  if (props.data.option.max !== null && props.data.option.max !== undefined) {
    return `max:${props.data.option.max}`;
  }

  return '';
});

function reset() {
  modelValue.value = props.data.defaultValue;
}

defineExpose({
  reset,
});
</script>

<template>
  <div
    class="body-row flex flex-nowrap w-full items-center not-last-of-type:border-b"
  >
    <div
      class="body-cell leading-[1.5rem] px-5 pb-2 pt-2 flex flex-nowrap items-center"
    >
      {{ data.key }}
    </div>
    <div
      class="body-cell leading-[1.5rem] px-5 pb-2 pt-2 flex flex-nowrap items-center"
    >
      <div class="flex-auto w-full">
        <component
          :is="FieldComponent"
          v-bind="finalOption"
          v-model:value="modelValue"
        />
      </div>
      <div class="text-muted-foreground pl-2 flex flex-none gap-2 items-center">
        <span v-if="limitDisplay">
          {{ limitDisplay }}
        </span>
        <span v-if="data.option.step && data.option.step !== 1">
          step:{{ data.option.step }}
        </span>
      </div>
    </div>
    <div
      class="body-cell leading-[1.5rem] px-5 pb-2 pt-2 flex flex-nowrap w-full items-center"
    >
      <p
        class="line-clamp-2"
      >
        {{ data.description }}
      </p>
    </div>
  </div>
</template>
