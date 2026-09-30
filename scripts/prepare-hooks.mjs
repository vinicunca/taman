// `prepare` hook: installs lefthook's git hooks only when this folder is its
// own git repository. Skips CI, a project generated with `--no-git`, and a
// folder nested inside another repository (whose hooks must not change).
import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import process from 'node:process';

if (process.env.CI) {
  process.exit(0);
}

let topLevel;
try {
  topLevel = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
} catch {
  process.exit(0);
}

if (realpathSync(topLevel) !== realpathSync(process.cwd())) {
  process.exit(0);
}

execFileSync('pnpm', ['exec', 'lefthook', 'install'], { stdio: 'inherit' });
