<script lang="ts" setup>
import { TamanLoading } from '@vinicunca/taman-ui';

import { useContentSpinner } from './use-content-spinner';

defineOptions({ name: 'LayoutContentSpinner' });

const { spinning } = useContentSpinner();
</script>

<template>
  <TamanLoading :spinning="spinning" />
</template>
