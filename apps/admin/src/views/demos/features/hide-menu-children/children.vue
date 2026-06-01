<script lang="ts" setup>
import { TamanFallback, VbenButton } from '@taman/common-ui';
import { useTabs } from '@taman/composables';
import { X } from '@taman/icons';

const { closeCurrentTab } = useTabs();
</script>

<template>
  <TamanFallback
    description="当前路由在菜单中不可见"
    status="coming-soon"
    title="被隐藏的子菜单"
    show-back
  >
    <template #action>
      <VbenButton size="lg" @click="closeCurrentTab()">
        <X class="mr-2 size-4" />
        关闭当前标签页
      </VbenButton>
    </template>
  </TamanFallback>
</template>
