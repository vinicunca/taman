<script lang="ts" setup>
import type { ButtonProps, SeparatorProps } from 'pohon-ui';
import type { VNode } from 'vue';

import PButton from 'pohon-ui/components/Button.vue';
import PSeparator from 'pohon-ui/components/Separator.vue';

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    providers?: Array<ButtonProps>;
    /**
   * The text displayed in the separator.
   * @defaultValue 'or'
   */
    separator?: string | SeparatorProps;
  }>(),
  {
    separator: 'or',
  },
);

const slots = defineSlots<{
  header?: () => Array<VNode>;
  leading?: () => Array<VNode>;
  title?: (props?: object) => Array<VNode>;
  description?: (props?: object) => Array<VNode>;
  providers?: (props?: object) => Array<VNode>;
  separator?: (props?: object) => Array<VNode>;
  default?: (props?: object) => Array<VNode>;
  footer?: (props?: object) => Array<VNode>;
}>();
</script>

<template>
  <div class="w-full space-y-6">
    <div
      v-if="
        !!slots.leading
          || (props.title || !!slots.title)
          || (props.description || !!slots.description)
          || !!slots.header"
      class="text-center flex flex-col"
    >
      <slot name="header">
        <div
          v-if="!!slots.leading"
          class="mb-2"
        >
          <slot
            name="leading"
          />
        </div>

        <div
          v-if="props.title || !!slots.title"
          class="text-xl color-text-highlighted font-600 text-pretty"
        >
          <slot name="title">
            {{ props.title }}
          </slot>
        </div>

        <div
          v-if="props.description || !!slots.description"
          class="text-base color-text-muted mt-1 text-pretty"
        >
          <slot name="description">
            {{ props.description }}
          </slot>
        </div>
      </slot>
    </div>

    <div
      class="flex flex-col gap-y-6"
    >
      <div
        v-if="props.providers?.length || !!slots.providers"
        class="space-y-3"
      >
        <slot name="providers">
          <PButton
            v-for="(provider, index) in props.providers"
            :key="index"
            block
            color="neutral"
            variant="subtle"
            v-bind="provider"
          />
        </slot>
      </div>

      <slot name="separator">
        <PSeparator
          v-if="props.providers?.length"
          v-bind="typeof props.separator === 'object' ? props.separator : { label: props.separator }"
        />
      </slot>

      <slot />
    </div>

    <div
      v-if="!!slots.footer"
      class="text-sm color-text-muted mt-2 text-center"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
