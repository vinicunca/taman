<script lang="ts" setup>
import type { TamanLayoutType } from '@taman/types';
import { $t } from '@taman/locales';
import { onMounted, ref } from 'vue';
import PreferencesSwitchItem from '../preferences-switch-item.vue';

const props = defineProps<{
  currentLayout?: TamanLayoutType;
  disabled: boolean;
}>();

const sidebarAutoActivateChild = defineModel<boolean>('sidebarAutoActivateChild');
const sidebarDraggable = defineModel<boolean>('sidebarDraggable');
const sidebarCollapsed = defineModel<boolean>('sidebarCollapsed');
const sidebarCollapsedShowTitle = defineModel<boolean>('sidebarCollapsedShowTitle');
const sidebarEnable = defineModel<boolean>('sidebarEnable');
const sidebarExpandOnHover = defineModel<boolean>('sidebarExpandOnHover');
const sidebarWidth = defineModel<number>('sidebarWidth');
const sidebarCollapsedButton = defineModel<boolean>('sidebarCollapsedButton');
const sidebarFixedButton = defineModel<boolean>('sidebarFixedButton');

const sidebarButtons = ref<Array<string>>([]);

onMounted(() => {
  if (
    sidebarCollapsedButton.value
    && !sidebarButtons.value.includes('collapsed')
  ) {
    sidebarButtons.value.push('collapsed');
  }

  if (sidebarFixedButton.value && !sidebarButtons.value.includes('fixed')) {
    sidebarButtons.value.push('fixed');
  }
});
</script>

<template>
  <PreferencesSwitchItem
    v-model="sidebarEnable"
    :disabled="props.disabled"
    :label="$t('preferences.sidebar.visible')"
  />

  <PreferencesSwitchItem
    v-model="sidebarDraggable"
    :disabled="!sidebarEnable || props.disabled"
    :label="$t('preferences.sidebar.draggable')"
  />

  <PreferencesSwitchItem
    v-model="sidebarCollapsed"
    :disabled="!sidebarEnable || props.disabled"
    :label="$t('preferences.sidebar.collapsed')"
  >
    {{ $t('preferences.sidebar.collapsed') }}
  </PreferencesSwitchItem>

  <PreferencesSwitchItem
    v-model="sidebarExpandOnHover"
    :disabled="!sidebarEnable || props.disabled || !sidebarCollapsed"
    :tip="$t('preferences.sidebar.expandOnHoverTip')"
    :label="$t('preferences.sidebar.expandOnHover')"
  />

  <PreferencesSwitchItem
    v-model="sidebarCollapsedShowTitle"
    :disabled="!sidebarEnable || props.disabled || !sidebarCollapsed"
    :label="$t('preferences.sidebar.collapsedShowTitle')"
  />

  <PreferencesSwitchItem
    v-model="sidebarAutoActivateChild"
    :disabled="
      !sidebarEnable
        || !['sidebar-mixed-nav', 'mixed-nav', 'header-mixed-nav'].includes(
          currentLayout as string,
        )
        || props.disabled
    "
    :tip="$t('preferences.sidebar.autoActivateChildTip')"
    :label="$t('preferences.sidebar.autoActivateChild')"
  />
</template>
