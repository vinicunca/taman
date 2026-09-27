import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { findMonorepoRoot, getPackages, getPackagesSync } from '../monorepo';

const fixtures: string[] = [];
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'node-utils-workspace-'));
  fixtures.push(root);
  return root;
}
afterEach(() => {
  for (const root of fixtures.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('pnpm workspace discovery', () => {
  it('finds a workspace before a lockfile has been generated', () => {
    const root = fixture();
    writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages: []\n');
    const nested = join(root, 'nested');
    mkdirSync(nested);
    expect(findMonorepoRoot(nested)).toBe(root);
  });
  it('fails explicitly outside a workspace', async () => {
    const root = fixture();
    expect(() => findMonorepoRoot(root)).toThrow('pnpm workspace');
    expect(() => getPackagesSync(root)).toThrow('pnpm workspace');
    await expect(getPackages(root)).rejects.toThrow('pnpm workspace');
  });
  it('accepts an explicit cwd for sync and async discovery', async () => {
    const root = fixture();
    writeFileSync(join(root, 'package.json'), '{"name":"fixture","private":true}');
    writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
    const child = join(root, 'packages', 'child');
    mkdirSync(child, { recursive: true });
    writeFileSync(join(child, 'package.json'), '{"name":"fixture-child","version":"1.0.0"}');
    expect(getPackagesSync(child).packages.map(pkg => pkg.packageJson.name)).toContain('fixture-child');
    expect((await getPackages(child)).packages.map(pkg => pkg.packageJson.name)).toContain('fixture-child');
  });
});
