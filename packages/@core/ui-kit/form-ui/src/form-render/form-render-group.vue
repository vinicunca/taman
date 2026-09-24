<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { FormGroupSchema } from '../form.types';
import {
  TamanRenderContent,
} from '@taman-core/taman-ui';
import PCollapsible from 'pohon-ui/components/Collapsible.vue';
import PIcon from 'pohon-ui/components/Icon.vue';
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

// pohon's `Collapsible` wraps its entire default-slot root in Akar's
// `CollapsibleTrigger` (`as-child`), merging an `onClick` (and
// `aria-expanded`/`aria-controls`/`type`) onto whatever single element that
// slot renders. Passing the whole `.form-group-header` — trigger *and*
// `extra` — as that slot made the entire header clickable (including
// `extra`, contradicting the DOM contract that only `.form-group-trigger`
// is interactive) and merged trigger-only ARIA attributes onto a
// `role=generic` element. The header is kept out of `<PCollapsible>`'s
// default slot entirely (only `#content` is used) and the real
// `.form-group-trigger` button owns its own click handler instead of
// relying on that bubbled one.
function toggleGroup() {
  if (shouldCollapsible.value) {
    collapseOpen.value = !collapseOpen.value;
  }
}
</script>

<template>
  <div
    v-show="!props.hidden"
    class="form-group flex flex-col col-span-full w-full"
    :class="props.schema.formItemClass"
  >
    <div
      class="form-group-header mb-2 flex flex-1 gap-2 min-h-7 items-center"
    >
      <component
        :is="shouldCollapsible ? 'button' : 'div'"
        :aria-expanded="shouldCollapsible ? collapseOpen : undefined"
        :aria-label="
          shouldCollapsible && !props.schema.title ? 'Toggle group' : undefined
        "
        :class="
          [{
            'focus-visible:ring-ring cursor-pointer select-none rounded-sm outline-none focus-visible:ring-2':
              shouldCollapsible,
          }]
        "
        :type="shouldCollapsible ? 'button' : undefined"
        class="form-group-trigger text-left flex flex-1 gap-2 min-w-0 items-center"
        @click="toggleGroup"
      >
        <span
          class="rounded-full bg-primary flex-none h-3.5 w-[3px]"
        />
        <span
          v-if="props.schema.title"
          class="form-group-title text-sm leading-6 font-medium"
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

    <PCollapsible
      v-model:open="collapseOpen"
      :disabled="!shouldCollapsible"
      :unmount-on-hide="false"
    >
      <template #content>
        <div :class="props.contentClass">
          <slot />
        </div>
      </template>
    </PCollapsible>
  </div>
</template>
