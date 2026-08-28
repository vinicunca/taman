<script lang="ts" setup>
import type { DropdownMenuItem } from 'pohon-ui';
import {
  LayoutCore,
  // LockScreen,
  // UserDropdown,
} from '@taman/layouts';
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
      <UserDropdown
        :avatar="user?.image"
        :name="user?.name"
        :description="user?.email"
        :menus="menus"
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
