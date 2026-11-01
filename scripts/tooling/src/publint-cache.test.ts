import { mkdir, mkdtemp, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getPackageHash, readCache } from './publint-cache';

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'taman-publint-'));
  await mkdir(join(dir, 'dist'));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('publint output cache', () => {
  it('invalidates when a declared output is created, changed or deleted', async () => {
    const pkg = { exports: { '.': { import: './dist/index.js' } } };
    const hash = () => getPackageHash(pkg, dir);
    const missing = await hash();
    const file = join(dir, 'dist/index.js');
    await writeFile(file, 'export const a = 1;');
    const created = await hash();
    expect(created).not.toBe(missing);
    expect(await hash()).toBe(created);
    await writeFile(file, 'export const a = 2;');
    await utimes(file, 0, 0);
    const changed = await hash();
    await writeFile(file, 'export const a = 3;');
    await utimes(file, 0, 0);
    expect(await hash()).not.toBe(changed);
    await rm(file);
    expect(await hash()).toBe(missing);
  });

  it('invalidates when wildcard targets gain or lose a match', async () => {
    const pkg = { exports: { './*': './dist/*.js' } };
    const missing = await getPackageHash(pkg, dir);
    await writeFile(join(dir, 'dist/one.js'), 'export {};');
    const first = await getPackageHash(pkg, dir);
    expect(first).not.toBe(missing);
    await writeFile(join(dir, 'dist/two.js'), 'export {};');
    expect(await getPackageHash(pkg, dir)).not.toBe(first);
    await rm(join(dir, 'dist/two.js'));
    expect(await getPackageHash(pkg, dir)).toBe(first);
  });

  it.each(['', 'null', '[]', 'false', '{broken'])('ignores invalid cache content %j', async (content) => {
    const file = join(dir, 'cache.json');
    await writeFile(file, content);
    expect(await readCache(file)).toEqual({});
  });

  it('accepts an absent cache and reads a valid cache', async () => {
    const file = join(dir, 'cache.json');
    expect(await readCache(file)).toEqual({});
    const cache = { pkg: { hash: 'hash', result: { messages: [] } } };
    await writeFile(file, JSON.stringify(cache));
    expect(await readCache(file)).toEqual(cache);
  });
});
