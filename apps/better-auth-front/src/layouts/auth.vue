<script lang="ts" setup>
import { LayoutAuth } from '@taman/layouts';
import { preferences } from '@taman/preferences';
import { computed } from 'vue';

import { $t } from '#/locales';

const appName = computed(() => preferences.app.name);
</script>

<template>
  <LayoutAuth
    :app-name="appName"
    logo="/images/logo-light.png"
    logo-dark="/images/logo-dark.png"
    :page-description="$t('authentication.pageDesc')"
    :page-title="$t('authentication.pageTitle')"
  />
</template>
