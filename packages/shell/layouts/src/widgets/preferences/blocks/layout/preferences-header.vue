<script setup lang="ts">
import type {
  SelectOption,
  TamanLayoutHeaderMenuAlignType,
  TamanLayoutHeaderModeType,
} from '@taman/types';

import { $t } from '@taman/locales';

import PreferenceSelectItem from '../preference-select-item.vue';
import PreferencesSwitchItem from '../preferences-switch-item.vue';
import PreferencesToggleItem from '../preferences-toggle-item.vue';

const props = defineProps<{
  disabled: boolean;
}>();

const headerEnable = defineModel<boolean>('headerEnable');
const headerMode = defineModel<TamanLayoutHeaderModeType>('headerMode');
const headerMenuAlign = defineModel<TamanLayoutHeaderMenuAlignType>('headerMenuAlign');

const localeItems: Array<SelectOption> = [
  {
    label: $t('preferences.header.modeStatic'),
    value: 'static',
  },
  {
    label: $t('preferences.header.modeFixed'),
    value: 'fixed',
  },
  {
    label: $t('preferences.header.modeAuto'),
    value: 'auto',
  },
  {
    label: $t('preferences.header.modeAutoScroll'),
    value: 'auto-scroll',
  },
];

const headerMenuAlignItems: Array<SelectOption> = [
  {
    label: $t('preferences.header.menuAlignStart'),
    value: 'start',
  },
  {
    label: $t('preferences.header.menuAlignCenter'),
    value: 'center',
  },
  {
    label: $t('preferences.header.menuAlignEnd'),
    value: 'end',
  },
];
</script>

<template>
  <PreferencesSwitchItem
    v-model="headerEnable"
    :label="$t('preferences.header.visible')"
    :disabled="props.disabled"
  />

  <PreferenceSelectItem
    v-model="headerMode"
    :disabled="!headerEnable"
    :items="localeItems"
  >
    {{ $t('preferences.mode') }}
  </PreferenceSelectItem>

  <PreferencesToggleItem
    v-model="headerMenuAlign"
    :disabled="!headerEnable"
    :items="headerMenuAlignItems"
  >
    {{ $t('preferences.header.menuAlign') }}
  </PreferencesToggleItem>
</template>
