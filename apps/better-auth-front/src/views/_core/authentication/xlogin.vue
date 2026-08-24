<script lang="ts" setup>
import type { AuthFormField, ButtonProps, FormSubmitEvent } from 'pohon-ui';
import { z } from '@taman/common-ui';
import { $t } from '@taman/locales';
import { computed } from 'vue';

import { useSessionStore } from '#/auth';

const sessionStore = useSessionStore();

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

type Schema = z.output<typeof schema.value>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  await sessionStore.signInWithEmail({
    email: payload.data.email,
    password: payload.data.password,
  });
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
  />
</template>
