<script lang="ts" setup>
import type { FieldConfig } from '@taman-core/form-builder';
import type { AuthenticationProps } from './types';
import { useTamanForm } from '@taman-core/form-builder';
import AuthTitle from './auth-title.vue';

interface Props extends AuthenticationProps {
  formSchema?: Array<FieldConfig>;
}

const props = defineProps<Props>();

const [FormLogin] = useTamanForm({
  fields: props.formSchema,
});
</script>

<template>
  <div>
    <AuthTitle>
      <slot name="title">
        {{ props.title || `${$t('authentication.welcomeBack')} 👋🏻` }}
      </slot>

      <template #desc>
        <span class="color-text-muted">
          <slot name="subtitle">
            {{ props.subtitle || $t('authentication.loginSubtitle') }}
          </slot>
        </span>
      </template>
    </AuthTitle>

    <FormLogin />
  </div>
</template>
