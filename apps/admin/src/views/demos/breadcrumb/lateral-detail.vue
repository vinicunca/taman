<script lang="ts" setup>
import { TamanFallback } from '@taman/common-ui';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <TamanFallback
    description="面包屑导航-平级模式-详情页"
    status="coming-soon"
    title="注意观察面包屑导航变化"
  >
    <template #action>
      <Button @click="router.go(-1)">
        返回
      </Button>
    </template>
  </TamanFallback>
</template>
