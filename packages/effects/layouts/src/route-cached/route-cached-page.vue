<!-- Collects cached routes and stores them in Pinia; no visual output -->
<script setup lang="ts">
import type { VNode } from 'vue';
import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router';

import { useTabbarStore } from '@taman/stores';
import { watch } from 'vue';

interface Props {
  component?: VNode;
  route: RouteLocationNormalizedLoadedGeneric;
}

/**
 * Route cache collector; does not render UI
 */
defineOptions({
  render() {
    return null;
  },
});
const props = defineProps<Props>();

const { addCachedRoute } = useTabbarStore();

watch(
  () => props.route,
  () => {
    if (props.component && props.route.meta.domCached) {
      addCachedRoute(props.component, props.route);
    }
  },
  { immediate: true },
);
</script>
