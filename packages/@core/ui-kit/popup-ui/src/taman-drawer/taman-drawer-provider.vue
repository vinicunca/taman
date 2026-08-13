<script lang="ts" setup>
import type { TamanDrawerProps } from './drawer.types';

import { getCurrentInstance } from 'vue';

import { drawerDefaults } from './drawer.defaults';
import { drawerRegistry } from './drawer.registry';

defineOptions({
  name: 'TamanDrawerProvider',
});

/**
 * App-wide defaults for every drawer, e.g. { placement: 'left' }.
 * Merged with the lowest priority; per-drawer options and template
 * props always win. Read at drawer creation time (not reactive).
 */
const props = defineProps<Partial<TamanDrawerProps>>();

// Vue gives every declared Boolean prop an implicit `false` when the parent
// doesn't pass it at all — mounting <TamanDrawerProvider /> with no props
// (the normal case) would otherwise write `header: false`, `footer: false`,
// etc. into drawerDefaults, silently overriding TamanDrawerApi's own
// defaults for every drawer in the app. Only copy keys the parent actually
// passed, using the raw (pre-default-coercion) vnode props.
const rawProps = getCurrentInstance()?.vnode.props ?? {};
for (const key of Object.keys(props) as Array<keyof TamanDrawerProps>) {
  if (key in rawProps) {
    drawerDefaults[key] = props[key] as never;
  }
}
</script>

<template>
  <component
    :is="entry.component"
    v-for="entry in drawerRegistry"
    :key="entry.id"
  />
</template>
