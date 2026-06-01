<script lang="ts" setup>
import { TamanFallback } from '@taman/common-ui';
</script>

<template>
  <TamanFallback
    :description="`当前路由：${String($route.name)}，子菜单不可见`"
    status="coming-soon"
    title="隐藏子菜单"
  >
    <template #action>
      <RouterLink to="/demos/features/hide-menu-children/children">
        打开子路由
      </RouterLink>
    </template>
  </TamanFallback>
</template>
