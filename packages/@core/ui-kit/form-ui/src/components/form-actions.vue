<script setup lang="ts">
import { useSimpleLocale } from '@taman-core/composables';
import { isFunction, triggerWindowResize } from '@taman-core/shared/utils';
import PButton from 'pohon-ui/components/Button.vue';
import PIcon from 'pohon-ui/runtime/vue/components/Icon.vue';
import { computed, toRaw, unref, watch } from 'vue';

import { injectFormProps } from '../form.use-form-context';

interface Props {
  /** Id of the field grid the collapse trigger expands/collapses, for `aria-controls`. */
  gridId?: string;
}

const props = defineProps<Props>();

const { $t } = useSimpleLocale();

const [rootProps, form] = injectFormProps();

const collapsed = defineModel<boolean>({ default: false });

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

// Async field validators (onBlurAsync/onChangeAsync/...) or an in-flight
// submit both leave the form in a state where clicking submit is either
// invalid or a duplicate request — disable it to prevent rage-clicking.
const isFormBusy = computed(() => form.meta.submitting || form.meta.validating);

// Form-level `disabled` covers both action buttons. Distinct from
// `commonConfig.disabled`, which only disables fields and leaves these
// buttons live. The collapse toggle is intentionally left out — it only
// changes what's visible, it doesn't mutate or submit form data.
const isFormDisabled = computed(() => Boolean(unref(rootProps).disabled));

// Toggle visibility is derived, not configured: it appears only when at
// least one top-level schema entry opts in via `collapsed: true`.
const hasCollapsibleFields = computed(() =>
  (unref(rootProps).schema ?? []).some((schema) => schema.collapsed === true),
);

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
    'self-end',
    'w-full',
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
        :disabled="isFormDisabled || isFormBusy || Boolean(submitButtonOptions.disabled)"
        :loading="isFormBusy || Boolean(submitButtonOptions.loading)"
        @click="handleSubmit"
      >
        {{ submitButtonOptions.content }}
      </PButton>
    </template>

    <!-- Before reset button -->
    <slot name="reset-before" />

    <!--
      Reset is intentionally not gated on `isFormBusy` (unlike submit
      above): it never had a busy-state binding before form-level
      `disabled` existed, and a user should still be able to bail out of a
      form that is merely validating. Only `isFormDisabled` applies here.
    -->
    <PButton
      v-if="resetButtonOptions.show"
      v-bind="resetButtonOptions"
      variant="outline"
      color="neutral"
      :disabled="isFormDisabled || Boolean(resetButtonOptions.disabled)"
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
        :disabled="isFormDisabled || isFormBusy || Boolean(submitButtonOptions.disabled)"
        :loading="isFormBusy || Boolean(submitButtonOptions.loading)"
        @click="handleSubmit"
      >
        {{ submitButtonOptions.content }}
      </PButton>
    </template>

    <!-- Before expand button -->
    <slot name="expand-before" />

    <button
      v-if="hasCollapsibleFields"
      type="button"
      class="form-collapse-trigger text-sm color-primary cursor-pointer inline-flex gap-1 items-center"
      :aria-controls="props.gridId"
      :aria-expanded="!collapsed"
      @click="collapsed = !collapsed"
    >
      <span>{{ collapsed ? $t('expand') : $t('collapse') }}</span>
      <PIcon
        name="lucide:chevron-down"
        class="transition-transform"
        :class="{ 'rotate-180': !collapsed }"
      />
    </button>

    <!-- After expand button -->
    <slot name="expand-after" />
  </div>
</template>
