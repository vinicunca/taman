// Packs every publishable workspace package (no `"private": true`) exactly as
// `pnpm publish` would, then fails on problems npm consumers or trusted
// publishing would hit. Used by the `verify` job in release.yml.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import process from 'node:process';

const EXPECTED_REPOSITORY = 'git+https://github.com/vinicunca/taman.git';
const DEPENDENCY_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies'];

const root = process.cwd();
function run(command, args, options = {}) {
  return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options });
}

const packages = JSON.parse(run('pnpm', ['ls', '-r', '--depth', '-1', '--json']))
  .filter((pkg) => pkg.name && !pkg.private);

let failed = false;

for (const pkg of packages) {
  const problems = [];
  const outDir = mkdtempSync(join(tmpdir(), 'verify-pack-'));
  run('pnpm', ['pack', '--pack-destination', outDir], { cwd: pkg.path });
  const tarball = join(outDir, readdirSync(outDir).find((file) => file.endsWith('.tgz')));
  const manifest = JSON.parse(run('tar', ['-xzOf', tarball, 'package/package.json']));

  // pnpm must have rewritten these; npm cannot install them
  for (const field of DEPENDENCY_FIELDS) {
    for (const [name, range] of Object.entries(manifest[field] ?? {})) {
      if (/^(?:catalog|workspace):/.test(range)) {
        problems.push(`${field}.${name} is still "${range}"`);
      }
    }
  }

  // npm rejects provenance (and so trusted publishing) on a mismatch
  const directory = relative(root, pkg.path);
  if (manifest.repository?.url !== EXPECTED_REPOSITORY) {
    problems.push(`repository.url must be "${EXPECTED_REPOSITORY}"`);
  }
  if (manifest.repository?.directory !== directory) {
    problems.push(`repository.directory must be "${directory}"`);
  }

  try {
    run('pnpm', ['--filter', '@taman/tooling', 'exec', 'publint', 'run', tarball, '--strict']);
  } catch (error) {
    problems.push(`publint:\n${error.stdout || error.message}`);
  }

  if (problems.length > 0) {
    failed = true;
    console.error(`✗ ${pkg.name}@${pkg.version}\n  - ${problems.join('\n  - ')}`);
  } else {
    console.log(`✓ ${pkg.name}@${pkg.version}`);
  }
}

if (packages.length === 0) {
  console.log('No publishable packages.');
}

process.exitCode = failed ? 1 : 0;
