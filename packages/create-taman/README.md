# create-taman

Scaffold a [taman](https://github.com/vinicunca/taman) admin monorepo: a Vue
admin app, a Nitro API on Cloudflare Workers, Postgres with drizzle,
better-auth, RBAC and transactional email.

```bash
pnpm create taman my-app
```

Options: `--scope <name>` (npm scope for workspace packages, default: the
folder name), `--ref <git ref>`, `--no-install`, `--no-git`, `--yes`.

The generated code is yours. Only the published `@vinicunca/*` packages
receive updates.
