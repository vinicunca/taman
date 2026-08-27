<script lang="ts" setup>
import type { FormBaseComponentType, TamanFormProps, TamanFormSchema } from '@taman-core/form-ui';
import type { AuthLoginValues } from './auth.types';
import { useTamanForm } from '@taman-core/form-ui';
import { TamanAuthForm } from '@taman-core/taman-ui';
import { $t } from '@taman/locales';
import PButton from 'pohon-ui/components/Button.vue';
import { computed, reactive } from 'vue';

const props = withDefaults(
  defineProps<{
    formSchema?: Array<
      TamanFormSchema<
        FormBaseComponentType,
        Record<never, never>,
        AuthLoginValues
      >
    >;
    loading?: boolean;
    loginPath?: string;
  }>(),
  {
    loginPath: '/auth/login',
  },
);

const emits = defineEmits<{
  submit: [];
}>();

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
  }) as unknown as TamanFormProps<FormBaseComponentType, Record<never, never>, AuthLoginValues>,
);

async function handleSubmit() {
  const { valid } = await formAuthApi.validate();
  const values = await formAuthApi.getValues();
  console.log('🚀 ~ handleSubmit ~ values:', values);
  // emits('submit', values);
}
</script>

<template>
  <TamanAuthForm
    :title="$t('authentication.createAnAccount')"
    :description="$t('authentication.signUpSubtitle')"
  >
    <div class="flex flex-col gap-2">
      <FormAuth />

      <PButton
        block
        @click="handleSubmit"
      >
        {{ $t('authentication.signUp') }}
      </PButton>

      <div
        class="text-sm text-center flex flex-col items-center"
      >
        <span>{{ $t('authentication.alreadyHaveAccount') }}</span>

        <PButton
          variant="link"
          :to="loginPath"
        >
          {{ $t('authentication.goToLogin') }}
        </PButton>
      </div>
    </div>
  </TamanAuthForm>
</template>
