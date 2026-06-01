import { BRANDS } from '@taman/designs';
import { presetPohon } from 'pohon-ui/uno-preset';
import { defineConfig } from 'unocss';

export default defineConfig({
  outputToCssLayers: {
    allLayers: true,
  },

  presets: [
    presetPohon(),
  ],

  safelist: [
    /**
     * In select.ts theme, we have a function that replace the `focus-visible` from input theme.
     * Therefore uno doesn't know about these dynamic classes, so we need to add them to the safelist.
     */
    () => ['focus:ring-2', 'focus:ring-inset'],
    ...BRANDS.map((brand) => `focus:ring-${brand}`),
  ],
});
