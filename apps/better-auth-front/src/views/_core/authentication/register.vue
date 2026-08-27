<script lang="ts" setup>
import type { AuthLoginValues, FormBaseComponentType, TamanFormSchema } from '@taman/app-ui';
import type { Recordable } from '@taman/types';

import { AuthRegister, createStrongPasswordSchema, z } from '@taman/app-ui';
import { $t } from '@taman/locales';
import { computed } from 'vue';

const formSchema = computed<
  Array<
    TamanFormSchema<
      FormBaseComponentType,
      Record<never, never>,
      AuthLoginValues
    >
  >
>(() => {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('authentication.form.email.placeholder'),
        size: 'lg',
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
        passwordStrength: true,
        placeholder: $t('authentication.form.password.placeholder'),
        size: 'lg',
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      description: $t('authentication.passwordStrength'),
      formFieldProps: {
        validateOn: ['blur'],
      },
      formItemClass: 'pohon:pb-11',
      rules: createStrongPasswordSchema({
        required: $t('authentication.form.password.invalid'),
        strength: $t('authentication.form.password.strength'),
      }),
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: $t('authentication.confirmPassword'),
        size: 'lg',
      },
      dependencies: {
        rules(values) {
          const { password } = values;
          return z
            .string({ error: $t('authentication.passwordTip') })
            .trim()
            .min(1, $t('authentication.passwordTip'))
            .refine((value) => value === password, {
              message: $t('authentication.confirmPasswordTip'),
            });
        },
        triggerFields: ['password'],
      },
      fieldName: 'confirmPassword',
      label: $t('authentication.confirmPassword'),
    },
  ];
});

function handleSubmit(value: Recordable<any>) {
  void value;
}
</script>

<template>
  <AuthRegister
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
