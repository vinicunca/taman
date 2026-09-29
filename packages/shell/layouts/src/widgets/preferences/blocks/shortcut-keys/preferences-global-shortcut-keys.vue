<script setup lang="ts">
import { $t } from '@taman/locales';
import { isWindowsOs } from '@taman/utils';
import PreferencesSwitchItem from '../preferences-switch-item.vue';

defineOptions({
  name: 'PreferenceGeneralConfig',
});

const shortcutKeysEnable = defineModel<boolean>('shortcutKeysEnable');
const shortcutKeysGlobalSearch = defineModel<boolean>(
  'shortcutKeysGlobalSearch',
);
const shortcutKeysLogout = defineModel<boolean>('shortcutKeysLogout');
const shortcutKeysLockScreen = defineModel<boolean>('shortcutKeysLockScreen');
const shortcutKeysEscape = defineModel<boolean>('shortcutKeysEscape');
</script>

<template>
  <PreferencesSwitchItem
    v-model="shortcutKeysEnable"
    :label="$t('preferences.shortcutKeys.title')"
  />

  <PreferencesSwitchItem
    v-model="shortcutKeysGlobalSearch"
    :disabled="!shortcutKeysEnable"
    :label="$t('preferences.shortcutKeys.search')"
    :kbds="['meta', 'K']"
  />

  <PreferencesSwitchItem
    v-model="shortcutKeysLogout"
    :disabled="!shortcutKeysEnable"
    :label="$t('preferences.shortcutKeys.logout')"
    :kbds="[isWindowsOs() ? 'alt' : 'option', 'Q']"
  />

  <PreferencesSwitchItem
    v-model="shortcutKeysLockScreen"
    :disabled="!shortcutKeysEnable"
    :label="$t('ui.widgets.lockScreen.title')"
    :kbds="[isWindowsOs() ? 'alt' : 'option', 'L']"
  />

  <PreferencesSwitchItem
    v-model="shortcutKeysEscape"
    :disabled="!shortcutKeysEnable"
    :label="$t('preferences.shortcutKeys.escape')"
    :kbds="['esc']"
  />
</template>
