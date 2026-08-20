<script lang="ts" setup>
import { computed } from 'vue';

import { Settings } from '@vben/icons';
import { $t, loadLocaleMessages } from '@taman/locales';
import { preferences, updatePreferences } from '@taman/preferences';
import { capitalizeFirstLetter } from '@taman/utils';

import { useVbenDrawer } from '@taman-core/popup-ui';
import { VbenButton } from '@vben-core/shadcn-ui';

import PreferencesDrawer from './widget-preferences-drawer.vue';

interface Props {
  /** Whether to show the trigger button */
  showButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showButton: true,
});

const emit = defineEmits<{ clearPreferencesAndLogout: [] }>();

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: PreferencesDrawer,
});

// Expose drawer open method to parent
defineExpose({
  open: () => drawerApi.open(),
});

/**
 * Maps preferences to Vue props
 * preferences.widget.fullscreen => widgetFullscreen
 */
const attrs = computed(() => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(preferences)) {
    for (const [subKey, subValue] of Object.entries(value)) {
      result[`${key}${capitalizeFirstLetter(subKey)}`] = subValue;
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
        result[`update:${key}${capitalizeFirstLetter(subKey)}`] = (
          val: any,
        ) => {
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
  <div>
    <Drawer
      v-bind="{ ...$attrs, ...attrs }"
      v-on="listen"
      @clear-preferences-and-logout="emit('clearPreferencesAndLogout')"
    />

    <!-- Drawer trigger button (slot override) -->
    <slot>
      <VbenButton
        v-if="props.showButton"
        :title="$t('preferences.title')"
        class="flex-col-center size-10 cursor-pointer rounded-l-lg rounded-r-none border-none bg-primary"
        @click="() => drawerApi.open()"
      >
        <Settings class="size-5" />
      </VbenButton>
    </slot>
  </div>
</template>
