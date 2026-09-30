<!--
 Access control component for fine-grained access control.
 TODO: Possible extensions:
 1. Support multiple permission codes with any-match or all-match logic
 2. Support multiple roles with any-match or all-match logic
 3. Support custom permission-code and role evaluation logic
-->
<script lang="ts" setup>
import { computed } from 'vue';

import { useAccess } from './use-access';

interface Props {
  /**
   * Specified codes is visible
   * @default []
   */
  codes?: string[];

  /**
   * How access is evaluated: pass roles when type is 'role', permission codes when type is 'code'
   * @default 'role'
   */
  type?: 'code' | 'role';
}

defineOptions({
  name: 'AccessControl',
});

const props = withDefaults(defineProps<Props>(), {
  codes: () => [],
  type: 'role',
});

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

const hasAuth = computed(() => {
  const { codes, type } = props;
  return type === 'role' ? hasAccessByRoles(codes) : hasAccessByCodes(codes);
});
</script>

<template>
  <slot v-if="!codes"></slot>
  <slot v-else-if="hasAuth"></slot>
</template>
