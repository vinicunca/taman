<script lang="ts" setup>
import type { TamanFormSchema } from '@taman/app-ui';
import { AuthLogin, z } from '@taman/app-ui';
import { $t } from '@taman/locales';
import { computed } from 'vue';
import { useSessionStore } from '#/auth';

const sessionStore = useSessionStore();

const formSchema = computed<Array<TamanFormSchema>>(() => {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('authentication.form.email.placeholder'),
      },
      fieldName: 'email',
      formFieldProps: {
        validateOn: ['blur'],
      },
      label: $t('authentication.form.email.label'),
      rules: z.email($t('authentication.form.email.invalid')),
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: $t('authentication.form.password.placeholder'),
      },
      fieldName: 'password',
      formFieldProps: {
        validateOn: ['blur'],
      },
      label: $t('authentication.form.password.label'),
      rules: z
        .string($t('authentication.form.password.invalid'))
        .trim()
        .min(1, $t('authentication.form.password.invalid')),
    },
  ];
});

function handleGoogleLogin() {
  sessionStore.signInWithGoogle();
}

async function handleEmailLogin(payload) {
  await sessionStore.signInWithEmail({
    email: payload.email,
    password: payload.password,
  });
}
</script>

<template>
  <AuthLogin
    :form-schema="formSchema"
    @login-google="handleGoogleLogin"
    @login-email="handleEmailLogin"
  />
</template>
