// Generates a project from this checkout the way `create-taman` does, then
// proves it installs, builds, type-checks, tests and lints. Published
// packages are packed from this commit, so unpublished changes are covered.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import process from 'node:process';

// Problems in the user's in-progress tabs work. Remove each entry when that
// work lands; the script fails if an entry no longer occurs, so this list
// cannot go stale.
const KNOWN_TYPE_ERRORS = [
  'packages/shell/layouts/src/core/tabbar/layout-core-tabbar.vue(58,37): error TS2339: Property \'styleType\' does not exist on type \'TabbarPreferences\'.',
];
const LINT_SKIP = ['packages/shell/layouts/src/core/tabbar/layout-core-tabbar.vue'];

const root = process.cwd();
const work = mkdtempSync(join(tmpdir(), 'template-smoke-'));
const packs = join(work, 'packs');
const project = join(work, 'acme-app');
const env = { ...process.env };

function run(command, args, cwd = root, options = {}) {
  console.log(`\n$ ${command} ${args.join(' ')}  (in ${relative(root, cwd) || '.'})`);
  return execFileSync(command, args, { cwd, encoding: 'utf8', env, stdio: 'inherit', ...options });
}

function capture(command, args, cwd) {
  try {
    return { output: execFileSync(command, args, { cwd, encoding: 'utf8', env, stdio: ['ignore', 'pipe', 'pipe'] }), status: 0 };
  } catch (error) {
    return { output: `${error.stdout ?? ''}${error.stderr ?? ''}`, status: error.status ?? 1 };
  }
}

function walk(dir, visit) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.output', '.nx', '.git', '.pohon-ui'].includes(entry.name)) {
      continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, visit);
    } else {
      visit(full);
    }
  }
}

// 1. Pack every publishable package (each builds in `prepack`)
mkdirSync(packs);
const publishable = JSON.parse(execFileSync('pnpm', ['ls', '-r', '--depth', '-1', '--json'], { cwd: root, encoding: 'utf8' }))
  .filter((pkg) => pkg.name && !pkg.private);
for (const pkg of publishable) {
  run('pnpm', ['pack', '--pack-destination', packs], pkg.path, { stdio: ['ignore', 'ignore', 'inherit'] });
}
const tarballs = readdirSync(packs).map((file) => {
  const manifest = JSON.parse(execFileSync('tar', ['-xzOf', join(packs, file), 'package/package.json'], { encoding: 'utf8' }));
  return [manifest.name, join(packs, file)];
});

// 2. Generate from the committed HEAD
run('node', [join(root, 'packages/create-taman/dist/bin.mjs'), project, '--from', root, '--scope', 'acme', '--yes', '--no-install', '--no-git']);

// 3. Resolve published packages from the tarballs instead of npm
const workspaceFile = join(project, 'pnpm-workspace.yaml');
// Merge into the `overrides:` block in sorted order (the project lints its YAML keys)
const lines = readFileSync(workspaceFile, 'utf8').split('\n');
const start = lines.indexOf('overrides:');
let end = start + 1;
while (end < lines.length && lines[end].startsWith('  ')) {
  end++;
}
const keyOf = (line) => line.trim().split(': ')[0].replace(/^'|'$/g, '');
const block = [...lines.slice(start + 1, end), ...tarballs.map(([name, file]) => `  ${/^[\w-]+$/.test(name) ? name : `'${name}'`}: file:${file}`)]
  .sort((a, b) => (keyOf(a) < keyOf(b) ? -1 : 1));
lines.splice(start + 1, end - start - 1, ...block);
writeFileSync(workspaceFile, lines.join('\n'));

// 4. Install the way a user does (not in CI, no git repo: `prepare` must
// cope), then the root build (web first generates the types vue-tsc needs)
run('pnpm', ['install'], project, { env: { ...env, CI: '' } });
run('pnpm', ['build'], project);

// 5. Type-check every tsconfig
const tsconfigs = [];
walk(project, (file) => file.endsWith('/tsconfig.json') && tsconfigs.push(file));
const typeErrors = new Set();
for (const tsconfig of tsconfigs) {
  const { output } = capture(join(project, 'node_modules/.bin/vue-tsc'), ['--noEmit', '-p', tsconfig], project);
  for (const line of output.split('\n')) {
    if (line.includes('error TS')) {
      // vue-tsc prints paths relative to its cwd, which on macOS may route
      // through /private; keep only the part inside the project.
      typeErrors.add(line.trim().replace(/^.*?acme-app\//, '').replace(/^(?:\.\.\/)+/, ''));
    }
  }
}
const unexpected = [...typeErrors].filter((line) => !KNOWN_TYPE_ERRORS.includes(line));
const stale = KNOWN_TYPE_ERRORS.filter((line) => !typeErrors.has(line));

// 6. Unit tests, then the root lint script. Only allow-listed files may
// report problems; a crash (non-zero exit without file reports) fails.
run('pnpm', ['test:unit'], project);
console.log('\n$ pnpm lint');
const lint = capture('pnpm', ['lint'], project);
const lintedFiles = new Set(
  lint.output.split('\n').filter((line) => line.startsWith('/')).map((line) => line.trim().replace(/^.*?acme-app\//, '')),
);
const lintFailures = [];
if (lint.status !== 0 && lintedFiles.size === 0) {
  lintFailures.push(`pnpm lint failed without reporting a file:\n${lint.output.slice(-2000)}`);
} else if (lint.status !== 0) {
  lintFailures.push(...[...lintedFiles].filter((file) => !LINT_SKIP.includes(file)).map((file) => `lint: ${file}`));
}
const staleLint = LINT_SKIP.filter((file) => !lintedFiles.has(file));

// 7. Nothing template-only may leak into the project
const leaks = [];
walk(project, (file) => {
  if (statSync(file).size > 2_000_000) {
    return;
  }
  const text = readFileSync(file, 'utf8');
  const path = relative(project, file);
  if (text.includes('@taman/')) {
    leaks.push(`${path}: @taman/`);
  }
  if (/talent|ticket|ngibur/i.test(text)) {
    leaks.push(`${path}: ngibur domain word`);
  }
  if (path.includes('views/examples')) {
    leaks.push(`${path}: example gallery`);
  }
});

const failures = [
  ...lintFailures,
  ...staleLint.map((file) => `LINT_SKIP entry no longer reports problems, remove it: ${file}`),
  ...unexpected.map((line) => `type error: ${line}`),
  ...stale.map((line) => `KNOWN_TYPE_ERRORS entry no longer occurs, remove it: ${line}`),
  ...leaks,
];
if (failures.length > 0) {
  console.error(`\n✗ template smoke test failed:\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
console.log(`\n✓ generated project (${project}) installs, builds, type-checks, tests and lints`);
