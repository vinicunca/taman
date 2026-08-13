# @taman/tooling

Repo-wide maintenance scripts, run directly with [Bun](https://bun.sh) and exposed as [Nx](https://nx.dev) targets (no build step).

## Commands

| Nx target                       | Description                                        |
| ------------------------------- | -------------------------------------------------- |
| `nx run tooling:check-circular` | Scan for circular dependencies                     |
| `nx run tooling:check-dep`      | Find unused dependencies (knip)                    |
| `nx run tooling:publint`        | Check `package.json` files against publint         |
| `nx run tooling:lint`           | Run eslint + stylelint                             |
| `nx run tooling:lint:format`    | Run eslint + stylelint with `--fix`                |

Each entry in `src/*.ts` is a standalone Bun script and can also be run directly, e.g.:

```bash
bun scripts/tooling/src/check-circular.ts --staged --verbose
```
