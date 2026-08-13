<script lang="ts" setup>
import { AuthPageLayout } from '@taman/layouts';
import { preferences } from '@taman/preferences';
import { computed } from 'vue';

import CoreLogo from '#/domains/core/components/core-logo.vue';
import { $t } from '#/locales';

const appName = computed(() => preferences.app.name);
const logo = computed(() => preferences.logo.source);
</script>

<template>
  <AuthPageLayout
    :app-name="appName"
    :logo="logo"
    slogan-image="https://assets.ngibur.com/global/background-auth.webp"
    :page-description="$t('authentication.pageDesc')"
    :page-title="$t('authentication.pageTitle')"
  >
    <template #logo>
      <div class="p-4 left-0 top-0 absolute z-10">
        <CoreLogo class="h-20 w-auto" />
      </div>
    </template>
  </AuthPageLayout>
</template>
