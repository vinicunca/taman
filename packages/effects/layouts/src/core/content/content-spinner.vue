<script lang="ts" setup>
import { TamanSpinner } from '@taman-core/taman-ui';

import { useContentSpinner } from './use-content-spinner';

defineOptions({ name: 'LayoutContentSpinner' });

const { spinning } = useContentSpinner();
</script>

<template>
  <TamanSpinner :spinning="spinning" />
</template>
