import type { VinicuncaTheme } from '@vinicunca/unocss-preset';
import { presetVinicunca } from '@vinicunca/unocss-preset';
import { definePreset } from 'unocss';
import { BRANDS } from '../constants';
import { animations } from './uno.animations';

// eslint-disable-next-line no-template-curly-in-string
const COLOR_PLACEHOLDER = '${color}';
const TOKEN_PATTERN = /[^\s`]+/g;

export const presetCore = definePreset<VinicuncaTheme>(() => {
  // @keep-sorted
  return {
    enforce: 'post',

    extractors: [
      /**
       * In the theme files there are bunch of placeholders like ${color} that we need to extract and add to the safelist.
       */
      {
        name: 'pohon-colors-extractor',
        extract({ code }) {
          const matches = code
            .match(TOKEN_PATTERN)
            ?.filter((token) => token.includes(COLOR_PLACEHOLDER));

          if (matches !== undefined) {
            return matches.flatMap((match) => {
              return BRANDS.map((brand) => match.replace(COLOR_PLACEHOLDER, brand));
            });
          }
        },
      },
    ],

    layers: {
      'components': 90,
      'pohon': 100,
      'p-variant': 200,
    },

    name: 'uno-preset-core',

    presets: [
      presetVinicunca({
        icons: {
          extraProperties: {
            'display': 'inline-block',
            'vertical-align': 'middle',
          },
        },

        webFonts: {
          provider: 'fontsource',
          fonts: {
            sans: [
              'Inter',
            ],
          },
          timeouts: {
            warning: 3000,
            failure: 10_000,
          },
        },

        extendedTheme: {
          ...animations,
        },
      }),
    ],

    safelist: [
      'isolate',
    ],

    shortcuts: [
      {
        'flex-center': 'flex items-center justify-center',
        'flex-col-center': 'flex-center flex-col',
        'z-popup': 'z-$ui-z-popup',
        'z-toaster': 'z-$ui-z-toaster',
      },
    ],

    theme: {
      colors: {
        text: {
          dimmed: 'var(--taman-color-text-dimmed)',
          muted: 'var(--taman-color-text-muted)',
          toned: 'var(--taman-color-text-toned)',
          DEFAULT: 'var(--taman-color-text)',
          highlighted: 'var(--taman-color-text-highlighted)',
          inverted: 'var(--taman-color-text-inverted)',
        },
        background: {
          'DEFAULT': 'var(--taman-color-bg)',
          'muted': 'var(--taman-color-bg-muted)',
          'elevated': 'var(--taman-color-bg-elevated)',
          'accented': 'var(--taman-color-bg-accented)',
          'inverted': 'var(--taman-color-bg-inverted)',
          'border': 'var(--taman-color-border)',
          'header': 'var(--taman-color-bg-header)',
          'sidebar': 'var(--taman-color-bg-sidebar)',
          'sidebar-deep': 'var(--taman-color-bg-sidebar-deep)',
        },
        border: {
          DEFAULT: 'var(--taman-color-border)',
          muted: 'var(--taman-color-border-muted)',
          accented: 'var(--taman-color-border-accented)',
          inverted: 'var(--taman-color-border-inverted)',
          bg: 'var(--taman-color-bg)',
        },
        ring: {
          DEFAULT: 'var(--taman-color-border)',
          muted: 'var(--taman-color-border-muted)',
          accented: 'var(--taman-color-border-accented)',
          inverted: 'var(--taman-color-border-inverted)',
          bg: 'var(--taman-color-bg)',
          offset: {
            DEFAULT: 'var(--taman-color-border)',
            muted: 'var(--taman-color-border-muted)',
            accented: 'var(--taman-color-border-accented)',
            inverted: 'var(--taman-color-border-inverted)',
            bg: 'var(--taman-color-bg)',
          },
        },
        divide: {
          DEFAULT: 'var(--taman-color-border)',
          muted: 'var(--taman-color-border-muted)',
          accented: 'var(--taman-color-border-accented)',
          inverted: 'var(--taman-color-border-inverted)',
        },
        outline: {
          DEFAULT: 'var(--taman-color-border)',
          inverted: 'var(--taman-color-border-inverted)',
        },
        stroke: {
          DEFAULT: 'var(--taman-color-border)',
          inverted: 'var(--taman-color-border-inverted)',
        },
        fill: {
          DEFAULT: 'var(--taman-color-border)',
          inverted: 'var(--taman-color-border-inverted)',
        },
        primary: {
          DEFAULT: 'var(--taman-color-primary)',
          foreground: 'var(--taman-color-primary-foreground)',
          50: 'var(--taman-color-primary-50)',
          100: 'var(--taman-color-primary-100)',
          200: 'var(--taman-color-primary-200)',
          300: 'var(--taman-color-primary-300)',
          400: 'var(--taman-color-primary-400)',
          500: 'var(--taman-color-primary-500)',
          600: 'var(--taman-color-primary-600)',
          700: 'var(--taman-color-primary-700)',
          800: 'var(--taman-color-primary-800)',
          900: 'var(--taman-color-primary-900)',
          950: 'var(--taman-color-primary-950)',
        },
        success: {
          DEFAULT: 'var(--taman-color-success)',
          50: 'var(--taman-color-success-50)',
          100: 'var(--taman-color-success-100)',
          200: 'var(--taman-color-success-200)',
          300: 'var(--taman-color-success-300)',
          400: 'var(--taman-color-success-400)',
          500: 'var(--taman-color-success-500)',
          600: 'var(--taman-color-success-600)',
          700: 'var(--taman-color-success-700)',
          800: 'var(--taman-color-success-800)',
          900: 'var(--taman-color-success-900)',
          950: 'var(--taman-color-success-950)',
        },
        warning: {
          DEFAULT: 'var(--taman-color-warning)',
          50: 'var(--taman-color-warning-50)',
          100: 'var(--taman-color-warning-100)',
          200: 'var(--taman-color-warning-200)',
          300: 'var(--taman-color-warning-300)',
          400: 'var(--taman-color-warning-400)',
          500: 'var(--taman-color-warning-500)',
          600: 'var(--taman-color-warning-600)',
          700: 'var(--taman-color-warning-700)',
          800: 'var(--taman-color-warning-800)',
          900: 'var(--taman-color-warning-900)',
          950: 'var(--taman-color-warning-950)',
        },
        error: {
          DEFAULT: 'var(--taman-color-error)',
          50: 'var(--taman-color-error-50)',
          100: 'var(--taman-color-error-100)',
          200: 'var(--taman-color-error-200)',
          300: 'var(--taman-color-error-300)',
          400: 'var(--taman-color-error-400)',
          500: 'var(--taman-color-error-500)',
          600: 'var(--taman-color-error-600)',
          700: 'var(--taman-color-error-700)',
          800: 'var(--taman-color-error-800)',
          900: 'var(--taman-color-error-900)',
          950: 'var(--taman-color-error-950)',
        },
      },

      ease: {
        emphasized: 'cubic-bezier(0.25, 0.8, 0.5, 1)',
      },

      shadow: {
        float: '0 6px 16px 0 rgb(0 0 0 / 8%), 0 3px 6px -4px rgb(0 0 0 / 12%), 0 9px 28px 8px rgb(0 0 0 / 5%);',
      },
    },

    variants: [
      (matcher) => {
        if (matcher.startsWith('pohon:')) {
          return {
            matcher: matcher.replace('pohon:', 'uno-layer-pohon:'),
          };
        }

        if (matcher.startsWith('p-variant:')) {
          return {
            matcher: matcher.replace('p-variant:', 'uno-layer-p-variant:'),
          };
        }
      },
    ],
  };
});
