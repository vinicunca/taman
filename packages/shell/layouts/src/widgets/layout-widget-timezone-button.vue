<script setup lang="ts">
import { preferences, updatePreferences } from '@vinicunca/taman-core/preferences';
import { TamanButtonIcon } from '@vinicunca/taman-ui';
import { useTamanDialog } from '@vinicunca/taman-ui/popup';
import PSelectMenu from 'pohon-ui/components/SelectMenu.vue';
import { computed, ref, unref } from 'vue';
import { $t } from '@taman/locales';
import { getTimezoneOptions } from '@taman/utils';

const props = withDefaults(
  defineProps<{
    showButton?: boolean;
  }>(),
  { showButton: true },
);

const timezoneRef = ref<string | undefined>();
const timezoneOptions = computed(() =>
  getTimezoneOptions(preferences.app.locale),
);

const [DialogTimezone, dialogTimezoneApi] = useTamanDialog({
  fullscreenButton: false,
  onConfirm: async () => {
    try {
      dialogTimezoneApi.setState({ confirmLoading: true });
      const timezone = unref(timezoneRef);
      if (timezone) {
        updatePreferences({
          app: { timezone },
        });
      }
      dialogTimezoneApi.close();
    } finally {
      dialogTimezoneApi.setState({ confirmLoading: false });
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      timezoneRef.value = preferences.app.timezone;
    }
  },
});

function open() {
  dialogTimezoneApi.open();
}

defineExpose({ open });
</script>

<template>
  <TamanButtonIcon
    v-if="props.showButton"
    :tooltip-text="$t('ui.widgets.timezone.setTimezone')"
    icon="fluent-mdl2:world-clock"
    @click="open"
  />

  <DialogTimezone :title="$t('ui.widgets.timezone.setTimezone')">
    <PSelectMenu
      v-model="timezoneRef"
      :filter-fields="['label', 'value']"
      :items="timezoneOptions"
      class="w-full"
      value-key="value"
      virtualize
    />
  </DialogTimezone>
</template>
