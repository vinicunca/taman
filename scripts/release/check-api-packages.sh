#!/usr/bin/env bash
# Builds, packs and verifies the published API packages exactly as npm
# consumers will receive them (publishConfig applied), then type-checks a
# throwaway consumer outside the workspace.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$(mktemp -d)"
PACKAGES=(packages/shared/api-contract packages/request)
TARBALLS=()

for pkg in "${PACKAGES[@]}"; do
  pnpm --dir "$ROOT/$pkg" build
  tarball="$(cd "$ROOT/$pkg" && pnpm pack --pack-destination "$OUT" | tail -n 1)"
  TARBALLS+=("$tarball")

  extract="$OUT/extract-$(basename "$pkg")"
  mkdir -p "$extract"
  tar -xzf "$tarball" -C "$extract"
  pnpm exec publint "$extract/package"
  pnpm exec attw "$tarball" --profile esm-only
done

consumer="$OUT/consumer"
mkdir -p "$consumer"
cat > "$consumer/package.json" <<'JSON'
{ "name": "consumer", "private": true, "type": "module" }
JSON
cat > "$consumer/tsconfig.json" <<'JSON'
{ "compilerOptions": { "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "strict": true, "noEmit": true, "skipLibCheck": false, "lib": ["ES2022", "DOM", "DOM.Iterable"], "types": [] }, "include": ["index.ts"] }
JSON
cat > "$consumer/index.ts" <<'TS'
import type { TamanContract, TamanOutputs } from '@vinicunca/taman-api-contract';
import { createRpcClient, isDefinedError, safe, type ContractClient } from '@vinicunca/request/orpc';
import { createRpcQueryUtils } from '@vinicunca/request/orpc-query';

const client = createRpcClient<ContractClient<TamanContract>>({ url: 'https://api.example.com/api/rpc', credentials: 'include' });
export async function demo(): Promise<Date | undefined> {
  const page: TamanOutputs['todo']['list'] = await client.todo.list({ page: 1 });
  const [error] = await safe(client.todo.get({ id: page.items[0]!.id }));
  if (isDefinedError(error)) {
    const code: 'NOT_FOUND' = error.code;
    void code;
  }
  void createRpcQueryUtils(client, { path: ['taman'] }).todo.list.queryOptions({ input: { page: 1 } });
  return page.items[0]?.createdAt;
}

import { createHttpClient, envelopeInterceptor, errorMessageInterceptor, isHttpError, refreshTokenInterceptor } from '@vinicunca/request/http';
import { createHttpQueryUtils } from '@vinicunca/request/http-query';

const http = createHttpClient({ baseURL: 'https://api.example.com', responseReturn: 'data' });
http.addResponseInterceptor(envelopeInterceptor());
http.addResponseInterceptor(refreshTokenInterceptor({ client: http, refresh: async () => 'token', applyToken: (context, token) => context.options.headers.set('authorization', token), onAuthFailure: () => {} }));
http.addResponseInterceptor(errorMessageInterceptor({ notify: () => {} }));
const api = createHttpQueryUtils(http, { key: ['example'] });
export const products = api.get<{ items: Array<{ id: number }> }>('/products').queryOptions({ query: { page: 1 }, select: (page) => page.items });
export const create = api.post<{ id: number }, { title: string }>('/products').mutationOptions();
export async function load(): Promise<number | undefined> {
  try {
    return (await http.get<{ total: number }>('/stats')).total;
  } catch (error) {
    return isHttpError(error) ? error.status : undefined;
  }
}
TS

# @tanstack/query-core is @orpc/tanstack-query's real (optional) peer; @opentelemetry/api
# is @orpc/shared's real (optional) peer, whose types are imported at the top of its
# root d.mts and therefore need to resolve even though tracing is never used here.
# undici is ofetch's own devDependency, whose types ofetch's node.d.mts/index.d.mts
# side-effect-import for global fetch/Headers/etc. augmentation; it must resolve too
# under skipLibCheck: false even though this consumer never calls into undici, and
# undici's own .d.ts files in turn need @types/node (node:url, Buffer, NodeJS, …).
(cd "$consumer" && npm install --silent --no-audit --no-fund "${TARBALLS[@]}" @tanstack/query-core ofetch @opentelemetry/api undici @types/node typescript >/dev/null && npx tsc -p .)

echo "API packages OK. Artifacts in $OUT"
