import { colors } from '@unocss/preset-wind4/colors';
import { POHON_BRANDS } from '../constants';

export const baseColors = `
  :root, :host, .light {
    --ui-text-dimmed: ${colors.neutral[400]};
    --ui-text-muted: ${colors.neutral[500]};
    --ui-text-toned: ${colors.neutral[600]};
    --ui-text: ${colors.neutral[700]};
    --ui-text-highlighted: ${colors.neutral[900]};
    --ui-text-inverted: ${colors.white};

    --ui-bg: ${colors.white};
    --ui-bg-muted: ${colors.neutral[50]};
    --ui-bg-elevated: ${colors.neutral[100]};
    --ui-bg-accented: ${colors.neutral[200]};
    --ui-bg-inverted: ${colors.neutral[900]};
    --ui-bg-sidebar: ${colors.white};
    --ui-bg-sidebar-deep: ${colors.white};
    --ui-bg-header: ${colors.white};

    --ui-border: ${colors.neutral[200]};
    --ui-border-muted: ${colors.neutral[200]};
    --ui-border-accented: ${colors.neutral[300]};
    --ui-border-inverted: ${colors.neutral[900]};

    --ui-z-popup: 2000;
    --ui-z-toaster: 3000;
  }

  .dark {
    --ui-text-dimmed: ${colors.neutral[500]};
    --ui-text-muted: ${colors.neutral[400]};
    --ui-text-toned: ${colors.neutral[300]};
    --ui-text: ${colors.neutral[200]};
    --ui-text-highlighted: white;
    --ui-text-inverted: ${colors.neutral[900]};

    --ui-bg: ${colors.neutral[900]};
    --ui-bg-muted: ${colors.neutral[800]};
    --ui-bg-elevated: ${colors.neutral[800]};
    --ui-bg-accented: ${colors.neutral[700]};
    --ui-bg-inverted: ${colors.white};
    --ui-bg-sidebar: oklch(0.2347 0.0093 267.6);
    --ui-bg-sidebar-deep: oklch(0.1996 0.0086 264.36);
    --ui-bg-header: oklch(0.2347 0.0093 267.6);

    --ui-border: ${colors.neutral[800]};
    --ui-border-muted: ${colors.neutral[700]};
    --ui-border-accented: ${colors.neutral[700]};
    --ui-border-inverted: ${colors.white};
  }
`;

const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

function generateShades(key: string, value: string) {
  return `${shades.map((shade) =>
    `--ui-color-${key}-${shade}: var(--color-${value}-${shade}, ${getColor(value as keyof typeof colors, shade)});`)
    .join('\n  ')}`;
}

function getColor(color: keyof typeof colors, shade: typeof shades[number]): string {
  if (color in colors && typeof colors[color] === 'object' && shade in colors[color]) {
    return colors[color][shade] as string;
  }
  return '';
}

function generateColor(key: string, shade: number) {
  return `--ui-${key}: var(--ui-color-${key}-${shade});`;
}

const shadeColors = Object
  .entries(POHON_BRANDS)
  .map(([key, value]) =>
    generateShades(key, value),
  )
  .join('\n  ');

const {
  neutral,
  ...uiColors
} = POHON_BRANDS;

export const brandColors = `
:root, :host {
  ${shadeColors}
}

:root, :host, .light {
  ${Object.keys(uiColors).map((key) => generateColor(key, 500)).join('\n  ')}
}

.dark {
  ${Object.keys(uiColors).map((key) => generateColor(key, 400)).join('\n  ')}
}
`;
