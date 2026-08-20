<script lang="ts" setup>
import { useTamanDrawer } from '@taman-core/popup-ui';
import { TamanButtonIcon } from '@taman-core/taman-ui';
import { loadLocaleMessages } from '@taman/locales';
import { preferences, updatePreferences } from '@taman/preferences';
import { capitalize } from '@vinicunca/perkakas';
import { computed } from 'vue';
import WidgetPreferencesDrawer from './widget-preferences-drawer.vue';

const { isFixed = false } = defineProps<{ isFixed?: boolean }>();

const emits = defineEmits<{
  clearPreferencesAndLogout: [];
}>();

const showTooltip = computed(() => {
  return !isFixed;
});

const [DrawerPreferences, drawerPreferencesApi] = useTamanDrawer({
  connectedComponent: WidgetPreferencesDrawer,
});

/**
 * Maps preferences to Vue props
 * preferences.widget.fullscreen => widgetFullscreen
 */
const attrs = computed(() => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(preferences)) {
    for (const [subKey, subValue] of Object.entries(value)) {
      result[`${key}${capitalize(subKey)}`] = subValue;
    }
  }

  return result;
});

/**
 * Maps preferences to Vue update listeners
 * preferences.widget.fullscreen => @update:widgetFullscreen
 */
const listen = computed(() => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(preferences)) {
    if (typeof value === 'object') {
      for (const subKey of Object.keys(value)) {
        result[`update:${key}${capitalize(subKey)}`] = (val: any) => {
          updatePreferences({ [key]: { [subKey]: val } });
          if (key === 'app' && subKey === 'locale') {
            loadLocaleMessages(val);
          }
        };
      }
    } else {
      result[key] = value;
    }
  }

  return result;
});
</script>

<template>
  <DrawerPreferences
    v-bind="{ ...$attrs, ...attrs }"
    v-on="listen"
  />

  <TamanButtonIcon
    :show-tooltip="showTooltip"
    :tooltip-text="$t('preferences.title')"
    icon="lucide:settings"
    @click="drawerPreferencesApi.open"
  />
</template>
