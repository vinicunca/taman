<script setup lang="ts">
import { SUPPORTED_LANGUAGES } from '@taman/constants';
import { $t } from '@taman/locales';
import { preferences } from '@taman/preferences';
import { getTimezoneOptions } from '@taman/utils';
import PSelectMenu from 'pohon-ui/components/SelectMenu.vue';
import { computed } from 'vue';

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

const timezoneOptions = computed(() =>
  getTimezoneOptions(preferences.app.locale),
);
</script>

<template>
  <SelectItem
    v-model="appLocale"
    :items="SUPPORTED_LANGUAGES"
  >
    {{ $t('preferences.language') }}
  </SelectItem>
  <div
    class="my-1 px-2 py-1 rounded-md flex w-full items-center justify-between hover:bg-background-accented"
  >
    <span class="text-sm flex items-center">
      {{ $t('preferences.timezone') }}
    </span>
    <PSelectMenu
      v-model="appTimezone"
      :filter-fields="['label', 'value']"
      :items="timezoneOptions"
      class="w-64"
      size="sm"
      value-key="value"
      virtualize
    />
  </div>
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
