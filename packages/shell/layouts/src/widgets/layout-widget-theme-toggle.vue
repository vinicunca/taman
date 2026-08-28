<script lang="ts" setup>
import { TamanButtonIcon } from '@taman-core/taman-ui';
import { usePreferences } from '@taman/preferences';
import { nextTick } from 'vue';

defineOptions({
  name: 'LayoutWidgetThemeToggle',
});

const { isDark, colorMode } = usePreferences();

function toggleTheme(event: MouseEvent) {
  const isAppearanceTransition
    // @ts-expect-error - startViewTransition is not available in the current DOM lib target
    = document.startViewTransition
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isAppearanceTransition || !event) {
    colorMode.value = isDark.value ? 'light' : 'dark';
    return;
  }
  const x = event.clientX;
  const y = event.clientY;
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  );
  const transition = document.startViewTransition(async () => {
    colorMode.value = isDark.value ? 'light' : 'dark';
    await nextTick();
  });
  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ];
    const animate = document.documentElement.animate(
      {
        clipPath: isDark.value ? [...clipPath].toReversed() : clipPath,
      },
      {
        duration: 450,
        easing: 'ease-in',
        pseudoElement: isDark.value
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)',
      },
    );
    animate.onfinish = () => {
      transition.skipTransition();
    };
  });
}
</script>

<template>
  <TamanButtonIcon
    :tooltip-text="$t('preferences.theme.title')"
    :icon="isDark ? 'ph:sun-bold' : 'ph:moon-bold'"
    @click.stop="toggleTheme"
  />
</template>
