<script lang="ts" setup>
import type {
  TamanButtonCheckGroupModel,
  TamanButtonCheckGroupOption,
  TamanButtonCheckGroupProps,
  TamanButtonCheckGroupValue,
} from './taman-button-check-group.types';
import PButton from 'pohon-ui/components/Button.vue';
import PFieldGroup from 'pohon-ui/components/FieldGroup.vue';
import { computed, ref } from 'vue';

import { TamanRenderContent } from '../render-content';
import {
  fromCheckGroupSelection,
  toCheckGroupSelection,
  toggleCheckGroupSelection,
} from './check-group-selection';

defineOptions({ name: 'TamanButtonCheckGroup' });

const props = withDefaults(defineProps<TamanButtonCheckGroupProps>(), {
  allowClear: false,
  disabled: false,
  maxCount: 0,
  multiple: false,
  options: () => [],
  showIcon: true,
});

const emits = defineEmits<{
  btnClick: [value: TamanButtonCheckGroupValue | undefined];
}>();

const slots = defineSlots<{
  icon?: (props: { checked: boolean; loading: boolean }) => any;
  option?: (props: {
    data: TamanButtonCheckGroupOption;
    label: TamanButtonCheckGroupOption['label'];
    value: TamanButtonCheckGroupValue;
  }) => any;
}>();

const modelValue = defineModel<TamanButtonCheckGroupModel>();

const selection = computed(
  () => toCheckGroupSelection(modelValue.value, props.multiple),
);
const loadingValues = ref<Array<TamanButtonCheckGroupValue>>([]);

/**
 * A custom `#icon` slot renders its own loading state, so PButton's
 * built-in loading icon (and its spin class) is only used without it.
 */
const hasIconSlot = computed(() => props.showIcon && Boolean(slots.icon));

function isChecked(value: TamanButtonCheckGroupValue) {
  return selection.value.includes(value);
}

function isLoading(value: TamanButtonCheckGroupValue) {
  return loadingValues.value.includes(value);
}

function isDisabled(value: TamanButtonCheckGroupValue) {
  return props.disabled
    || isLoading(value)
    || (!props.multiple && loadingValues.value.length > 0);
}

function getLeadingIcon(value: TamanButtonCheckGroupValue) {
  if (!props.showIcon || hasIconSlot.value) {
    return undefined;
  }

  return isChecked(value) ? 'lucide:circle-check-big' : 'lucide:circle';
}

async function onOptionClick(value: TamanButtonCheckGroupValue) {
  if (props.beforeChange) {
    loadingValues.value.push(value);
    try {
      const canChange = await props.beforeChange(value, !isChecked(value));
      if (canChange === false) {
        return;
      }
    } finally {
      loadingValues.value.splice(loadingValues.value.indexOf(value), 1);
    }
  }

  const next = toggleCheckGroupSelection(selection.value, value, {
    allowClear: props.allowClear,
    maxCount: props.maxCount,
    multiple: props.multiple,
  });
  modelValue.value = fromCheckGroupSelection(next, props.multiple);

  emits('btnClick', !props.multiple && next.length === 0 ? undefined : value);
}
</script>

<template>
  <PFieldGroup :size="props.size">
    <PButton
      v-for="option in props.options"
      :key="String(option.value)"
      type="button"
      color="neutral"
      variant="outline"
      active-color="primary"
      active-variant="solid"
      :active="isChecked(option.value)"
      :aria-pressed="isChecked(option.value)"
      :disabled="isDisabled(option.value)"
      :loading="!hasIconSlot && isLoading(option.value)"
      :leading-icon="getLeadingIcon(option.value)"
      @click="onOptionClick(option.value)"
    >
      <template
        v-if="hasIconSlot"
        #leading="{ ui }"
      >
        <span :class="ui.leadingIcon({ class: 'inline-flex *:size-full' })">
          <slot
            name="icon"
            :checked="isChecked(option.value)"
            :loading="isLoading(option.value)"
          />
        </span>
      </template>

      <template #default="{ ui }">
        <span :class="ui.label()">
          <slot
            name="option"
            :data="option"
            :label="option.label"
            :value="option.value"
          >
            <TamanRenderContent :content="option.label" />
          </slot>
        </span>
      </template>
    </PButton>
  </PFieldGroup>
</template>
