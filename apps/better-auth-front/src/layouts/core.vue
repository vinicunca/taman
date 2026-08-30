<script lang="ts" setup>
import type { DropdownMenuItem } from 'pohon-ui';
import { TAMAN_DOC_URL, TAMAN_GITHUB_URL } from '@taman/constants';
import {
  LayoutCore,
  // LockScreen,
  LayoutWidgetUserDropdown,
} from '@taman/layouts';
import { $t } from '@taman/locales';
import { useTabbarStore } from '@taman/stores';
import { computed } from 'vue';
import { useSessionStore } from '#/auth';

const { setMenuList } = useTabbarStore();
setMenuList([
  'close',
  'affix',
  'maximize',
  'reload',
  'open-in-new-window',
  'close-left',
  'close-right',
  'close-other',
  'close-all',
]);

const sessionStore = useSessionStore();
const { user } = useSessionStore();

const menus = computed<Array<DropdownMenuItem>>(() => [
  {
    label: $t('page.auth.profile'),
    icon: 'lucide:user',
    to: '/profile',
  },
  {
    label: $t('ui.widgets.document'),
    icon: 'lucide:book-open-text',
    href: TAMAN_DOC_URL,
  },
  {
    label: 'GitHub',
    icon: 'logos:github-icon',
    href: TAMAN_GITHUB_URL,
  },
  {
    label: $t('ui.widgets.qa'),
    icon: 'lucide:circle-help',
    href: `${TAMAN_GITHUB_URL}/issues`,
  },
]);

async function handleLogout() {
  await sessionStore.logout();
}
</script>

<template>
  <LayoutCore
    @clear-preferences-and-logout="handleLogout"
  >
    <template #user-dropdown>
      <LayoutWidgetUserDropdown
        :avatar="user?.image"
        :name="user?.name"
        :description="user?.email"
        :menus="menus"
        badge="Pro"
        @logout="handleLogout"
        @clear-preferences-and-logout="handleLogout"
      />
    </template>

    <template #notification>
      <!-- TODO: Implement notification -->
    </template>

    <template #extra>
      <!-- TODO: Implement extra, e.g. login expired -->
    </template>

    <template #lock-screen>
      <LockScreen
        @to-login="handleLogout"
      />
    </template>
  </LayoutCore>
</template>
