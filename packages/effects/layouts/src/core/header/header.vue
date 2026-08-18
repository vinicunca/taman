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

const emit = defineEmits<{
  clearPreferencesAndLogout: [];
}>();

const REFERENCE_VALUE = 100;

const {
  preferencesButtonPosition,
  globalLockScreenShortcutKey,
  globalLogoutShortcutKey,
} = usePreferences();
const slots = useSlots();
const { refresh } = useRefresh();

const showLockInHeader = computed(
  () =>
    preferences.widget.lockScreen
    && preferences.widget.lockScreenButtonPosition === 'header',
);

const showLogoutInHeader = computed(
  () => preferences.widget.logoutButtonPosition === 'header',
);

const enableLockScreenShortcutKey = computed(() => {
  return showLockInHeader.value && globalLockScreenShortcutKey.value;
});

const enableLogoutShortcutKey = computed(() => {
  return showLogoutInHeader.value && globalLogoutShortcutKey.value;
});

// const [LockModal, lockModalApi] = useVbenModal({
//   connectedComponent: LockScreenModal,
// });
// const [LogoutModal, logoutModalApi] = useVbenModal({
//   onConfirm() {
//     handleSubmitLogout();
//   },
// });

// function handleOpenLock() {
//   lockModalApi.open();
// }

// function handleSubmitLock(lockScreenPassword: string) {
//   lockModalApi.close();
//   accessStore.lockScreen(lockScreenPassword);
// }

// function handleLogout() {
//   logoutModalApi.open();
// }

// function handleSubmitLogout() {
//   emit('logout');
//   logoutModalApi.close();
// }

// if (preferences.shortcutKeys.enable) {
//   const keys = useMagicKeys();
//   const lockKey = keys['Alt+KeyL'];
//   const logoutKey = keys['Alt+KeyQ'];

//   if (lockKey) {
//     whenever(lockKey, () => {
//       if (enableLockScreenShortcutKey.value) {
//         handleOpenLock();
//       }
//     });
//   }

//   if (logoutKey) {
//     whenever(logoutKey, () => {
//       if (enableLogoutShortcutKey.value) {
//         handleLogout();
//       }
//     });
//   }
// }

/**
 * Slot list item type
 */
interface SlotItem {
  index: number;
  name: string;
}
type WidgetCheck = Record<string, {
  slotName: string;
  visible: boolean;
}>;

const rightSlots = computed(() => {
  const list: Array<SlotItem> = [];

  // Iterate in the order of widget.order and check if each widget should be displayed in the header.
  const widgetChecks: WidgetCheck = {
    globalSearch: {
      visible:
        preferences.widget.globalSearch
        && preferences.widget.globalSearchButtonPosition === 'header',
      slotName: 'global-search',
    },
    preferences: {
      visible: preferencesButtonPosition.value.header,
      slotName: 'preferences',
    },
    themeToggle: {
      visible:
        preferences.widget.themeToggle
        && preferences.widget.themeToggleButtonPosition === 'header',
      slotName: 'theme-toggle',
    },
    languageToggle: {
      visible:
        preferences.widget.languageToggle
        && preferences.widget.languageToggleButtonPosition === 'header',
      slotName: 'language-toggle',
    },
    timezone: {
      visible:
        preferences.widget.timezone
        && preferences.widget.timezoneButtonPosition === 'header',
      slotName: 'timezone',
    },
    fullscreen: {
      visible:
        preferences.widget.fullscreen
        && preferences.widget.fullscreenButtonPosition === 'header',
      slotName: 'fullscreen',
    },
    refresh: {
      visible:
        preferences.widget.refresh
        && preferences.widget.refreshButtonPosition === 'header',
      slotName: 'refresh',
    },
    notification: {
      visible:
        preferences.widget.notification
        && preferences.widget.notificationButtonPosition === 'header',
      slotName: 'notification',
    },
    lockScreenButton: {
      visible:
        preferences.widget.lockScreen
        && preferences.widget.lockScreenButtonPosition === 'header',
      slotName: 'lock-screen-btn',
    },
    logoutButton: {
      visible: preferences.widget.logoutButtonPosition === 'header',
      slotName: 'logout-btn',
    },
  };

  console.log('🚀 ~ preferences.widget.order:', preferences.widget.order);
  for (const key of preferences.widget.order) {
    const check = widgetChecks[key];
    if (check?.visible) {
      list.push({
        index: REFERENCE_VALUE + list.length,
        name: check.slotName,
      });
    }
  }

  // Object.keys(slots).forEach((key) => {
  //   // Match slot names, e.g. first slot: header-right-1
  //   if (key.startsWith('header-right')) {
  //     // Use the third segment as index; if not numeric, assign the next index
  //     const slotIndex = Number(key.split('-')[2]);
  //     const index = Number.isNaN(slotIndex) ? nextIndex(list) : slotIndex;
  //     list.push({ index, name: key });
  //   }
  // });

  // Append the user dropdown; if the index exceeds 1000, cap it at 1000 (to accommodate scenarios where the user button is not at the end).
  const userDropdownIndex = Math.min(1000, nextIndex(list));
  list.push({ index: userDropdownIndex, name: 'user-dropdown' });
  console.log('🚀 ~ list:', list);

  return list.toSorted((a, b) => a.index - b.index);
});

const leftSlots = computed(() => {
  const list: Array<SlotItem> = [];

  Object.keys(slots).forEach((key) => {
    // Match slot names, e.g. first slot: header-left-1
    if (key.startsWith('header-left')) {
      // Use the third segment as index; if not numeric, assign the next index
      const slotIndex = Number(key.split('-')[2]);
      const index = Number.isNaN(slotIndex) ? nextIndex(list) : slotIndex;
      list.push({ index, name: key });
    }
  });
  // Sort by index to ensure slot order
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
          class="mr-1 pohon:rounded-full"
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
