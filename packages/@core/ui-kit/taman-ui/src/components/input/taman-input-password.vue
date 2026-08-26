<script lang="ts" setup>
import { useSimpleLocale } from '@taman-core/composables';
import PButton from 'pohon-ui/components/Button.vue';
import PInput from 'pohon-ui/components/Input.vue';
import { ref, useTemplateRef } from 'vue';

const { $t } = useSimpleLocale();

const inputRef = useTemplateRef('inputRef');

const isPasswordVisible = ref(false);
</script>

<template>
  <PInput
    ref="inputRef"
    :type="isPasswordVisible ? 'text' : 'password'"
  >
    <template #trailing>
      <PButton
        color="neutral"
        variant="link"
        size="sm"
        :icon="isPasswordVisible ? 'lucide:eye-off' : 'lucide:eye'"
        :aria-label="isPasswordVisible ? $t('authentication.form.password.hidePassword') : $t('authentication.form.password.showPassword')"
        :aria-pressed="isPasswordVisible"
        :aria-controls="inputRef?.inputRef?.id"
        @click="isPasswordVisible = !isPasswordVisible"
      />
    </template>
  </PInput>
</template>
