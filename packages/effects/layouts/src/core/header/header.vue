<script lang="ts" setup>
import { TamanFullScreen } from '@taman-core/taman-ui';
import { useRefresh } from '@taman/composables';
import { preferences, usePreferences } from '@taman/preferences';
import { computed, useSlots } from 'vue';
import {
  LanguageToggle,
  PreferencesWidget,
  ThemeToggle,
} from '../../widgets';

interface Props {
  /**
   * Logo theme
   */
  theme?: string;
}

defineOptions({
  name: 'LayoutHeader',
});

withDefaults(
  defineProps<Props>(),
  {
    theme: 'light',
  },
);

const emit = defineEmits<{ clearPreferencesAndLogout: [] }>();

const REFERENCE_VALUE = 100;

const { preferencesButtonPosition } = usePreferences();
const slots = useSlots();
const { refresh } = useRefresh();

/**
 * Slot list item type
 */
interface SlotItem { index: number; name: string }

const rightSlots = computed(() => {
  const list: Array<SlotItem> = [];
  // Global search
  if (preferences.widget.globalSearch) {
    list.push({
      index: REFERENCE_VALUE,
      name: 'global-search',
    });
  }
  // Preferences shortcut widgets
  if (preferencesButtonPosition.value.header) {
    list.push({
      index: REFERENCE_VALUE + 10,
      name: 'preferences',
    });
    // Group preference sub-widgets under the same button slot ordering
    if (preferences.widget.themeToggle) {
      list.push({
        index: REFERENCE_VALUE + 20,
        name: 'theme-toggle',
      });
    }
    if (preferences.widget.languageToggle) {
      list.push({
        index: REFERENCE_VALUE + 30,
        name: 'language-toggle',
      });
    }
    if (preferences.widget.timezone) {
      list.push({
        index: REFERENCE_VALUE + 40,
        name: 'timezone',
      });
    }
  }
  // Fullscreen
  if (preferences.widget.fullscreen) {
    list.push({
      index: REFERENCE_VALUE + 50,
      name: 'fullscreen',
    });
  }
  // Notifications
  if (preferences.widget.notification) {
    list.push({
      index: REFERENCE_VALUE + 60,
      name: 'notification',
    });
  }

  Object.keys(slots).forEach((key) => {
    // Match slot names, e.g. first slot: header-right-1
    if (key.startsWith('header-right')) {
      // Use the third segment as index; if not numeric, assign the next index
      const slotIndex = Number(key.split('-')[2]);
      const index = Number.isNaN(slotIndex) ? nextIndex(list) : slotIndex;
      list.push({ index, name: key });
    }
  });
  // Append user dropdown last; cap index at 1000 when it would exceed (user button not last)
  const userDropdownIndex = Math.min(1000, nextIndex(list));
  list.push({ index: userDropdownIndex, name: 'user-dropdown' });
  // Sort by index to preserve slot order
  return list.toSorted((a, b) => a.index - b.index);
});

const leftSlots = computed(() => {
  const list: Array<SlotItem> = [];
  // Refresh
  if (preferences.widget.refresh) {
    list.push({
      index: 0,
      name: 'refresh',
    });
  }

  Object.keys(slots).forEach((key) => {
    // Match slot names, e.g. first slot: header-left-1
    if (key.startsWith('header-left')) {
      // Use the third segment as index; if not numeric, assign the next index
      const slotIndex = Number(key.split('-')[2]);
      const index = Number.isNaN(slotIndex) ? nextIndex(list) : slotIndex;
      list.push({ index, name: key });
    }
  });
  // Sort by index to preserve slot order
  return list.toSorted((a, b) => a.index - b.index);
});

/**
 * Returns the next sort index for the slot list
 * @param list Slot list
 */
function nextIndex(list: Array<SlotItem>) {
  const index
    = list.length > 0 ? Math.max(...list.map((item) => item.index)) : 0;
  return index + 1;
}

function clearPreferencesAndLogout() {
  emit('clearPreferencesAndLogout');
}
</script>

<template>
  <template
    v-for="slot in leftSlots.filter((item) => item.index < REFERENCE_VALUE)"
    :key="slot.name"
  >
    <slot :name="slot.name">
      <template v-if="slot.name === 'refresh'">
        <PButton
          icon="lucide:rotate-cw"
          size="sm"
          variant="ghost"
          color="neutral"
          class="mr-1"
          @click="refresh"
        />
      </template>
    </slot>
  </template>

  <div class="flex-center hidden lg:block">
    <slot name="breadcrumb" />
  </div>

  <template
    v-for="slot in leftSlots.filter((item) => item.index > REFERENCE_VALUE)"
    :key="slot.name"
  >
    <slot :name="slot.name" />
  </template>

  <div
    :class="`menu-align-${preferences.header.menuAlign}`"
    class="flex flex-1 h-full min-w-0 items-center"
  >
    <slot name="menu" />
  </div>

  <div class="px-4 flex shrink-0 gap-1.5 h-full min-w-0 items-center">
    <template
      v-for="slot in rightSlots"
      :key="slot.name"
    >
      <slot :name="slot.name">
        <template v-if="slot.name === 'global-search'">
          <!-- TODO: add global search -->
        </template>

        <template v-else-if="slot.name === 'preferences'">
          <PreferencesWidget
            @clear-preferences-and-logout="clearPreferencesAndLogout"
          />
        </template>

        <template v-else-if="slot.name === 'theme-toggle'">
          <ThemeToggle />
        </template>

        <template v-else-if="slot.name === 'language-toggle'">
          <LanguageToggle />
        </template>

        <template v-else-if="slot.name === 'timezone'">
          <!-- TODO: add timezone toggle -->
        </template>

        <template v-else-if="slot.name === 'fullscreen'">
          <TamanFullScreen />
        </template>
      </slot>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.menu-align-start {
  --menu-align: start;
}

.menu-align-center {
  --menu-align: center;
}

.menu-align-end {
  --menu-align: end;
}
</style>
