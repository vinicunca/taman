# @vinicunca/commitlint-config

Shared [commitlint](https://commitlint.js.org) config, also usable as the
[cz-git](https://cz-git.qbb.sh) prompt config for `czg`. Extends
`@commitlint/config-conventional` and restricts scopes to your package names
plus a small set of general scopes.

```sh
pnpm add -D @vinicunca/commitlint-config @commitlint/cli
# optional, for the interactive prompt:
pnpm add -D czg
```

`@commitlint/cli` (^21) is a peer dependency; `czg` is an optional peer.
Install them in the project that runs the commands.

## Usage

```js
// .commitlintrc.js
export { default } from '@vinicunca/commitlint-config';
```

To customize, build the config yourself:

```js
// .commitlintrc.js
import { defineConfig } from '@vinicunca/commitlint-config';

export default defineConfig({ scopes: ['auth', 'deps'] });
```

| Option | Default | Notes |
| --- | --- | --- |
| `cwd` | `process.cwd()` | Where package discovery starts. |
| `scopes` | `project`, `style`, `lint`, `ci`, `dev`, `deploy`, `other` | Replaces the general scopes; package names are always allowed. |

The result is a plain config object, so other fields can be overridden by
spreading it: `{ ...defineConfig(), prompt: { ... } }`.

## Scopes

A scope is optional. When given, it must be a package name or one of the
general scopes:

- Inside a pnpm workspace, every workspace package counts.
- Anywhere else (a single-package, npm or yarn project), the project's own
  `package.json` name counts.
- Scoped names are accepted in full or short form: `@vinicunca/vite-config`
  and `vite-config` are both valid.

## Rules

On top of `config-conventional`: a header of at most 108 characters, a blank
line before the body, and these types: `feat`, `fix`, `perf`, `style`,
`docs`, `test`, `refactor`, `build`, `ci`, `chore`, `revert`, `types`,
`release`. Subject case is not enforced.
