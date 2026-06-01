<script lang="ts" setup>
import { TamanFallback } from '@taman/common-ui';
import { useRouter } from 'vue-router';

const router = useRouter();

function details() {
  router.push({ name: 'BreadcrumbLateralDetailDemo' });
}
</script>

<template>
  <TamanFallback
    description="点击查看详情，并观察面包屑导航变化"
    status="coming-soon"
    title="面包屑导航-平级模式"
  >
    <template #action>
      <Button
        type="primary"
        @click="details"
      >
        点击查看详情
      </Button>
    </template>
  </TamanFallback>
</template>
