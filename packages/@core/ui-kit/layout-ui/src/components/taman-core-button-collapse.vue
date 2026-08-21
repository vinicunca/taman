<script setup lang="ts">
import { useSimpleLocale } from '@taman-core/composables';
import PButton from 'pohon-ui/components/Button.vue';

const collapsed = defineModel<boolean>('collapsed');
const { $t } = useSimpleLocale();

function handleCollapsed() {
  collapsed.value = !collapsed.value;
}
</script>

<template>
  <PButton
    class="bottom-2 left-3 absolute z-10"
    :aria-label="$t('toggleSidebar')"
    :aria-pressed="collapsed"
    data-layout-action="toggle-sidebar-collapse"
    :icon="collapsed ? 'lucide-chevrons-right' : 'lucide-chevrons-left'"
    color="neutral"
    size="sm"
    variant="soft"
    @click.stop="handleCollapsed"
  />
</template>
