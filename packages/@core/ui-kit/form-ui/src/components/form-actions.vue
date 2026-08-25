<script setup lang="ts">
import { useSimpleLocale } from '@taman-core/composables';
import { isFunction, triggerWindowResize } from '@taman-core/shared/utils';
import { TamanExpandableArrow } from '@taman-core/taman-ui';
import PButton from 'pohon-ui/components/Button.vue';
import { computed, toRaw, unref, watch } from 'vue';

import { injectFormProps } from '../form.use-form-context';

const { $t } = useSimpleLocale();

const [rootProps, form] = injectFormProps();

const collapsed = defineModel({ default: false });

const resetButtonOptions = computed(() => {
  return {
    content: `${$t.value('reset')}`,
    show: true,
    ...unref(rootProps).resetButtonOptions,
  };
});

const submitButtonOptions = computed(() => {
  return {
    content: `${$t.value('submit')}`,
    show: true,
    ...unref(rootProps).submitButtonOptions,
  };
});

async function handleSubmit(event: Event) {
  event?.preventDefault();
  event?.stopPropagation();
  const props = unref(rootProps);
  if (!props.formApi) {
    return;
  }

  await props.formApi.validateAndSubmit();
}

async function handleReset(event: Event) {
  event?.preventDefault();
  event?.stopPropagation();
  const props = unref(rootProps);

  const values = toRaw(await props.formApi?.getValues()) ?? {};

  if (isFunction(props.handleReset)) {
    await props.handleReset?.(values);
  } else {
    form.reset();
  }
}

watch(
  () => collapsed.value,
  () => {
    const props = unref(rootProps);
    if (props.collapseTriggerResize) {
      triggerWindowResize();
    }
  },
);

const actionWrapperClass = computed(() => {
  const props = unref(rootProps);
  const actionLayout = props.actionLayout || 'rowEnd';
  const actionPosition = props.actionPosition || 'right';

  const cls = [
    'flex',
    'items-center',
    'gap-3',
    props.compact ? 'pb-2' : 'pb-4',
    props.layout === 'vertical' ? 'self-end' : 'self-center',
    props.layout === 'inline' ? '' : 'w-full',
    props.actionWrapperClass,
  ];

  switch (actionLayout) {
    case 'newLine': {
      cls.push('col-span-full');
      break;
    }
    case 'rowEnd': {
      cls.push('col-[-2/-1]');
      break;
    }
    // 'inline' needs no extra class; keep default
  }

  switch (actionPosition) {
    case 'center': {
      cls.push('justify-center');
      break;
    }
    case 'left': {
      cls.push('justify-start');
      break;
    }
    default: {
      // case 'right': default right alignment
      cls.push('justify-end');
      break;
    }
  }

  return cls.join(' ');
});

defineExpose({
  handleReset,
  handleSubmit,
});
</script>

<template>
  <div :class="actionWrapperClass">
    <template v-if="rootProps.actionButtonsReverse">
      <!-- Before submit button -->
      <slot name="submit-before" />

      <PButton
        v-if="submitButtonOptions.show"
        v-bind="submitButtonOptions"
        @click="handleSubmit"
      >
        {{ submitButtonOptions.content }}
      </PButton>
    </template>

    <!-- Before reset button -->
    <slot name="reset-before" />

    <PButton
      v-if="resetButtonOptions.show"
      v-bind="resetButtonOptions"
      @click="handleReset"
    >
      {{ resetButtonOptions.content }}
    </PButton>

    <template v-if="!rootProps.actionButtonsReverse">
      <!-- Before submit button -->
      <slot name="submit-before" />

      <PButton
        v-if="submitButtonOptions.show"
        v-bind="submitButtonOptions"
        @click="handleSubmit"
      >
        {{ submitButtonOptions.content }}
      </PButton>
    </template>

    <!-- Before expand button -->
    <slot name="expand-before" />

    <VbenExpandableArrow
      v-if="rootProps.showCollapseButton"
      v-model:model-value="collapsed"
      class="ml-[-0.3em]"
    >
      <span>{{ collapsed ? $t('expand') : $t('collapse') }}</span>
    </VbenExpandableArrow>

    <!-- After expand button -->
    <slot name="expand-after" />
  </div>
</template>
