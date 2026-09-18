<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { FormGroupSchema } from '../form.types';
import {
  TamanRenderContent,
} from '@taman-core/taman-ui';
import PCollapsible from 'pohon-ui/components/Collapsible.vue';
import PIcon from 'pohon-ui/runtime/vue/components/Icon.vue';
import { computed, ref, watch } from 'vue';

import { injectRenderFormProps } from './form-render.context';

interface Props {
  /** Styles for the grouped content area (field grid) */
  contentClass?: HTMLAttributes['class'];
  /** Whether to hide the current group when the form collapse button is collapsed */
  hidden?: boolean;
  schema: FormGroupSchema;
}

const props = withDefaults(
  defineProps<Props>(),
  {
    contentClass: '',
    hidden: false,
  },
);

const formRenderProps = injectRenderFormProps();

const collapseOpen = ref(
  props.schema.collapsible === false || !props.schema.defaultCollapsed,
);

const shouldCollapsible = computed(() => {
  return props.schema.collapsible !== false;
});

// When any field in the group fails validation, it automatically expands to avoid the error message being hidden by the collapsed area
const hasInvalidField = computed(() => {
  const errors = formRenderProps.form?.errors ?? {};
  return props.schema.children.some(({ fieldName }) =>
    Object.entries(errors).some(
      ([errorFieldName, error]) =>
        Boolean(error)
        && (errorFieldName === fieldName
          || errorFieldName.startsWith(`${fieldName}.`)
          || errorFieldName.startsWith(`${fieldName}[`)),
    ),
  );
});

watch(hasInvalidField, (invalid) => {
  if (invalid && !collapseOpen.value) {
    collapseOpen.value = true;
  }
});
</script>

<template>
  <div
    class="form-group flex flex-col col-span-full w-full"
    :class="
      [
        { hidden: props.hidden },
        props.schema.formItemClass,
      ]
    "
  >
    <PCollapsible
      v-model:open="collapseOpen"
      :unmount-on-hide="false"
    >
      <div
        class="mb-2 flex flex-1 gap-2 min-h-7 items-center"
      >
        <component
          :is="shouldCollapsible ? 'button' : 'div'"
          :aria-expanded="shouldCollapsible ? collapseOpen : undefined"
          :class="
            [{
              'focus-visible:ring-ring cursor-pointer select-none rounded-sm outline-none focus-visible:ring-2':
                shouldCollapsible,
            }]
          "
          :type="shouldCollapsible ? 'button' : undefined"
          class="text-left flex flex-1 gap-2 min-w-0 items-center"
        >
          <span
            class="rounded-full bg-primary flex-none h-3.5 w-[3px]"
          />
          <span
            v-if="props.schema.title"
            class="text-sm leading-6 font-medium"
          >
            <TamanRenderContent :content="props.schema.title" />
          </span>

          <PIcon
            v-if="shouldCollapsible"
            name="lucide-chevron-down"
            class="color-text-muted flex-none transition-transform"
            :class="
              [
                {
                  'rotate-180': collapseOpen,
                },
              ]
            "
          />
        </component>

        <div
          v-if="props.schema.extra"
          class="flex-none"
        >
          <TamanRenderContent :content="props.schema.extra" />
        </div>
      </div>

      <template #content>
        <div :class="props.contentClass">
          <slot />
        </div>
      </template>
    </PCollapsible>
  </div>
</template>
