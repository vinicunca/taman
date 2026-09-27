# Node utilities

ESM-only helpers for Node.js build scripts. This package is still private;
its public name and release destination have not been selected.
TypeScript consumers need TypeScript and `@types/node` in their own project,
with `compilerOptions.types: ["node"]` (included in our Node tsconfig presets).

```ts
import { getPackages, toPosixPath } from "@vinicunca/node-utils";

const { packages } = await getPackages("/path/to/pnpm/workspace");
console.log(packages.map((pkg) => pkg.packageJson.name));
console.log(toPosixPath(String.raw`src\index.ts`));
```

## Supported helpers

- `findMonorepoRoot(cwd?)`: walks upward to the nearest directory containing
  `pnpm-workspace.yaml` or `pnpm-lock.yaml`. Throws if neither is found.
- `getPackages(cwd?)` / `getPackagesSync(cwd?)`: discover packages from that
  root through `@manypkg/get-packages`. The default cwd is `process.cwd()`.
  These wrappers intentionally target pnpm, not arbitrary workspace managers.
- `getStagedFiles()`: absolute paths of added/copied/modified/renamed staged
  files in the current Git checkout. Logs and returns `[]` if Git fails.
- `generatorContentHash(content, length?)`: MD5 content fingerprint, optionally
  truncated. For build caching only, not passwords or security decisions.
- `formatNow(format)`: local time using `YYYY`, `MM`, `DD`, `HH`, `mm`, `ss`.
- `toPosixPath(path)`: replaces backslashes with forward slashes.
- `ensureFile(path)`: creates parent directories and an empty file if missing;
  preserves existing content.
- `outputJSON(path, data, spaces = 2)` / `readJSON(path)`: JSON file I/O.
  Read results are not schema-validated; callers must validate untrusted data.
- `UNICODE`: success/failure symbols used by repository tooling.

## Existing consumer compatibility

The explicit aliases `colors` (chalk), `consola`, `execa`, `fs`
(`node:fs/promises`), and `readPackageJSON`, plus `Package` and `PackageJson`
types, remain for existing consumers. Prefer direct upstream imports in new
code. No wildcard third-party API is exported.

The unused `spinner`, `getPackage`, and `rimraf` exports were removed before
public release. Missing workspace roots now throw instead of returning an
empty string. No existing in-repository consumer needs those removed exports.

## Verification and release preparation

Run `pnpm -C internal/node-utils test` and `pnpm -C internal/node-utils build`.
Tests run in Node without the application's browser plugins. Build output
includes JavaScript and declarations; declaration imports use `.js` extensions
so native NodeNext TypeScript consumers can resolve them.

Before publishing: choose the public name, migrate workspace consumers, confirm
the supported Node range against dependency requirements, preserve applicable
upstream license notices, and install a packed artifact into a fresh consumer.
Use pnpm packing to resolve `catalog:` dependencies to release versions.
