<script lang="ts" setup>
import type { CountToProps, TransitionPresets } from '@taman/app-ui';
import type { Component } from 'vue';
import {
  AppCard,
  AppCardAction,
  AppPage,
  CountTo,
  TransitionPresetsKeys,
  useTamanToast,
} from '@taman/app-ui';
import PIcon from 'pohon-ui/components/Icon.vue';
import { h, reactive, ref } from 'vue';
import { useTamanForm } from '#/adapter/form';

const state = reactive<CountToProps & { transition: TransitionPresets }>({
  decimal: '.',
  decimals: 2,
  decimalStyle: {
    fontSize: 'small',
    fontStyle: 'italic',
  },
  delay: 0,
  disabled: false,
  duration: 2000,
  endVal: 100_000,
  mainStyle: {
    color: 'var(--taman-color-primary)',
    fontSize: 'xx-large',
    fontWeight: 'bold',
  },
  prefix: 'Rp.',
  prefixStyle: {
    paddingRight: '0.5rem',
  },
  separator: ',',
  startVal: 0,
  suffix: 'Rupiah',
  suffixStyle: {
    paddingLeft: '0.5rem',
  },
  transition: 'easeOutQuart',
});

function changeNumber() {
  state.endVal = Math.floor(Math.random() * 100_000_000) / 10 ** (state.decimals || 0);
}

const { toast, toaster } = useTamanToast();

function onStarted() {
  toast.add({
    title: 'The animation has started.',
    duration: 0,
    id: 'animator-info',
    icon: 'svg-spinners:ring-resize',
  });
}

function onFinished() {
  toaster.success('The animation has finished.', {
    id: 'animator-info',
    duration: 2_000,
  });
}

const animationKey = ref(0);
function reloadAnimation() {
  animationKey.value += 1;
}

const [FormFields] = useTamanForm({
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',

  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },

  handleValuesChange(values) {
    Object.assign(state, values);
  },

  showDefaultActions: false,
  schema: [
    {
      component: 'InputNumber',
      defaultValue: state.startVal,
      fieldName: 'startVal',
      label: 'Initial value',
    },
    {
      component: 'InputNumber',
      componentProps: {
        precision: state.decimals,
      },
      defaultValue: state.endVal,
      dependencies: {
        resolve({ values }) {
          return {
            componentProps: {
              precision: values.decimals,
            },
          };
        },
        triggerFields: ['decimals'],
      },
      fieldName: 'endVal',
      label: 'Current value',
      suffix: () =>
        h(PIcon as Component, {
          class: 'size-5 cursor-pointer outline-hidden',
          name: 'ix:random-filled',
          onClick: changeNumber,
          title: 'Set a random value',
        }),
    },
    {
      component: 'Switch',
      defaultValue: state.disabled,
      fieldName: 'disabled',
      label: 'Disable animations',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
      },
      defaultValue: state.delay,
      fieldName: 'delay',
      label: 'Delayed animation',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
      },
      defaultValue: state.duration,
      fieldName: 'duration',
      label: 'Duration',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
        precision: 0,
      },
      defaultValue: state.decimals,
      fieldName: 'decimals',
      label: 'Number of decimal places',
    },
    {
      component: 'Input',
      defaultValue: state.separator,
      fieldName: 'separator',
      label: 'Separator',
    },
    {
      component: 'Input',
      defaultValue: state.decimal,
      fieldName: 'decimal',
      label: 'decimal point',
    },
    {
      component: 'Select',
      componentProps: {
        items: TransitionPresetsKeys.map((p) => ({ label: p, value: p })),
      },
      defaultValue: state.transition,
      fieldName: 'transition',
      label: 'Animation',
    },
    {
      component: 'Input',
      defaultValue: state.prefix,
      fieldName: 'prefix',
      label: 'Prefix',
    },
    {
      component: 'Input',
      defaultValue: state.suffix,
      fieldName: 'suffix',
      label: 'suffix',
    },
  ],
});
</script>

<template>
  <AppPage
    title="CountTo"
    description="The number scrolling animation component encapsulated using useTransition. Each time the current value is changed, a transition animation is generated."
  >
    <AppCard title="Basic Usage">
      <template #trailingHeader>
        <AppCardAction>
          <PButton
            @click="reloadAnimation"
          >
            Reload Animation
          </PButton>
        </AppCardAction>
      </template>

      <div class="pb-4 flex-center w-full">
        <CountTo
          :key="animationKey"
          v-bind="state"
          @started="onStarted"
          @finished="onFinished"
        />
      </div>

      <FormFields />
    </AppCard>
  </AppPage>
</template>
