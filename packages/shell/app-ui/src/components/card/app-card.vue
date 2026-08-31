<script lang="ts" setup>
import type { VNode } from 'vue';

defineOptions({
  name: 'AppCard',
});

const {
  title,
  description,
  contentClass,
  headerClass,
  footerClass,
} = defineProps<AppPageProps>();

const slots = defineSlots<{
  default?: () => Array<VNode>;
  title?: () => Array<VNode>;
  description?: () => Array<VNode>;
  trailingHeader?: () => Array<VNode>;
  footer?: () => Array<VNode>;
}>();

interface AppPageProps {
  title?: string;
  description?: string;
  contentClass?: string;
  headerClass?: string;
  footerClass?: string;
}
</script>

<template>
  <div
    class="group/card rounded-xl bg-background flex flex-col ring ring-ring ring-inset shadow-xs overflow-hidden [&_img:first-child]:rounded-t-xl [&_img:last-child]:rounded-b-xl"
    data-slot="card"
  >
    <div
      v-if="title || description || slots.title || slots.description"
      data-slot="card-header"
      class="group/card-header px-4 py-4 border-b rounded-t-xl @container/cardHeader gap-1 grid auto-rows-min items-center has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] has-data-[slot=card-description]:items-start"
      :class="headerClass"
    >
      <slot name="title">
        <h3
          v-if="title"
          data-slot="card-title"
          class="leading-none font-600"
        >
          {{ title }}
        </h3>
      </slot>

      <slot name="description">
        <p
          v-if="description"
          data-slot="card-description"
          class="text-sm color-text-muted"
        >
          {{ description }}
        </p>
      </slot>

      <slot name="trailingHeader" />
    </div>

    <div
      data-slot="card-content"
      class="p-4"
      :class="contentClass"
    >
      <slot />
    </div>

    <div
      v-if="slots.footer"
      data-slot="card-footer"
      class="p-4 border-t flex items-center"
      :class="footerClass"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
