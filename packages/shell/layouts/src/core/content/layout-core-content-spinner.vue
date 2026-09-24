<script lang="ts" setup>
import { TamanLoading } from '@taman-core/taman-ui';

import { useContentSpinner } from './use-content-spinner';

defineOptions({ name: 'LayoutContentSpinner' });

const { spinning } = useContentSpinner();
</script>

<template>
  <TamanLoading :spinning="spinning" />
</template>
