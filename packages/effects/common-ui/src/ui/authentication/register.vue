<script setup lang="ts">
import type { VbenFormSchema } from '@taman-core/form-ui';
import type { Recordable } from '@taman/types';

import { useTamanForm } from '@taman-core/form-ui';
import { $t } from '@taman/locales';
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';

import Title from './auth-title.vue';

interface Props {
  formSchema?: Array<VbenFormSchema>;
  /** Whether a loading state is active */
  loading?: boolean;
  /** Login route path */
  loginPath?: string;
  /** Title */
  title?: string;
  /** Subtitle */
  subTitle?: string;
  /** Submit button text */
  submitButtonText?: string;
}

defineOptions({
  name: 'RegisterForm',
});

const props = withDefaults(defineProps<Props>(), {
  formSchema: () => [],
  loading: false,
  loginPath: '/auth/login',
  submitButtonText: '',
  subTitle: '',
  title: '',
});

const emit = defineEmits<{
  submit: [Recordable<any>];
}>();

const [Form, formApi] = useTamanForm(
  reactive({
    commonConfig: {
      hideLabel: true,
      hideRequiredMark: true,
    },
    schema: computed(() => props.formSchema),
    showDefaultActions: false,
  }),
);

const router = useRouter();

async function handleSubmit() {
  const { valid } = await formApi.validate();
  const values = await formApi.getValues();
  if (valid) {
    emit('submit', values as { password: string; username: string });
  }
}

function goToLogin() {
  router.push(props.loginPath);
}

defineExpose({
  getFormApi: () => formApi,
});
</script>

<template>
  <div>
    <Title>
      <slot name="title">
        {{ title || $t('authentication.createAnAccount') }} 🚀
      </slot>
      <template #desc>
        <slot name="subTitle">
          {{ subTitle || $t('authentication.signUpSubtitle') }}
        </slot>
      </template>
    </Title>
    <Form />

    <VbenButton
      :class="{
        'cursor-wait': loading,
      }"
      :loading="loading"
      aria-label="register"
      class="mt-2 w-full"
      @click="handleSubmit"
    >
      <slot name="submitButtonText">
        {{ submitButtonText || $t('authentication.signUp') }}
      </slot>
    </VbenButton>
    <div class="text-sm mt-4 text-center">
      {{ $t('authentication.alreadyHaveAccount') }}
      <span
        class="vben-link text-sm font-normal"
        @click="goToLogin()"
      >
        {{ $t('authentication.goToLogin') }}
      </span>
    </div>
  </div>
</template>
