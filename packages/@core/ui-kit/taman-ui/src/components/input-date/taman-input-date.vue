<script setup lang="ts" generic="R extends boolean = false">
import type { CalendarDate, CalendarDateTime, ZonedDateTime } from '@internationalized/date';
import type { CalendarProps, InputDateProps } from 'pohon-ui';
import { useForwardProps } from '@taman-core/composables';
import { reactiveOmit } from '@vueuse/core';
import PCalendar from 'pohon-ui/components/Calendar.vue';
import PInputDate from 'pohon-ui/components/InputDate.vue';
import PPopover from 'pohon-ui/components/Popover.vue';
import { ref } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<InputDateProps<R> & {
    type?: CalendarProps['type'];
  }>(),
  {
    type: 'date',
  },
);
type DateValue = CalendarDate | CalendarDateTime | ZonedDateTime;
interface DateRange { start: DateValue | undefined; end: DateValue | undefined }

type InputDateModelValue<R> = (R extends true ? DateRange : DateValue) | undefined;

const modelValue = defineModel<InputDateModelValue<R>>();

const inputProps = useForwardProps(
  reactiveOmit(props, 'modelValue', 'type'),
);

const inputRef = ref();

const isOpen = ref(false);
</script>

<template>
  <div
    ref="inputRef"
    class="w-full"
    @click="isOpen = true"
  >
    <PInputDate
      v-model="modelValue"
      v-bind="inputProps"
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
        class="p-2"
        :type="props.type"
      />
    </template>
  </PPopover>
</template>
