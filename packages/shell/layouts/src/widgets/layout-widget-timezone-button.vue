<script setup lang="ts">
import { useTamanDialog } from '@taman-core/popup-ui';
import { $t } from '@taman/locales';
import { useTimezoneStore } from '@taman/stores';
import { ref, unref } from 'vue';

withDefaults(
  defineProps<{
    showButton?: boolean;
  }>(),
  { showButton: true },
);

const timezoneStore = useTimezoneStore();

const timezoneRef = ref<string | undefined>();

const timezoneOptionsRef = ref<
  Array<{
    label: string;
    value: string;
  }>
>([]);

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: async () => {
    try {
      modalApi.setState({ confirmLoading: true });
      const timezone = unref(timezoneRef);
      if (timezone) {
        await timezoneStore.setTimezone(timezone);
      }
      modalApi.close();
    } finally {
      modalApi.setState({ confirmLoading: false });
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      timezoneRef.value = unref(timezoneStore.timezone);
      timezoneOptionsRef.value = await timezoneStore.getTimezoneOptions();
    }
  },
});

function open() {
  modalApi.open();
}

defineExpose({ open });
</script>

<template>
  <div>
    <VbenIconButton
      v-if="showButton"
      :tooltip="$t('ui.widgets.timezone.setTimezone')"
      class="hover:animate-[shrink_0.3s_ease-in-out]"
      @click="open"
    >
      <TimezoneIcon class="text-foreground size-4" />
    </VbenIconButton>
    <Modal :title="$t('ui.widgets.timezone.setTimezone')">
      <div class="timezone-container">
        <RadioGroup
          v-model="timezoneRef"
          class="flex flex-col gap-2"
        >
          <div
            v-for="item in timezoneOptionsRef"
            :key="`container${item.value}`"
            class="flex gap-2 cursor-pointer items-center"
          >
            <RadioGroupItem
              :id="item.value"
              :value="item.value"
            />
            <label
              :for="item.value"
              class="cursor-pointer"
            >{{
              item.label
            }}</label>
          </div>
        </RadioGroup>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.timezone-container {
  @apply pl-5;
}
</style>
