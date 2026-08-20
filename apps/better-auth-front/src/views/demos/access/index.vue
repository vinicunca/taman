<script lang="ts" setup>
import type { Recordable } from '@taman/types';

import { useAccess } from '@taman/access';
import { Page } from '@taman/common-ui';
import { resetAllStores, useUserStore } from '@taman/stores';
import { useRouter } from 'vue-router';

import { useSessionStore } from '#/auth';

const accounts: Record<string, Recordable<any>> = {
  admin: {
    password: '123456',
    username: 'admin',
  },
  super: {
    password: '123456',
    username: 'vben',
  },
  user: {
    password: '123456',
    username: 'jack',
  },
};

const { accessMode, toggleAccessMode } = useAccess();
const userStore = useUserStore();
const sessionStore = useSessionStore();
const router = useRouter();

function roleButtonType(role: string) {
  return userStore.userRoles.includes(role) ? 'primary' : 'default';
}

async function changeAccount(role: string) {
  if (userStore.userRoles.includes(role)) {
    return;
  }

  const account = accounts[role];
  resetAllStores();
  if (account) {
    await sessionStore.signInWithEmail(account, async () => {
      router.go(0);
    });
  }
}

async function handleToggleAccessMode() {
  if (!accounts.super) {
    return;
  }
  await toggleAccessMode();
  resetAllStores();

  await sessionStore.signInWithEmail(accounts.super, async () => {
    setTimeout(() => {
      router.go(0);
    }, 150);
  });
}
</script>

<template>
  <div
    :title="`${accessMode === 'frontend' ? '前端' : '后端'}页面访问权限演示`"
    description="切换不同的账号，观察左侧菜单变化。"
  >
    <div
      class="mb-5"
      title="权限模式"
    >
      <span class="font-semibold">当前权限模式:</span>
      <span class="text-primary mx-4">{{
        accessMode === 'frontend' ? '前端权限控制' : '后端权限控制'
      }}</span>
      <div
        type="primary"
        @click="handleToggleAccessMode"
      >
        切换为{{ accessMode === 'frontend' ? '后端' : '前端' }}权限模式
      </div>
    </div>
    <div title="账号切换">
      <div
        :type="roleButtonType('super')"
        @click="changeAccount('super')"
      >
        切换为 Super 账号
      </div>

      <div
        :type="roleButtonType('admin')"
        class="mx-4"
        @click="changeAccount('admin')"
      >
        切换为 Admin 账号
      </div>
      <div
        :type="roleButtonType('user')"
        @click="changeAccount('user')"
      >
        切换为 User 账号
      </div>
    </div>
  </div>
</template>
