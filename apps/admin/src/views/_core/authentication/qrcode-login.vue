<script lang="ts" setup>
import { AuthenticationQrCodeLogin } from '@taman/common-ui';

defineOptions({ name: 'QrCodeLogin' });
</script>

<template>
  <AuthenticationQrCodeLogin login-path="/auth/login" />
</template>
