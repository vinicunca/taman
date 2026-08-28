<script setup lang="ts">
import { SUPPORTED_LANGUAGES } from '@taman/constants';
import { useTimezoneStore } from '@taman/stores';
import { $t } from '@taman/locales';
import { onMounted, ref, unref } from 'vue';

import InputItem from '../input-item.vue';
import SelectItem from '../select-item.vue';
import SwitchItem from '../switch-item.vue';

defineOptions({
  name: 'PreferenceGeneralConfig',
});

const appLocale = defineModel<string>('appLocale');
const appTimezone = defineModel<string>('appTimezone');
const appDynamicTitle = defineModel<boolean>('appDynamicTitle');
const appWatermark = defineModel<boolean>('appWatermark');
const appWatermarkContent = defineModel<string>('appWatermarkContent');
const appEnableCheckUpdates = defineModel<boolean>('appEnableCheckUpdates');
const appEnableCopyPreferences = defineModel<boolean>(
  'appEnableCopyPreferences',
);
const timezoneStore = useTimezoneStore();

const TamanTimezoneOptionsRef = ref<
  Array<{
    label: string;
    value: string;
  }>
>([]);

onMounted(async () => {
  TamanTimezoneOptionsRef.value = await timezoneStore.getTamanTimezoneOptions();
  // Apply current timezone, e.g. Asia/Shanghai
  const timezoneValue = unref(timezoneStore.timezone);
  if (timezoneValue) {
    appTimezone.value = timezoneValue;
  }
});
</script>

<template>
  <SelectItem
    v-model="appLocale"
    :items="SUPPORTED_LANGUAGES"
  >
    {{ $t('preferences.language') }}
  </SelectItem>
  <SelectItem
    v-model="appTimezone"
    :items="TamanTimezoneOptionsRef"
  >
    {{ $t('preferences.timezone') }}
  </SelectItem>
  <SwitchItem v-model="appDynamicTitle">
    {{ $t('preferences.dynamicTitle') }}
  </SwitchItem>
  <SwitchItem
    v-model="appWatermark"
    @update:model-value="
      (val) => {
        if (!val) appWatermarkContent = '';
      }
    "
  >
    {{ $t('preferences.watermark') }}
  </SwitchItem>
  <InputItem
    v-if="appWatermark"
    v-model="appWatermarkContent"
    :placeholder="$t('preferences.watermarkContent')"
  >
    {{ $t('preferences.watermarkContent') }}
  </InputItem>
  <SwitchItem v-model="appEnableCheckUpdates">
    {{ $t('preferences.checkUpdates') }}
  </SwitchItem>
  <SwitchItem v-model="appEnableCopyPreferences">
    {{ $t('preferences.enableCopyPreferences') }}
  </SwitchItem>
</template>
