<script setup lang="ts">
import { VbenIconButton } from '@vben-core/shadcn-ui';
import {
  SvgGithubIcon,
  SvgGoogleIcon,
  SvgQQChatIcon,
  SvgWeChatIcon,
} from '@vben/icons';
import { $t } from '@taman/locales';

defineOptions({
  name: 'ThirdPartyLogin',
});
</script>

<template>
  <div class="w-full sm:mx-auto md:max-w-md">
    <div class="mt-4 flex items-center justify-between">
      <span class="border-input border-b w-[35%] dark:border-gray-600" />
      <span class="text-muted-foreground text-xs text-center uppercase">
        {{ $t('authentication.thirdPartyLogin') }}
      </span>
      <span class="border-input border-b w-[35%] dark:border-gray-600" />
    </div>

    <div class="mt-4 flex flex-wrap justify-center">
      <VbenIconButton
        :tooltip="$t('authentication.wechatLogin')"
        tooltip-side="top"
        class="mb-3"
      >
        <SvgWeChatIcon />
      </VbenIconButton>
      <VbenIconButton
        :tooltip="$t('authentication.qqLogin')"
        tooltip-side="top"
        class="mb-3"
      >
        <SvgQQChatIcon />
      </VbenIconButton>
      <VbenIconButton
        :tooltip="$t('authentication.githubLogin')"
        tooltip-side="top"
        class="mb-3"
      >
        <SvgGithubIcon />
      </VbenIconButton>
      <VbenIconButton
        :tooltip="$t('authentication.googleLogin')"
        tooltip-side="top"
        class="mb-3"
      >
        <SvgGoogleIcon />
      </VbenIconButton>
    </div>
  </div>
</template>
