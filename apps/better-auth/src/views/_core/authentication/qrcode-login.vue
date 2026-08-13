<script lang="ts" setup>
import { AuthenticationQrCodeLogin } from '@taman/common-ui';
import { LOGIN_PATH } from '@taman/constants';

defineOptions({ name: 'QrCodeLogin' });
</script>

<template>
  <AuthenticationQrCodeLogin :login-path="LOGIN_PATH" />
</template>
