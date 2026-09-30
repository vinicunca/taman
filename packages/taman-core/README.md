# @vinicunca/taman-core

Foundation layer of Taman: utilities, constants, color helpers, storage
cache, a shared store, typings, Vue composables and the preferences system.
ESM only.

```sh
pnpm add @vinicunca/taman-core vue
# only needed for the route/menu typings
pnpm add vue-router
```

`vue` (^3.5) is a peer dependency; `vue-router` (^5) is an optional peer used
by `@vinicunca/taman-core/typings`.

With `skipLibCheck: false`, dependencies' own type declarations also need
`@types/web-bluetooth` (listed in `compilerOptions.types`),
`vue-component-type-helpers`, and `ESNext` in `compilerOptions.lib` (for
`Temporal`) — required by `@vueuse/core` and `akar`, not by this package.

## Entry points

| Import | Contents |
| --- | --- |
| `@vinicunca/taman-core/utils` | DOM, tree, date, diff, download, merge, window helpers; re-exports `@vinicunca/perkakas` |
| `@vinicunca/taman-core/constants` | Layout CSS variable names, element ids |
| `@vinicunca/taman-core/color` | Color conversion and palette generation |
| `@vinicunca/taman-core/cache` | `StorageManager` with local-storage, IndexedDB and memory drivers |
| `@vinicunca/taman-core/store` | Store primitives on `@tanstack/vue-store` |
| `@vinicunca/taman-core/global-state` | `globalShareState` for components and message handlers shared across packages |
| `@vinicunca/taman-core/typings` | Menu, tab, layout and route types; `RouteMeta` augmentation for `vue-router` |
| `@vinicunca/taman-core/composables` | Layout, scroll lock, breakpoints, sortable and locale composables |
| `@vinicunca/taman-core/preferences` | `initPreferences`, `usePreferences`, `defineOverridesPreferences` |

Importing `@vinicunca/taman-core/typings` (or listing it in
`compilerOptions.types`) also augments `vue-router`'s `RouteMeta` with the
Taman route fields.

## Role names

Route `authority` and menu generation use `TamanRoleName`, which is `string`
by default. Narrow it to your app's roles once, in any `.d.ts` file your
project includes:

```ts
declare module '@vinicunca/taman-core/typings' {
  interface TamanRoleRegistry {
    role: 'admin' | 'user';
  }
}
```

Unknown role names in `authority` then fail to type-check.
