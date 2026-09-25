#!/usr/bin/env bash
# Builds, packs and verifies the published API packages exactly as npm
# consumers will receive them (publishConfig applied), then type-checks a
# throwaway consumer outside the workspace.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$(mktemp -d)"
PACKAGES=(packages/api-contract packages/effects/request)
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
import type { TamanOutputs } from '@vinicunca/taman-api-contract';
import { createTamanClient, isDefinedError, safe } from '@vinicunca/taman-request/orpc';
import { createTamanQueryUtils } from '@vinicunca/taman-request/orpc-query';

const client = createTamanClient({ baseUrl: 'https://api.example.com' });
export async function demo(): Promise<Date | undefined> {
  const page: TamanOutputs['todo']['list'] = await client.todo.list({ page: 1 });
  const [error] = await safe(client.todo.get({ id: page.items[0]!.id }));
  if (isDefinedError(error)) {
    const code: 'NOT_FOUND' = error.code;
    void code;
  }
  void createTamanQueryUtils(client).todo.list.queryOptions({ input: { page: 1 } });
  return page.items[0]?.createdAt;
}
TS

# @tanstack/query-core is @orpc/tanstack-query's real (optional) peer; @opentelemetry/api
# is @orpc/shared's real (optional) peer, whose types are imported at the top of its
# root d.mts and therefore need to resolve even though tracing is never used here.
(cd "$consumer" && npm install --silent --no-audit --no-fund "${TARBALLS[@]}" @tanstack/query-core @opentelemetry/api typescript >/dev/null && npx tsc -p .)

echo "API packages OK. Artifacts in $OUT"
