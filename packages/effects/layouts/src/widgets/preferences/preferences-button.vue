<script lang="ts" setup>
import { ref } from 'vue';

import Preferences from './preferences.vue';

const emit = defineEmits<{
  clearPreferencesAndLogout: [];
}>();

function clearPreferencesAndLogout() {
  emit('clearPreferencesAndLogout');
}

const preferencesRef = ref<InstanceType<typeof Preferences> | null>(null);
</script>

<template>
  <Preferences
    ref="preferencesRef"
    @clear-preferences-and-logout="clearPreferencesAndLogout"
  >
    <PButton
      class="pohon:rounded-full"
      variant="ghost"
      color="neutral"
      icon="lucide:settings"
      @click="preferencesRef?.open()"
    />
  </Preferences>
</template>
