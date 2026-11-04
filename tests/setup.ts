import { vAutoAnimate } from '@formkit/auto-animate/vue';
import { config } from '@vue/test-utils';

// Unit mounts bypass bootstrap.ts, which registers this directive in the app.
config.global.directives = {
  ...config.global.directives,
  'auto-animate': vAutoAnimate,
};
