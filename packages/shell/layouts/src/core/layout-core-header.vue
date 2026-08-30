<script lang="ts" setup>
import { tamanConfirm, useTamanDialog } from '@taman-core/popup-ui';
import { TamanButtonIcon, TamanFullScreen } from '@taman-core/taman-ui';
import { useRefresh } from '@taman/composables';
import { $t } from '@taman/locales';
import { preferences, usePreferences } from '@taman/preferences';
import { useAccessStore } from '@taman/stores';
import { computed, useSlots } from 'vue';

import {
  LayoutWidgetGlobalSearch,
  LayoutWidgetLanguageToggle,
  LayoutWidgetLockScreenModal,
  LayoutWidgetNotification,
  LayoutWidgetPreferences,
  LayoutWidgetThemeToggle,
  LayoutWidgetTimezoneButton,
} from '../widgets';

defineOptions({
  name: 'LayoutCoreHeader',
});

withDefaults(
  defineProps<{
    avatar?: string;
    theme?: string;
    text?: string;
  }>(),
  {
    avatar: '',
    theme: 'light',
    text: '',
  },
);

const emits = defineEmits<{
  clearPreferencesAndLogout: [];
  logout: [];
  openLockScreen: [];
}>();

const REFERENCE_VALUE = 100;

const accessStore = useAccessStore();
const {
  globalLockScreenShortcutKey,
  globalLogoutShortcutKey,
  globalSearchShortcutKey,
  preferencesButtonPosition,
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

const [LockModal, lockModalApi] = useTamanDialog({
  connectedComponent: LayoutWidgetLockScreenModal,
});
const [LogoutModal, logoutModalApi] = useTamanDialog({
  onConfirm() {
    handleSubmitLogout();
  },
});

function handleOpenLock() {
  lockModalApi.open();
}

function handleSubmitLock(lockScreenPassword: string) {
  lockModalApi.close();
  accessStore.lockScreen(lockScreenPassword);
}

function handleLogout() {
  logoutModalApi.open();
}

function handleSubmitLogout() {
  emits('logout');
  logoutModalApi.close();
}

// 快捷键
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
 * Slot list type
 */
interface SlotItem { index: number; name: string }

const rightSlots = computed(() => {
  const list: Array<SlotItem> = [];

  // Iterate through the widgets in the order specified by `widget.order` and check whether each widget should be displayed in the header.
  const widgetChecks: Record<
    string,
    {
      slotName: string;
      visible: boolean;
    }
  > = {
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
      slotName: 'lock-screen-button',
    },
    logoutButton: {
      visible: preferences.widget.logoutButtonPosition === 'header',
      slotName: 'logout-button',
    },
  };

  for (const key of preferences.widget.order) {
    const check = widgetChecks[key];

    if (check?.visible) {
      list.push({
        index: REFERENCE_VALUE + list.length,
        name: check.slotName,
      });
    }
  }

  // Add user slots (header-right-N) at the end
  Object.keys(slots).forEach((key) => {
    if (key.startsWith('header-right')) {
      const slotIndex = Number(key.split('-')[2]);
      const index = Number.isNaN(slotIndex) ? nextIndex(list) : slotIndex;
      list.push({ index, name: key });
    }
  });
  // Add the user dropdown at the end. If the index value exceeds 1000, it is fixed at 1000 (to accommodate the scenario where the user button is not at the end).
  const userDropdownIndex = Math.min(1000, nextIndex(list));
  list.push({ index: userDropdownIndex, name: 'user-dropdown' });
  // Sort by index to ensure the slot order
  return list.toSorted((a, b) => a.index - b.index);
});

const leftSlots = computed(() => {
  const list: Array<SlotItem> = [];

  Object.keys(slots).forEach((key) => {
    // Adapt the slot name, for example the first slot name: header-left-1
    if (key.startsWith('header-left')) {
      // Get the third placeholder number. If the third placeholder is not a number, the sort index is automatically assigned.
      const slotIndex = Number(key.split('-')[2]);
      const index = Number.isNaN(slotIndex) ? nextIndex(list) : slotIndex;
      list.push({ index, name: key });
    }
  });
  // Sort by index to ensure the slot order
  return list.toSorted((a, b) => a.index - b.index);
});

/**
 * Get the next index value in the list (for sorting)
 * @param list The list to get the next index value from
 */
function nextIndex(list: Array<SlotItem>) {
  const index
    = list.length > 0 ? Math.max(...list.map((item) => item.index)) : 0;
  return index + 1;
}

function clearPreferencesAndLogout() {
  emits('clearPreferencesAndLogout');
}
</script>

<template>
  <LockModal
    v-if="showLockInHeader"
    :avatar="avatar"
    :text="text"
    @submit="handleSubmitLock"
  />

  <LogoutModal
    v-if="showLogoutInHeader"
    :cancel-text="$t('common.cancel')"
    :confirm-text="$t('common.confirm')"
    :fullscreen-button="false"
    :title="$t('common.prompt')"
    centered
    content-class="px-8 min-h-10"
    footer-class="border-none mb-3 mr-3"
    header-class="border-none"
  >
    {{ $t('ui.widgets.logoutTip') }}
  </LogoutModal>

  <template
    v-for="slot in leftSlots.filter((item) => item.index < REFERENCE_VALUE)"
    :key="slot.name"
  >
    <slot :name="slot.name">
      <template v-if="slot.name === 'refresh'">
        <TamanButtonIcon
          icon="lucide:rotate-cw"
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

  <div class="pr-4 flex shrink-0 gap-1 h-full min-w-0 items-center">
    <template
      v-for="slot in rightSlots"
      :key="slot.name"
    >
      <slot :name="slot.name">
        <template v-if="slot.name === 'global-search'">
          <LayoutWidgetGlobalSearch
            :enable-shortcut-key="globalSearchShortcutKey"
            :menus="accessStore.accessMenus"
            class="mr-1 sm:mr-4"
          />
        </template>

        <template v-else-if="slot.name === 'preferences'">
          <LayoutWidgetPreferences @clear-preferences-and-logout="clearPreferencesAndLogout" />
        </template>

        <template v-else-if="slot.name === 'theme-toggle'">
          <LayoutWidgetThemeToggle />
        </template>

        <template v-else-if="slot.name === 'language-toggle'">
          <LayoutWidgetLanguageToggle />
        </template>

        <template v-else-if="slot.name === 'fullscreen'">
          <TamanFullScreen />
        </template>

        <template v-else-if="slot.name === 'timezone'">
          <LayoutWidgetTimezoneButton />
        </template>

        <template v-else-if="slot.name === 'lock-screen-button'">
          <TamanButtonIcon
            :tooltip-text="$t('ui.widgets.lockScreen.title')"
            icon="lucide:lock-keyhole"
            @click="handleOpenLock"
          />
        </template>

        <template v-else-if="slot.name === 'logout-button'">
          <TamanButtonIcon
            class="mr-1"
            :tooltip-text="$t('common.logout')"
            icon="lucide:log-out"
            @click="handleLogout"
          />
        </template>

        <!-- <template v-else-if="slot.name === 'notification'">
          <LayoutWidgetNotification />
        </template> -->

        <template v-else-if="slot.name === 'refresh'">
          <TamanButtonIcon
            icon="lucide:rotate-cw"
            @click="refresh"
          />
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
