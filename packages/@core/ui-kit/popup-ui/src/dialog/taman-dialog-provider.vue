<script lang="ts" setup>
import type { DialogProps } from './dialog.types';

import { getCurrentInstance } from 'vue';

import { dialogDefaults } from './dialog.defaults';
import { dialogRegistry } from './dialog.registry';

defineOptions({
  name: 'TamanDialogProvider',
});

/**
 * App-wide defaults for every dialog, e.g. { centered: true }.
 * Merged with the lowest priority; per-dialog options and template
 * props always win. Read at dialog creation time (not reactive).
 */
const props = defineProps<Partial<DialogProps>>();

// Vue gives every declared Boolean prop an implicit `false` when the parent
// doesn't pass it at all — mounting <TamanDialogProvider /> with no props
// (the normal case) would otherwise write `destroyOnClose: false`,
// `header: false`, etc. into dialogDefaults, silently overriding DialogApi's
// own defaults for every dialog in the app. Only copy keys the parent
// actually passed, using the raw (pre-default-coercion) vnode props.
const rawProps = getCurrentInstance()?.vnode.props ?? {};
for (const key of Object.keys(props) as Array<keyof DialogProps>) {
  if (key in rawProps) {
    dialogDefaults[key] = props[key] as never;
  }
}
</script>

<template>
  <component
    :is="entry.component"
    v-for="entry in dialogRegistry"
    :key="entry.id"
  />
</template>
