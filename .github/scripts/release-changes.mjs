// Keep version PR checks cheap, but fall back to full verification for any
// change outside the metadata Changesets normally writes. Pushes never skip.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

function isVersionBump(before, after) {
  const stableVersion = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
  if (typeof before !== 'string' || typeof after !== 'string'
    || !stableVersion.test(before) || !stableVersion.test(after)) {
    return false;
  }
  const previous = before.split('.').map(BigInt);
  const next = after.split('.').map(BigInt);
  const changed = next.findIndex((part, index) => part !== previous[index]);
  return changed !== -1 && next[changed] > previous[changed];
}

export function isMetadataOnly(changes, readManifest) {
  let bumped = false;
  for (const { path, status, oldMode, newMode } of changes) {
    // Reject symlinks, executable files, renames and permission changes.
    if (oldMode !== (status === 'A'
      ? '000000'
      : '100644')
    || newMode !== (status === 'D'
      ? '000000'
      : '100644')) {
      return false;
    }
    if (status === 'D' && /^\.changeset\/(?!README\.md$)[\w-]+\.md$/.test(path)) {
      continue;
    }
    if (['A', 'M'].includes(status) && /^(?:packages|internal)\/.+\/CHANGELOG\.md$/.test(path)) {
      continue;
    }
    if (status !== 'M' || !/^(?:packages|internal)\/.+\/package\.json$/.test(path)) {
      return false;
    }
    const before = readManifest('base', path);
    const after = readManifest('head', path);
    if (!before.name || before.private === true || !isVersionBump(before.version, after.version)
      || !isDeepStrictEqual({ ...before, version: null }, { ...after, version: null })) {
      return false;
    }
    bumped = true;
  }
  return bumped;
}

export function classifyReleaseChanges({ eventName, event, repository, cwd = process.cwd() }) {
  const pr = event.pull_request;
  if (eventName !== 'pull_request' || pr?.head?.ref !== 'changeset-release/main'
    || !repository || pr.head.repo?.full_name !== repository || pr.base?.ref !== 'main') {
    return false;
  }

  try {
    const base = pr.base.sha;
    if (!/^[a-f\d]{40}$/.test(base)) {
      return false;
    }
    const git = (args) => execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    // Compare the actual checkout (the PR merge commit) to its base. This
    // includes the effect of integrating the branch with the current main.
    git([
      'merge-base',
      '--is-ancestor',
      base,
      'HEAD',
    ]);
    const entries = git([
      'diff',
      '--raw',
      '--no-renames',
      '-z',
      base,
      'HEAD',
      '--',
    ]).split('\0');
    entries.pop();
    const changes = [];
    for (let index = 0; index < entries.length; index += 2) {
      const match = /^:(\d{6}) (\d{6}) [a-f\d]+ [a-f\d]+ ([AMD])$/.exec(entries[index]);
      if (!match || !entries[index + 1]) {
        return false;
      }
      changes.push({
        oldMode: match[1],
        newMode: match[2],
        status: match[3],
        path: entries[index + 1],
      });
    }
    return isMetadataOnly(changes, (revision, path) => JSON.parse(
      git(['show', `${revision === 'base'
        ? base
        : 'HEAD'}:${path}`]),
    ));
  } catch {
    console.log('Could not validate the release diff; running full checks.');
    return false;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const event = process.env.GITHUB_EVENT_PATH
    ? JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
    : {};
  const metadataOnly = classifyReleaseChanges({
    eventName: process.env.GITHUB_EVENT_NAME,
    event,
    repository: process.env.GITHUB_REPOSITORY,
  });
  console.log(metadataOnly ? 'Validated metadata-only version PR.' : 'Full package and template checks required.');
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `metadata-only=${metadataOnly}\n`);
  }
}
