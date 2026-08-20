<script lang="ts" setup>
import type { AuthFormField, ButtonProps, FormSubmitEvent } from 'pohon-ui';
import { z } from '@taman/common-ui';
import { $t } from '@taman/locales';
import { computed, ref } from 'vue';

import { useSessionStore } from '#/auth';

defineOptions({ name: 'Login' });

const sessionStore = useSessionStore();
const errorMessage = ref('');

const providers = computed<Array<ButtonProps>>(() => {
  return [
    {
      icon: 'logos:google-icon',
      label: 'Google',
      onClick: sessionStore.signInWithGoogle,
    },
  ];
});

const fields = computed<Array<AuthFormField>>(() => {
  return [
    {
      label: $t('authentication.form.email.label'),
      placeholder: $t('authentication.form.email.placeholder'),
      name: 'email',
      type: 'email',
      required: true,
      size: 'lg',
    },
    {
      label: $t('authentication.form.password.label'),
      placeholder: $t('authentication.form.password.placeholder'),
      name: 'password',
      type: 'password',
      required: true,
      size: 'lg',
    },
  ];
});

const schema = computed(() => {
  return z.object({
    email: z
      .email($t('authentication.form.email.invalid')),
    password: z
      .string($t('authentication.form.password.invalid'))
      .trim()
      .min(1, $t('authentication.form.password.invalid')),
  });
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('🚀 ~ onSubmit ~ payload:', payload);
  errorMessage.value = '';
  try {
    await sessionStore.signInWithEmail({
      email: payload.data.email,
      password: payload.data.password,
    });
  } catch (error) {
    errorMessage.value
      = error instanceof Error
        ? error.message
        : $t('authentication.form.password.invalid');
  }
}
</script>

<template>
  <PAuthForm
    :fields="fields"
    :providers="providers"
    :schema="schema"
    :loading="sessionStore.isLoggingIn"
    :title="$t('authentication.welcomeBack')"
    :description="$t('authentication.loginSubtitle')"
    @submit="onSubmit"
  >
    <template
      v-if="errorMessage"
      #validation
    >
      <span class="text-destructive text-sm">{{ errorMessage }}</span>
    </template>
  </PAuthForm>
</template>
