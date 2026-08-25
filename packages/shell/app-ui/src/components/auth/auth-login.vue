<script lang="ts" setup>
import type { TamanFormSchema } from '@taman-core/form-ui';
import type { ButtonProps } from 'pohon-ui';
import { useTamanForm } from '@taman-core/form-ui';
import { TamanAuthForm } from '@taman-core/taman-ui';
import { $t } from '@taman/locales';
import { computed, reactive } from 'vue';

const props = withDefaults(
  defineProps<{
    formSchema?: Array<TamanFormSchema>;
  }>(),
  {},
);

const emits = defineEmits<{
  loginGoogle: [];
  loginEmail: [];
}>();

const providers = computed<Array<ButtonProps>>(() => {
  return [
    {
      icon: 'logos:google-icon',
      label: 'Google',
      onClick: () => emits('loginGoogle'),
    },
  ];
});

const [FormAuth] = useTamanForm(
  // TODO: how to type the reactive
  reactive({
    showDefaultActions: false,
    schema: computed(() => props.formSchema),

    commonConfig: {
      hideRequiredMark: true,
    },

    layout: 'vertical',
  }),
);
</script>

<template>
  <TamanAuthForm
    :providers="providers"
    :title="$t('authentication.welcomeBack')"
    :description="$t('authentication.loginSubtitle')"
  >
    <FormAuth />
  </TamanAuthForm>
</template>
