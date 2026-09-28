<script lang="ts" setup>
import { $t } from '@taman/locales';
import PButton from 'pohon-ui/components/Button.vue';
import { computed, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';

const props = withDefaults(
  defineProps<{
    description?: string;
    homePath?: string;
    image?: string;
    status?: '403' | '404' | '500' | 'coming-soon' | 'offline';
    title?: string;
  }>(),
  {
    homePath: '/',
    status: 'coming-soon',
  },
);

const Icon403 = defineAsyncComponent(() => import('./icons/icon-403.vue'));
const Icon404 = defineAsyncComponent(() => import('./icons/icon-404.vue'));
const Icon500 = defineAsyncComponent(() => import('./icons/icon-500.vue'));
const IconComingSoon = defineAsyncComponent(() => import('./icons/icon-coming-soon.vue'));
const IconOffline = defineAsyncComponent(() => import('./icons/icon-offline.vue'));

const titleText = computed(() => {
  if (props.title) {
    return props.title;
  }

  switch (props.status) {
    case '403': {
      return $t('ui.fallback.forbidden');
    }
    case '404': {
      return $t('ui.fallback.pageNotFound');
    }
    case '500': {
      return $t('ui.fallback.internalError');
    }
    case 'coming-soon': {
      return $t('ui.fallback.comingSoon');
    }
    case 'offline': {
      return $t('ui.fallback.offlineError');
    }
    default: {
      return '';
    }
  }
});

const descText = computed(() => {
  if (props.description) {
    return props.description;
  }
  switch (props.status) {
    case '403': {
      return $t('ui.fallback.forbiddenDesc');
    }
    case '404': {
      return $t('ui.fallback.pageNotFoundDesc');
    }
    case '500': {
      return $t('ui.fallback.internalErrorDesc');
    }
    case 'offline': {
      return $t('ui.fallback.offlineErrorDesc');
    }
    default: {
      return '';
    }
  }
});

const fallbackIcon = computed(() => {
  switch (props.status) {
    case '403': {
      return Icon403;
    }
    case '404': {
      return Icon404;
    }
    case '500': {
      return Icon500;
    }
    case 'coming-soon': {
      return IconComingSoon;
    }
    case 'offline': {
      return IconOffline;
    }
    default: {
      return null;
    }
  }
});

const showBack = computed(() => {
  return props.status === '403' || props.status === '404';
});

const showRefresh = computed(() => {
  return props.status === '500' || props.status === 'offline';
});

const { push } = useRouter();

function back() {
  push(props.homePath);
}

function refresh() {
  location.reload();
}
</script>

<template>
  <div class="flex-col-center size-full">
    <img
      v-if="image"
      :src="image"
      class="md:1/3 w-1/2 lg:w-1/4"
    >

    <component
      :is="fallbackIcon"
      v-else-if="fallbackIcon"
      class="md:1/3 h-1/3 w-1/2 lg:w-1/4"
    />

    <div class="flex-col-center">
      <slot
        v-if="$slots.title"
        name="title"
      />
      <p
        v-else-if="titleText"
        class="text-foreground text-2xl mt-8 lg:text-4xl md:text-3xl"
      >
        {{ titleText }}
      </p>

      <slot
        v-if="$slots.describe"
        name="describe"
      />

      <p
        v-else-if="descText"
        class="md:text-md text-muted-foreground my-4 lg:text-lg"
      >
        {{ descText }}
      </p>

      <slot
        v-if="$slots.action"
        name="action"
      />

      <PButton
        v-else-if="showBack"
        size="lg"
        icon="lucide:arrow-left"
        @click="back"
      >
        {{ $t('common.backToHome') }}
      </PButton>

      <PButton
        v-else-if="showRefresh"
        size="lg"
        icon="lucide:rotate-cw"
        @click="refresh"
      >
        {{ $t('common.refresh') }}
      </PButton>
    </div>
  </div>
</template>
