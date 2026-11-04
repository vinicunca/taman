// @vitest-environment node
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { it, onTestFinished } from 'vitest';
import { classifyReleaseChanges, isMetadataOnly } from './release-changes.mjs';

const manifest = {
  name: '@vinicunca/taman-core',
  version: '0.1.2',
  scripts: { prepack: 'pnpm build' },
};
const bump = { ...manifest, version: '0.1.3' };
const modified = { status: 'M', oldMode: '100644', newMode: '100644' };
const packageChange = { ...modified, path: 'packages/taman-core/package.json' };
const metadataChanges = [
  packageChange,
  { ...modified, path: 'packages/taman-core/CHANGELOG.md' },
  {
    status: 'D',
    oldMode: '100644',
    newMode: '000000',
    path: '.changeset/cached-pages.md',
  },
];
function readManifest(revision) {
  return revision === 'base'
    ? manifest
    : bump;
}

it('accepts a version bump, changelog, and consumed changeset', () => {
  assert.equal(isMetadataOnly(metadataChanges, readManifest), true);
  assert.equal(isMetadataOnly([
    packageChange,
    {
      status: 'A',
      oldMode: '000000',
      newMode: '100644',
      path: 'packages/taman-core/CHANGELOG.md',
    },
  ], readManifest), true);
});

it('requires a version bump rather than only changelog or changeset edits', () => {
  assert.equal(isMetadataOnly([], readManifest), false);
  assert.equal(isMetadataOnly(metadataChanges.slice(1), readManifest), false);
});

for (const path of [
  'packages/taman-core/src/index.ts',
  '.github/workflows/release.yml',
  '.github/scripts/release-changes.mjs',
  'pnpm-lock.yaml',
  '.changeset/config.json',
  '.changeset/README.md',
]) {
  it(`requires full checks for changes to ${path}`, () => {
    assert.equal(isMetadataOnly([
      ...metadataChanges,
      { ...modified, path },
    ], readManifest), false);
  });
}

it('rejects added changesets, deleted changelogs and added manifests', () => {
  for (const [path, status] of [
    ['.changeset/new.md', 'A'],
    ['packages/taman-core/CHANGELOG.md', 'D'],
    ['packages/new/package.json', 'A'],
  ]) {
    assert.equal(isMetadataOnly([
      ...metadataChanges,
      {
        path,
        status,
        oldMode: status === 'A'
          ? '000000'
          : '100644',
        newMode: status === 'D'
          ? '000000'
          : '100644',
      },
    ], readManifest), false);
  }
});

it('rejects dependency, lifecycle, publishing and other manifest edits', () => {
  for (const extra of [
    {
      dependencies: { vue: '^3.5.0' },
    },
    {
      scripts: { prepack: 'unexpected command' },
    },
    {
      publishConfig: { access: 'restricted' },
    },
    { name: '@other/package' },
    { private: true },
  ]) {
    assert.equal(isMetadataOnly(metadataChanges, (revision) => revision === 'base'
      ? manifest
      : {
          ...bump,
          ...extra,
        }), false);
  }
  assert.equal(isMetadataOnly(metadataChanges, (revision) => ({
    ...(revision === 'base'
      ? manifest
      : bump),
    private: true,
  })), false);
});

it('accepts only increases between stable versions', () => {
  for (const version of [
    '0.1.2',
    '0.1.1',
    '0.0.9',
    '0.1.3-beta.0',
    '01.2.3',
    '',
    null,
    42,
  ]) {
    assert.equal(isMetadataOnly(metadataChanges, (revision) => revision === 'base'
      ? manifest
      : { ...bump, version }), false);
  }
  for (const version of ['0.1.3', '0.2.0', '1.0.0']) {
    assert.equal(isMetadataOnly(metadataChanges, (revision) => revision === 'base'
      ? manifest
      : { ...bump, version }), true);
  }
});

it('rejects permission changes, symlinks and renames', () => {
  for (const change of [
    { newMode: '100755' },
    { newMode: '120000' },
    { oldMode: '100755' },
    { status: 'R100' },
  ]) {
    assert.equal(isMetadataOnly([
      {
        ...packageChange,
        ...change,
      },
    ], readManifest), false);
  }
});

it('reads the entire Git diff and falls back for source edits or missing history', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'release-changes-test-'));
  onTestFinished(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  git('init');
  git('config', 'user.name', 'Release test');
  git('config', 'user.email', 'release-test@example.invalid');
  git('config', 'commit.gpgsign', 'false');
  mkdirSync(join(cwd, 'packages/taman-core'), { recursive: true });
  writeFileSync(join(cwd, packageChange.path), JSON.stringify(manifest));
  git('add', '.');
  git('commit', '-m', 'base');
  const base = git('rev-parse', 'HEAD');
  writeFileSync(join(cwd, packageChange.path), JSON.stringify(bump));
  git('add', '.');
  git('commit', '-m', 'version');

  const context = {
    cwd,
    repository: 'vinicunca/taman',
    eventName: 'pull_request',
    event: {
      pull_request: {
        head: {
          ref: 'changeset-release/main',
          repo: { full_name: 'vinicunca/taman' },
        },
        base: { ref: 'main', sha: base },
      },
    },
  };
  assert.equal(classifyReleaseChanges(context), true);
  for (const eventName of ['push', 'workflow_dispatch', 'pull_request_target']) {
    assert.equal(classifyReleaseChanges({ ...context, eventName }), false);
  }
  for (const head of [
    {
      ref: 'feature',
      repo: { full_name: 'vinicunca/taman' },
    },
    {
      ref: 'changeset-release/main',
      repo: { full_name: 'fork/taman' },
    },
  ]) {
    assert.equal(classifyReleaseChanges({
      ...context,
      event: {
        pull_request: { ...context.event.pull_request, head },
      },
    }), false);
  }
  assert.equal(classifyReleaseChanges({ ...context, event: {} }), false);
  assert.equal(classifyReleaseChanges({ ...context, repository: '' }), false);
  for (const sha of [
    'f'.repeat(40),
    '--invalid',
  ]) {
    assert.equal(classifyReleaseChanges({
      ...context,
      event: {
        pull_request: {
          ...context.event.pull_request,
          base: { ref: 'main', sha },
        },
      },
    }), false);
  }

  writeFileSync(join(cwd, 'packages/taman-core/index.ts'), 'export const changed = true;');
  git('add', '.');
  git('commit', '-m', 'source edit');
  assert.equal(classifyReleaseChanges(context), false);
});
