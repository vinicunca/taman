<script lang="ts" setup>
import { $t } from '#/locales';
import { preferences } from '@vinicunca/taman-core/preferences';
import { computed } from 'vue';

import { LayoutAuth } from '@taman/layouts';

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
