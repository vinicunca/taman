<script setup lang="ts">
import type { ToolbarType } from './types';

import { preferences, usePreferences } from '@taman/preferences';
import { computed } from 'vue';

import { Copyright } from '../core/copyright';
import AuthenticationFormView from './form.vue';
import Toolbar from './toolbar.vue';

interface Props {
  appName?: string;
  logo?: string;
  logoDark?: string;
  pageTitle?: string;
  pageDescription?: string;
  sloganImage?: string;
  toolbar?: boolean;
  copyright?: boolean;
  toolbarList?: Array<ToolbarType>;
}

const props = withDefaults(
  defineProps<Props>(),
  {
    appName: '',
    copyright: true,
    logo: '',
    logoDark: '',
    pageDescription: '',
    pageTitle: '',
    sloganImage: '',
    toolbar: true,
    toolbarList: () => [
      // 'color',
      'language',
      'layout',
      'theme',
    ],
  },
);

const {
  authPanelCenter,
  authPanelLeft,
  authPanelRight,
  isDark,
} = usePreferences();

/**
 * Picks the logo image for the current theme
 */
const logoSrc = computed(() => {
  // Use dark logo when in dark mode and logoDark is provided
  if (isDark.value && props.logoDark) {
    return props.logoDark;
  }
  return props.logo;
});
</script>

<template>
  <div
    class="flex flex-1 min-h-full select-none overflow-x-hidden"
  >
    <template v-if="toolbar">
      <slot name="toolbar">
        <Toolbar :toolbar-list="toolbarList" />
      </slot>
    </template>

    <!-- Left auth panel -->
    <AuthenticationFormView
      v-if="authPanelLeft"
      class="flex-1 min-h-full w-2/5"
      data-side="left"
    >
      <template
        v-if="copyright"
        #copyright
      >
        <slot name="copyright">
          <Copyright
            v-if="preferences.copyright.enable"
            v-bind="preferences.copyright"
          />
        </slot>
      </template>
    </AuthenticationFormView>

    <slot name="logo">
      <!-- Header logo and app name -->
      <div
        v-if="logoSrc || appName"
        class="flex flex-1 left-0 top-0 absolute z-10"
      >
        <div
          class="color-text ml-4 mt-4 flex flex-1 items-center sm:(left-6 top-6)"
        >
          <img
            v-if="logoSrc"
            :key="logoSrc"
            :alt="appName"
            :src="logoSrc"
            class="mr-2"
            width="42"
          >
          <p
            v-if="appName"
            class="text-xl font-medium"
          >
            {{ appName }}
          </p>
        </div>
      </div>
    </slot>

    <!-- Marketing / intro panel -->
    <div
      v-if="!authPanelCenter"
      class="flex-1 w-0 hidden relative lg:block"
    >
      <div
        class="bg-background-elevated size-full inset-0 absolute dark:bg-[#070709]"
      >
        <div class="login-background size-full left-0 top-0 absolute" />

        <div
          :key="authPanelLeft ? 'left' : authPanelRight ? 'right' : 'center'"
          class="px-10 flex-col-center h-full"
          :class="{
            'enter-x': authPanelLeft,
            '-enter-x': authPanelRight,
          }"
        >
          <template v-if="sloganImage">
            <img
              :alt="appName"
              :src="sloganImage"
              class="animate-float h-64"
            >
          </template>

          <div class="text-xl font-500 mt-6 lg:text-2xl">
            {{ pageTitle }}
          </div>

          <div class="mt-2">
            {{ pageDescription }}
          </div>
        </div>
      </div>
    </div>

    <!-- Center auth panel -->
    <div
      v-if="authPanelCenter"
      class="flex-center w-full relative"
    >
      <div class="login-background size-full left-0 top-0 absolute" />
      <AuthenticationFormView
        class="shadow-float pb-20 rounded-3xl w-full shadow-primary/5 md:bg-background lg:w-1/2 md:w-2/3 xl:w-[36%]"
        data-side="bottom"
      >
        <template
          v-if="copyright"
          #copyright
        >
          <slot name="copyright">
            <Copyright
              v-if="preferences.copyright.enable"
              v-bind="preferences.copyright"
            />
          </slot>
        </template>
      </AuthenticationFormView>
    </div>

    <!-- Right auth panel -->
    <AuthenticationFormView
      v-if="authPanelRight"
      class="flex-1 min-h-full w-2/5"
      data-side="right"
    >
      <template
        v-if="copyright"
        #copyright
      >
        <slot name="copyright">
          <Copyright
            v-if="preferences.copyright.enable"
            v-bind="preferences.copyright"
          />
        </slot>
      </template>
    </AuthenticationFormView>
  </div>
</template>

<style scoped>
.login-background {
  background: linear-gradient(
    154deg,
    #07070915 30%,
    hsl(var(--taman-color-primary-500) / 30%) 48%,
    #07070915 64%
  );
  filter: blur(100px);
}

.dark {
  .login-background {
    background: linear-gradient(
      154deg,
      #07070915 30%,
      hsl(var(--taman-color-primary-500) / 20%) 48%,
      #07070915 64%
    );
    filter: blur(100px);
  }
}

@keyframes float {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }

  100% {
    transform: translateY(0);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
