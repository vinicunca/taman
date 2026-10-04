# @vinicunca/taman-ui

Unstyled Vue components for Taman on [pohon-ui](https://vinicunca.dev/pohon):
base components, dialogs and drawers, layout, menu, tabs and forms. Styling is
the consumer's job, the way shadcn works: the package ships no CSS, theme or
preset. ESM only; built for Vite.

```sh
pnpm add @vinicunca/taman-ui @vinicunca/taman-core pohon-ui vue \
  @internationalized/date @internationalized/number
```

Peer dependencies: `vue` (^3.5), `pohon-ui` (^2.0.0-rc7.9),
`@internationalized/date` and `@internationalized/number` (^3).

## Setup

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue';
import vitePohon from 'pohon-ui/vite';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue(), UnoCSS(), vitePohon({ scanPackages: ['@vinicunca/taman-ui'] })],
  optimizeDeps: { exclude: ['pohon-ui', '@vinicunca/taman-ui'] },
  resolve: { dedupe: ['pohon-ui', 'vue'] },
});
```

```ts
// uno.config.ts
import { TAMAN_UI_CONTENT } from '@vinicunca/taman-ui/unocss';
import { defineConfig } from 'unocss';

export default defineConfig({
  content: {
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/, TAMAN_UI_CONTENT],
    },
  },
  presets: [/* your preset */],
});
```

`TAMAN_UI_CONTENT` lets UnoCSS see the classes inside the compiled
components; without it they render with none of their own utilities.

## Styling

Pick one:

- **pohon's default look** — leave pohon's `theme.unstyled` at its default
  and follow pohon's [installation guide](https://vinicunca.dev/pohon/getting-started/installation/vue).
- **Your own design** — set `theme: { unstyled: true }` and pass your own
  `ui` config to `vitePohon`. Taman's admin template (planned) ships its
  design this way.

Components use plain utilities plus a small theme contract. Define these in
your UnoCSS theme; anything left undefined simply has no effect:

- **Colors:** `background` (`-elevated`, `-header`, `-muted`, `-sidebar`,
  `-sidebar-deep`, `-accented`), `border`, `text` (`-highlighted`, `-muted`),
  `primary` (`-foreground`), `error`, `info`, `success`, `warning`, `float`,
  `ring`.
- **Animations:** `fade-in-0`, `fade-out-0`, `slide-in-from-*`,
  `slide-out-to-*`.
- **Shortcuts:** `flex-center`, `flex-col-center`, `z-popup`.
- **Variant:** `pohon:` (used by the tab and dialog buttons).
- **Hook classes** for rules that need plain CSS: `tabs-chrome__item`,
  `tabs-chrome__divider`, `tabs-chrome__background(-content)`,
  `taman-scrollbar` with `left-shadow` / `right-shadow` / `both-shadow`,
  `scrollbar-top-shadow`, `scrollbar-bottom-shadow`, and the
  `mobile-sidebar-mask` transition.

## Entry points

| Import | Contents |
| --- | --- |
| `@vinicunca/taman-ui` | Base components (`TamanScrollbar`, `TamanInputDate`, `TamanFileUpload`, `TamanIcon`, …) and primitives |
| `@vinicunca/taman-ui/popup` | `useTamanDialog`, `useTamanDrawer`, alerts |
| `@vinicunca/taman-ui/form` | `useTamanForm`, `setupTamanForm`, codecs, `z` — see `src/form/README.md` in the repository |
| `@vinicunca/taman-ui/layout` | `TamanCoreLayout` |
| `@vinicunca/taman-ui/menu` | `TamanMenu`, normal menu |
| `@vinicunca/taman-ui/tabs` | `TamanTabsView`, tab widgets |
| `@vinicunca/taman-ui/unocss` | `TAMAN_UI_CONTENT` (build time) |

## Notes

- Icons such as `lucide:*` load the same way as your app's own. If you enable
  pohon's `icon.clientBundle.scan`, list the icons the package uses in
  `icon.clientBundle.icons`.
- `skipLibCheck: false` is not supported: pohon-ui's own type declarations
  do not type-check in strict mode.
