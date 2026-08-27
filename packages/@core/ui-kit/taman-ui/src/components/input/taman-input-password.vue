<script lang="ts" setup>
import { useSimpleLocale } from '@taman-core/composables';
import PButton from 'pohon-ui/components/Button.vue';
import PInput from 'pohon-ui/components/Input.vue';
import PProgress from 'pohon-ui/components/Progress.vue';
import { computed, ref, useTemplateRef } from 'vue';

import {
  PASSWORD_STRENGTH_MAX,
  passwordStrengthScore,
} from './password-strength';

defineOptions({
  inheritAttrs: false,
});

defineProps<{
  passwordStrength?: boolean;
}>();

const { $t } = useSimpleLocale();

const inputRef = useTemplateRef('inputRef');

const modelValue = defineModel<string>();
const isPasswordVisible = ref(false);

const score = computed(() => passwordStrengthScore(modelValue.value));

const color = computed(() => {
  if (score.value === 0) {
    return 'neutral';
  }
  if (score.value <= 2) {
    return 'error';
  }
  if (score.value < PASSWORD_STRENGTH_MAX) {
    return 'warning';
  }
  return 'success';
});
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <PInput
      ref="inputRef"
      v-bind="$attrs"
      v-model="modelValue"
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

    <PProgress
      v-if="passwordStrength"
      :color="color"
      :model-value="score"
      :max="PASSWORD_STRENGTH_MAX"
      size="sm"
    />
  </div>
</template>
