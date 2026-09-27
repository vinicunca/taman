# @vinicunca/vite-config

Opinionated Vite config for Vue applications and libraries: Vue + JSX,
UnoCSS, vue-i18n, HTML minification, a license banner, build metadata, an app
loading screen, and optional PWA, compression, archiving and bundle analysis.

```sh
pnpm add -D @vinicunca/vite-config vite unocss
```

`vite` (^8) and `unocss` (^66) are peer dependencies: the app owns their
versions and its own `uno.config.ts`.

## Usage

```ts
// vite.config.ts
import { defineConfig } from '@vinicunca/vite-config';

export default defineConfig(async () => ({
  application: {
    licenseOptions: { copyright: 'Copyright (C) 2026 Acme' },
    printInfoMap: { Docs: 'https://docs.example.com' },
  },
  vite: {
    server: { warmup: { clientFiles: ['./src/main.ts'] } },
  },
}));
```

`defineConfig` builds an application config when the project has an
`index.html`, otherwise a library config. Pass `'application'` or `'library'`
as the second argument to choose explicitly. The `vite` object is merged last
with Vite's `mergeConfig`, so arrays such as `server.warmup.clientFiles` are
appended to the defaults, not replaced.

## Application options

Precedence is: package defaults, then environment variables, then
`application`. Boolean environment variables read as `false` when unset, so
the features marked "env" are off unless the variable is `true` or the option
is set in `application`.

| Option | Default | Notes |
| --- | --- | --- |
| `archiver` / `archiverPluginOptions` | env `VITE_ARCHIVER` | Zips `dist` after build (`name`, `outputDir`). |
| `compress` / `compressTypes` | env `VITE_COMPRESS` | Comma list of `gzip`, `brotli`; build only. |
| `devtools` | env `VITE_DEVTOOLS` | Vue DevTools; dev server only. |
| `extraAppConfig` | `true` | Build only; see runtime contracts. |
| `html` | `true` | `true` or html-minifier-terser options. |
| `i18n` | `true` | `@intlify/unplugin-vue-i18n`, composition-only runtime. |
| `importmap` / `importmapOptions` | off | Loads `vue`, `pinia`, `vue-router`, `vue-demi` from a CDN; build only. |
| `injectAppLoading` | env `VITE_INJECT_APP_LOADING` | Loading screen from `./loading.html`, or the bundled default. |
| `injectMetadata` | `true` | Defines `__TAMAN_METADATA__` and `import.meta.env.VITE_APP_VERSION`. |
| `license` / `licenseOptions` | `true` | Banner on entry chunks; see below. |
| `print` / `printInfoMap` | dev only | Extra lines printed under the dev server URLs. |
| `pwa` / `pwaOptions` | env `VITE_PWA` | `vite-plugin-pwa`; `pwaOptions` is merged with the defaults. |
| `visualizer` | env `VITE_VISUALIZER` | `rollup-plugin-visualizer` report after build. |

`licenseOptions` fields (`name`, `author`, `copyright`, `license`, `contact`)
fall back to the app's `package.json` (`name`, `author`, `license`,
`author.email`); empty fields are left out of the banner. The PWA manifest
`name` and `short_name` come from `VITE_APP_TITLE`, falling back to the
`package.json` name.

Other environment variables: `VITE_BASE` (default `/`), `VITE_PORT` (default
`5173`), `VITE_APP_TITLE`, and `VITE_APP_NAMESPACE` (loading-screen theme key).
Variables are read from `.env`, `.env.local`, `.env.[mode]` and
`.env.[mode].local` in the project root.

## Runtime contracts

These names are read by the Taman packages and must stay in sync with them:

- `window._TAMAN_ADMIN_DEV_CONFIG_`: in production builds, `VITE_GLOB_*`
  variables are emitted to `_app-config-[version]-[hash].js` and loaded before
  the app, so they can be changed after the build without rebuilding.
- `__TAMAN_METADATA__`: author, version, build time and dependency versions.
  Inside a pnpm workspace, dependencies of every workspace package are listed
  with `catalog:` and `workspace:` versions resolved; elsewhere, the project's
  own `package.json` dependencies are used.
- Loading screen: markup carries `data-app-loading`, and the dark-mode check
  reads `localStorage["${VITE_APP_NAMESPACE}-${version}-${dev|prod}-preferences-theme"]`.

## Library options

Library mode builds `src/index.ts` to `dist/index.mjs` (ES only) and
externalizes everything in `dependencies` and `peerDependencies`. Options:
`dts` (default `false`; `true` or `unplugin-dts` options), `injectMetadata`,
`devtools`, `visualizer`.
