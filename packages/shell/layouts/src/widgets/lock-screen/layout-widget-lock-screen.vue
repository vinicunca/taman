<script setup lang="ts">
import { useTamanForm, z } from '@taman-core/form-ui';
import { useScrollLock } from '@taman/composables';
import { $t, useI18n } from '@taman/locales';
import { storeToRefs, useAccessStore } from '@taman/stores';
import { useDateFormat, useNow } from '@vueuse/core';
import PAvatar from 'pohon-ui/components/Avatar.vue';
import PButton from 'pohon-ui/components/Button.vue';
import PIcon from 'pohon-ui/runtime/vue/components/Icon.vue';
import { computed, reactive, ref } from 'vue';

defineOptions({
  name: 'LayoutWidgetLockScreen',
});

withDefaults(
  defineProps<{
    avatar?: string;
  }>(),
  {
    avatar: '',
  },
);

defineEmits<{ toLogin: [] }>();

const { locale } = useI18n();
const accessStore = useAccessStore();

const now = useNow();
const meridiem = useDateFormat(now, 'A');
const hour = useDateFormat(now, 'HH');
const minute = useDateFormat(now, 'mm');
const date = useDateFormat(now, 'YYYY-MM-DD dddd', { locales: locale.value });

const showUnlockForm = ref(false);
const { lockScreenPassword } = storeToRefs(accessStore);

const [
  FormLock,
  { getFieldComponentRef, getRawValues, setFieldError, validate },
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
          fieldName: 'password',
          label: $t('authentication.password'),
          rules: z
            .string()
            .min(1, { message: $t('authentication.passwordTip') }),
        },
      ]),
      showDefaultActions: false,
    }),
  );

async function handleSubmit() {
  const { valid } = await validate();
  if (valid) {
    const { password } = await getRawValues();
    if (lockScreenPassword?.value === password) {
      accessStore.unlockScreen();
    } else {
      await setFieldError('password', $t('authentication.passwordErrorTip'));
    }
  }
}

function toggleUnlockForm() {
  showUnlockForm.value = !showUnlockForm.value;
  if (showUnlockForm.value) {
    requestAnimationFrame(() => {
      getFieldComponentRef('password')
        ?.$el
        ?.querySelector('[name="password"]')
        ?.focus();
    });
  }
}

useScrollLock();
</script>

<template>
  <div class="bg-background size-full fixed z-2000">
    <Transition name="slide-left">
      <div
        v-show="!showUnlockForm"
        class="size-full"
      >
        <div
          class="group text-foreground/80 hover:text-foreground text-xl font-600 flex-col-center cursor-pointer left-1/2 top-6 fixed z-2001 -translate-x-1/2"
          @click="toggleUnlockForm"
        >
          <PIcon
            name="lucide:lock-keyhole"
            class="size-5 transition-all duration-300 group-hover:scale-125"
          />
          <span>{{ $t('ui.widgets.lockScreen.unlock') }}</span>
        </div>
        <div class="flex-center size-full">
          <div class="px-4 flex gap-4 w-full justify-center md:gap-8 sm:gap-6">
            <div
              class="bg-accent text-[36px] rounded-xl flex-center h-35 w-35 relative md:text-[72px] sm:text-[42px] md:h-50 md:w-50 sm:h-40 sm:w-40"
            >
              <span
                class="text-xs font-600 left-3 top-3 absolute md:text-xl sm:text-sm"
              >
                {{ meridiem }}
              </span>
              {{ hour }}
            </div>
            <div
              class="bg-accent text-[36px] rounded-xl flex-center h-35 w-35 md:text-[72px] sm:text-[42px] md:h-50 md:w-50 sm:h-40 sm:w-40"
            >
              {{ minute }}
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="slide-right">
      <div
        v-if="showUnlockForm"
        class="flex-center size-full"
        @keydown.enter.prevent="handleSubmit"
      >
        <div class="mb-10 px-4 flex-col-center max-w-75 w-[90%]">
          <PAvatar
            :src="avatar"
            class="enter-x mb-6 size-20"
          />
          <div class="enter-x mb-2 w-full items-center">
            <FormLock />
          </div>
          <PButton
            class="enter-x w-full"
            @click="handleSubmit"
          >
            {{ $t('ui.widgets.lockScreen.entry') }}
          </PButton>
          <PButton
            class="enter-x my-2 w-full"
            variant="ghost"
            @click="$emit('toLogin')"
          >
            {{ $t('ui.widgets.lockScreen.backToLogin') }}
          </PButton>
          <PButton
            class="enter-x mr-2 w-full"
            variant="ghost"
            @click="toggleUnlockForm"
          >
            {{ $t('common.back') }}
          </PButton>
        </div>
      </div>
    </Transition>

    <div
      class="enter-y text-xl text-center w-full bottom-5 absolute 2xl:text-3xl md:text-2xl xl:text-xl"
    >
      <div
        v-if="showUnlockForm"
        class="enter-x text-2xl mb-2 md:text-3xl"
      >
        {{ hour }}:{{ minute }}
        <span class="text-base md:text-lg">{{ meridiem }}</span>
      </div>
      <div class="text-xl md:text-3xl">
        {{ date }}
      </div>
    </div>
  </div>
</template>
