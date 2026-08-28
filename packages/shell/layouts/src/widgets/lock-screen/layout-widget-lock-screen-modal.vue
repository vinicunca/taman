<script setup lang="ts">
import { useTamanForm, z } from '@taman-core/form-ui';
import { useTamanDialog } from '@taman-core/popup-ui';
import { $t } from '@taman/locales';
import PAvatar from 'pohon-ui/components/Avatar.vue';
import PButton from 'pohon-ui/components/Button.vue';
import { computed, reactive } from 'vue';

defineOptions({
  name: 'LayoutWidgetLockScreenModal',
});

withDefaults(
  defineProps<{
    avatar?: string;
    text?: string;
  }>(),
  {
    avatar: '',
    text: '',
  },
);

const emit = defineEmits<{
  submit: [Record<string, any>];
}>();

const [
  FormLock,
  { resetForm, validate, getValues, getFieldComponentRef },
]
  = useTamanForm(
    reactive({
      commonConfig: {
        hideLabel: true,
        hideRequiredMark: true,
      },
      schema: computed(() => [
        {
          component: 'InputPassword' as const,
          componentProps: {
            placeholder: $t('ui.widgets.lockScreen.placeholder'),
          },
          fieldName: 'lockScreenPassword',
          formFieldProps: { validateOn: ['change'] as const },
          label: $t('authentication.password'),
          rules: z
            .string()
            .min(1, { message: $t('ui.widgets.lockScreen.placeholder') }),
        },
      ]),
      showDefaultActions: false,
    }),
  );

const [DialogLock] = useTamanDialog({
  onConfirm() {
    handleSubmit();
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      resetForm();
    }
  },
  onOpened() {
    requestAnimationFrame(() => {
      getFieldComponentRef('lockScreenPassword')
        ?.$el
        ?.querySelector('[name="lockScreenPassword"]')
        ?.focus();
    });
  },
});

async function handleSubmit() {
  const { valid } = await validate();
  const values = await getValues();
  if (valid) {
    emit('submit', values?.lockScreenPassword);
  }
}
</script>

<template>
  <DialogLock
    :footer="false"
    :fullscreen-button="false"
    :title="$t('ui.widgets.lockScreen.title')"
  >
    <div
      class="mb-10 px-10 flex flex-col w-full items-center"
      @keydown.enter.prevent="handleSubmit"
    >
      <div class="w-full">
        <div class="ml-2 flex flex-col w-full items-center">
          <PAvatar
            :src="avatar"
            class="size-20"
            dot-class="bottom-0 right-1 border-2 size-4 bg-green-500"
          />
          <div class="text-foreground font-medium my-6 flex items-center">
            {{ text }}
          </div>
        </div>

        <FormLock />

        <PButton
          class="mt-1 w-full"
          @click="handleSubmit"
        >
          {{ $t('ui.widgets.lockScreen.screenButton') }}
        </PButton>
      </div>
    </div>
  </DialogLock>
</template>
