<script setup lang="ts">
import type { SelectOption } from '@taman/types';

import { $t } from '@taman/locales';

import SwitchItem from '../switch-item.vue';
import ToggleItem from '../toggle-item.vue';

defineOptions({
  name: 'PreferenceNavigationConfig',
});

defineProps<{ disabled?: boolean; disabledNavigationSplit?: boolean }>();

const TamanNavigationStyleType = defineModel<string>('TamanNavigationStyleType');
const navigationSplit = defineModel<boolean>('navigationSplit');
const navigationAccordion = defineModel<boolean>('navigationAccordion');

const stylesItems: SelectOption[] = [
  { label: $t('preferences.rounded'), value: 'rounded' },
  { label: $t('preferences.plain'), value: 'plain' },
];
</script>

<template>
  <ToggleItem
    v-model="TamanNavigationStyleType"
    :disabled="disabled"
    :items="stylesItems"
  >
    {{ $t('preferences.navigationMenu.style') }}
  </ToggleItem>
  <SwitchItem
    v-model="navigationSplit"
    :disabled="disabledNavigationSplit || disabled"
  >
    {{ $t('preferences.navigationMenu.split') }}
    <template #tip>
      {{ $t('preferences.navigationMenu.splitTip') }}
    </template>
  </SwitchItem>
  <SwitchItem v-model="navigationAccordion" :disabled="disabled">
    {{ $t('preferences.navigationMenu.accordion') }}
  </SwitchItem>
</template>
