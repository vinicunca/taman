import { presetVinicunca } from '@vinicunca/unocss-preset';
import { definePreset } from 'unocss';
import { BRANDS } from '../constants';
import { animations } from './uno.animations';
import { preflights } from './uno.preflights';

// eslint-disable-next-line no-template-curly-in-string
const COLOR_PLACEHOLDER = '${color}';
const TOKEN_PATTERN = /[^\s`]+/g;

export const presetCore = definePreset(() => {
  // @keep-sorted
  return {

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
      'pohon': 100,
      'p-variant': 200,
    },

    name: 'uno-preset-core',

    preflights,

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
          dimmed: 'var(--ui-text-dimmed)',
          muted: 'var(--ui-text-muted)',
          toned: 'var(--ui-text-toned)',
          DEFAULT: 'var(--ui-text)',
          highlighted: 'var(--ui-text-highlighted)',
          inverted: 'var(--ui-text-inverted)',
        },
        background: {
          DEFAULT: 'var(--ui-bg)',
          muted: 'var(--ui-bg-muted)',
          elevated: 'var(--ui-bg-elevated)',
          accented: 'var(--ui-bg-accented)',
          inverted: 'var(--ui-bg-inverted)',
          border: 'var(--ui-border)',
        },
        border: {
          DEFAULT: 'var(--ui-border)',
          muted: 'var(--ui-border-muted)',
          accented: 'var(--ui-border-accented)',
          inverted: 'var(--ui-border-inverted)',
          bg: 'var(--ui-bg)',
        },
        ring: {
          DEFAULT: 'var(--ui-border)',
          muted: 'var(--ui-border-muted)',
          accented: 'var(--ui-border-accented)',
          inverted: 'var(--ui-border-inverted)',
          bg: 'var(--ui-bg)',
          offset: {
            DEFAULT: 'var(--ui-border)',
            muted: 'var(--ui-border-muted)',
            accented: 'var(--ui-border-accented)',
            inverted: 'var(--ui-border-inverted)',
            bg: 'var(--ui-bg)',
          },
        },
        divide: {
          DEFAULT: 'var(--ui-border)',
          muted: 'var(--ui-border-muted)',
          accented: 'var(--ui-border-accented)',
          inverted: 'var(--ui-border-inverted)',
        },
        outline: {
          DEFAULT: 'var(--ui-border)',
          inverted: 'var(--ui-border-inverted)',
        },
        stroke: {
          DEFAULT: 'var(--ui-border)',
          inverted: 'var(--ui-border-inverted)',
        },
        fill: {
          DEFAULT: 'var(--ui-border)',
          inverted: 'var(--ui-border-inverted)',
        },
        primary: {
          DEFAULT: 'var(--ui-primary)',
          50: 'var(--ui-color-primary-50)',
          100: 'var(--ui-color-primary-100)',
          200: 'var(--ui-color-primary-200)',
          300: 'var(--ui-color-primary-300)',
          400: 'var(--ui-color-primary-400)',
          500: 'var(--ui-color-primary-500)',
          600: 'var(--ui-color-primary-600)',
          700: 'var(--ui-color-primary-700)',
          800: 'var(--ui-color-primary-800)',
          900: 'var(--ui-color-primary-900)',
          950: 'var(--ui-color-primary-950)',
        },
        secondary: {
          DEFAULT: 'var(--ui-secondary)',
          50: 'var(--ui-color-secondary-50)',
          100: 'var(--ui-color-secondary-100)',
          200: 'var(--ui-color-secondary-200)',
          300: 'var(--ui-color-secondary-300)',
          400: 'var(--ui-color-secondary-400)',
          500: 'var(--ui-color-secondary-500)',
          600: 'var(--ui-color-secondary-600)',
          700: 'var(--ui-color-secondary-700)',
          800: 'var(--ui-color-secondary-800)',
          900: 'var(--ui-color-secondary-900)',
          950: 'var(--ui-color-secondary-950)',
        },
        success: {
          DEFAULT: 'var(--ui-success)',
          50: 'var(--ui-color-success-50)',
          100: 'var(--ui-color-success-100)',
          200: 'var(--ui-color-success-200)',
          300: 'var(--ui-color-success-300)',
          400: 'var(--ui-color-success-400)',
          500: 'var(--ui-color-success-500)',
          600: 'var(--ui-color-success-600)',
          700: 'var(--ui-color-success-700)',
          800: 'var(--ui-color-success-800)',
          900: 'var(--ui-color-success-900)',
          950: 'var(--ui-color-success-950)',
        },
        info: {
          DEFAULT: 'var(--ui-info)',
          50: 'var(--ui-color-info-50)',
          100: 'var(--ui-color-info-100)',
          200: 'var(--ui-color-info-200)',
          300: 'var(--ui-color-info-300)',
          400: 'var(--ui-color-info-400)',
          500: 'var(--ui-color-info-500)',
          600: 'var(--ui-color-info-600)',
          700: 'var(--ui-color-info-700)',
          800: 'var(--ui-color-info-800)',
          900: 'var(--ui-color-info-900)',
          950: 'var(--ui-color-info-950)',
        },
        warning: {
          DEFAULT: 'var(--ui-warning)',
          50: 'var(--ui-color-warning-50)',
          100: 'var(--ui-color-warning-100)',
          200: 'var(--ui-color-warning-200)',
          300: 'var(--ui-color-warning-300)',
          400: 'var(--ui-color-warning-400)',
          500: 'var(--ui-color-warning-500)',
          600: 'var(--ui-color-warning-600)',
          700: 'var(--ui-color-warning-700)',
          800: 'var(--ui-color-warning-800)',
          900: 'var(--ui-color-warning-900)',
          950: 'var(--ui-color-warning-950)',
        },
        error: {
          DEFAULT: 'var(--ui-error)',
          50: 'var(--ui-color-error-50)',
          100: 'var(--ui-color-error-100)',
          200: 'var(--ui-color-error-200)',
          300: 'var(--ui-color-error-300)',
          400: 'var(--ui-color-error-400)',
          500: 'var(--ui-color-error-500)',
          600: 'var(--ui-color-error-600)',
          700: 'var(--ui-color-error-700)',
          800: 'var(--ui-color-error-800)',
          900: 'var(--ui-color-error-900)',
          950: 'var(--ui-color-error-950)',
        },
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
