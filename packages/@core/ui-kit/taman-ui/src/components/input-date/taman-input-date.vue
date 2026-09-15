<script setup lang="ts" generic="R extends boolean = false">
import type { CalendarDate, CalendarDateTime, ZonedDateTime } from '@internationalized/date';
import type { TamanInputDateProps } from './taman-input-date.types';
import { useForwardProps, useSimpleLocale } from '@taman-core/composables';
import { reactiveOmit } from '@vueuse/core';
import { useDateFormatter } from 'akar';
import PCalendar from 'pohon-ui/components/Calendar.vue';
import PInput from 'pohon-ui/components/Input.vue';
import PInputDate from 'pohon-ui/components/InputDate.vue';
import PPopover from 'pohon-ui/components/Popover.vue';
import { computed, ref, watch } from 'vue';

import { formatCalendarInputValue, isCalendarInputComplete } from './format-calendar-input-value';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<TamanInputDateProps<R>>(),
  {
    type: 'date',
  },
);
type DateValue = CalendarDate | CalendarDateTime | ZonedDateTime;
interface DateRange { start: DateValue | undefined; end: DateValue | undefined }

type InputDateModelValue<R> = (R extends true ? DateRange : DateValue) | undefined;

const modelValue = defineModel<InputDateModelValue<R>>();
const { currentLocale } = useSimpleLocale();
const locale = computed(() => props.locale ?? currentLocale.value);
const formatter = useDateFormatter(locale.value);

watch(locale, (next) => {
  formatter.setLocale(next);
});

const inputProps = useForwardProps(
  reactiveOmit(props, 'modelValue', 'type'),
);

const inputRef = ref();
const isOpen = ref(false);

const inputValue = computed(() => {
  return formatCalendarInputValue(modelValue.value, (date) => {
    if (props.type === 'year') {
      return formatter.fullYear(date);
    }

    return formatter.fullMonthAndYear(date);
  });
});

watch(
  modelValue,
  (value) => {
    if (isCalendarInputComplete(value)) {
      isOpen.value = false;
    }
  },
  { deep: true },
);
</script>

<template>
  <div
    ref="inputRef"
    class="w-full"
    @click="isOpen = true"
  >
    <PInputDate
      v-if="props.type === 'date'"
      v-model="modelValue"
      v-bind="inputProps"
      trailing-icon="lucide:calendar"
    />

    <PInput
      v-else
      v-bind="inputProps"
      :model-value="inputValue"
      readonly
      trailing-icon="lucide:calendar"
    />
  </div>

  <PPopover
    v-model:open="isOpen"
    :reference="inputRef"
  >
    <template #content>
      <PCalendar
        v-model="modelValue"
        :range="props.range"
        class="p-2"
        :type="props.type"
      />
    </template>
  </PPopover>
</template>
