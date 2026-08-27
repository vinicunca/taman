<script lang="ts" setup>
import type { FormBaseComponentType, TamanFormProps, TamanFormSchema } from '@taman-core/form-ui';
import type { ButtonProps } from 'pohon-ui';
import type { AuthLoginValues } from './auth.types';
import { useTamanForm } from '@taman-core/form-ui';
import { TamanAuthForm } from '@taman-core/taman-ui';
import { $t } from '@taman/locales';
import PButton from 'pohon-ui/components/Button.vue';
import PCheckbox from 'pohon-ui/components/Checkbox.vue';
import { computed, reactive, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    formSchema?: Array<
      TamanFormSchema<
        FormBaseComponentType,
        Record<never, never>,
        AuthLoginValues
      >
    >;
    showRegister?: boolean;
    registerPath?: string;
    showProviders?: boolean;
    showForgotPassword?: boolean;
    showRememberMe?: boolean;
    forgetPasswordPath?: string;
  }>(),
  {
    showProviders: true,
    showForgotPassword: true,
    showRememberMe: true,
    forgetPasswordPath: '/auth/forgot-password',
    showRegister: true,
    registerPath: '/auth/register',
  },
);

const emits = defineEmits<{
  loginGoogle: [];
  loginEmail: [values: AuthLoginValues];
}>();

const providers = computed<Array<ButtonProps>>(() => {
  if (!props.showProviders) {
    return [];
  }

  return [
    {
      icon: 'logos:google-icon',
      label: 'Google',
      onClick: () => emits('loginGoogle'),
    },
  ];
});

const REMEMBER_ME_KEY = `REMEMBER_ME_EMAIL_${location.hostname}`;
const localEmail = localStorage.getItem(REMEMBER_ME_KEY) || '';

const rememberMe = ref(!!localEmail);

// `reactive()` + `computed()` here defeats TS's overload/UnwrapNestedRefs
// inference once TValues is a concrete type (not the loose FormValues
// default) — the nested FormSchema recursion hits TS's instantiation depth
// limit. Asserting the boundary type directly sidesteps that; runtime
// behavior (reactive schema updates) is unaffected.
const [FormAuth, formAuthApi] = useTamanForm<AuthLoginValues>(
  reactive({
    showDefaultActions: false,
    schema: computed(() => props.formSchema),

    commonConfig: {
      hideRequiredMark: true,
    },

    layout: 'vertical',

    handleSubmit(values: AuthLoginValues) {
      emits('loginEmail', values);
    },
  }) as unknown as TamanFormProps<FormBaseComponentType, Record<never, never>, AuthLoginValues>,
);
</script>

<template>
  <TamanAuthForm
    :providers="providers"
    :title="$t('authentication.welcomeBack')"
    :description="$t('authentication.loginSubtitle')"
  >
    <div class="flex flex-col gap-2">
      <FormAuth />

      <div class="flex justify-between">
        <PCheckbox
          v-if="showRememberMe"
          v-model="rememberMe"
          name="rememberMe"
          :label="$t('authentication.rememberMe')"
        />

        <PButton
          v-if="showForgotPassword"
          variant="link"
          :to="forgetPasswordPath"
        >
          {{ $t('authentication.forgetPassword') }}
        </PButton>
      </div>

      <PButton
        block
        @click="formAuthApi.validateAndSubmit"
      >
        {{ $t('common.login') }}
      </PButton>

      <slot name="to-register">
        <div
          v-if="showRegister"
          class="text-sm text-center flex flex-col items-center"
        >
          <span>{{ $t('authentication.accountTip') }}</span>

          <PButton
            variant="link"
            :to="registerPath"
          >
            {{ $t('authentication.createAccount') }}
          </PButton>
        </div>
      </slot>
    </div>
  </TamanAuthForm>
</template>
